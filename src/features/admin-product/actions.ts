"use server";

import { refresh } from "next/cache";
import { fail, failFromZod, type ActionResult, type FieldErrors } from "@/lib/action-result";
import { requireAdmin } from "@/lib/auth-guard";
import { DB_BUSY_MESSAGE, isDbError, isForeignKeyViolation, isRecordNotFound } from "@/lib/db-errors";
import { formText } from "@/lib/form-data";
import { isId } from "@/lib/ids";
import { imageFileError } from "@/lib/image-type";
import { prisma } from "@/lib/prisma";
import { deleteUploadedImage, pickedFile, saveProductImage } from "@/lib/upload";
import { productIdSchema, productSchema, toggleActiveSchema, type ProductFormValues } from "./schemas";

const PATH = "/admin/products";

export type ProductFormState = ActionResult;

const formValues = (formData: FormData): ProductFormValues => ({
  name: formText(formData, "name"),
  description: formText(formData, "description"),
  price: formText(formData, "price"),
  stock: formText(formData, "stock"),
  categoryId: formText(formData, "categoryId"),
  isActive: formData.get("isActive") === "on",
});

const CATEGORY_MISSING: FieldErrors = { categoryId: ["分類不存在，請重新選擇"] };

export async function createProduct(_prev: ProductFormState, formData: FormData): Promise<ProductFormState> {
  await requireAdmin(`${PATH}/new`);
  return save(formData);
}

export async function updateProduct(_prev: ProductFormState, formData: FormData): Promise<ProductFormState> {
  await requireAdmin(PATH);
  const id = formData.get("id");
  if (!isId(id)) return fail("商品不存在");
  return save(formData, id);
}

/**
 * 新增或更新商品。順序：驗證欄位與圖片 → 確認分類（與舊圖）→ 寫入圖檔 → 寫入資料庫。
 * 資料庫失敗時刪掉剛寫入的圖檔；更新成功且換了圖時才清理舊圖。
 */
async function save(formData: FormData, id?: string): Promise<ProductFormState> {
  const parsed = productSchema.safeParse(formValues(formData));
  const file = pickedFile(formData.get("image"));
  const fileError = file ? imageFileError(file) : null;
  if (!parsed.success || fileError) {
    const base = parsed.success ? fail("請修正標示的欄位") : failFromZod(parsed.error);
    const fieldErrors = { ...(!base.ok && base.fieldErrors), ...(fileError && { image: [fileError] }) };
    return fail("請修正標示的欄位", fieldErrors);
  }
  const data = parsed.data;

  let oldImage: string | null = null;
  try {
    const [category, current] = await Promise.all([
      prisma.category.findUnique({ where: { id: data.categoryId }, select: { id: true } }),
      id ? prisma.product.findUnique({ where: { id }, select: { image: true } }) : null,
    ]);
    if (id && !current) return fail("商品不存在");
    if (!category) return fail("請修正標示的欄位", CATEGORY_MISSING);
    oldImage = current?.image ?? null;
  } catch (e) {
    if (isDbError(e)) return fail(DB_BUSY_MESSAGE);
    throw e;
  }

  let newImage: string | null = null;
  if (file) {
    const saved = await saveProductImage(file);
    if (!saved.ok) return fail("請修正標示的欄位", { image: [saved.error] });
    newImage = saved.path;
  }
  // undefined 表示不變更圖片
  const image = newImage ?? (id && formData.get("removeImage") === "on" ? null : undefined);

  try {
    if (id) {
      const imageChanging = image !== undefined && image !== oldImage;
      const { count } = await prisma.product.updateMany({
        // 換圖時以讀到的舊圖為條件：同時有人換圖的話不覆蓋，避免對方的新圖變成沒人引用的檔案
        where: { id, ...(imageChanging && { image: oldImage }) },
        data: { ...data, ...(imageChanging && { image }) },
      });
      if (count === 0) {
        await deleteUploadedImage(newImage);
        const exists = await prisma.product.count({ where: { id } });
        return fail(exists ? "商品圖片剛被其他人更新，請重新整理後再試" : "商品不存在");
      }
      if (imageChanging) await deleteImageIfUnused(oldImage);
    } else {
      await prisma.product.create({ data: { ...data, image: newImage } });
    }
  } catch (e) {
    // 剛寫入的圖檔還沒有任何地方引用，可以直接刪
    await deleteUploadedImage(newImage);
    // 檢查之後分類剛好被刪除
    if (isForeignKeyViolation(e)) return fail("請修正標示的欄位", CATEGORY_MISSING);
    if (isDbError(e)) return fail(DB_BUSY_MESSAGE);
    throw e;
  }
  refresh();
  return { ok: true };
}

/**
 * 清理不再使用的上傳圖。下單時訂單明細會把商品圖路徑存成快照，
 * 仍被任何訂單明細引用時保留檔案，歷史訂單才看得到圖。
 * 清理失敗只記錄，不影響已完成的商品異動。
 */
async function deleteImageIfUnused(image: string | null) {
  if (!image) return;
  try {
    const referenced = await prisma.orderItem.count({ where: { productImage: image } });
    if (referenced === 0) await deleteUploadedImage(image);
  } catch (e) {
    console.error("清理商品圖片失敗", image, e);
  }
}

/** 直接指定目標狀態（而不是反轉），重複點擊或並發時結果一致 */
export async function toggleProductActive(input: { id: string; isActive: boolean }): Promise<ActionResult> {
  await requireAdmin(PATH);
  const parsed = toggleActiveSchema.safeParse(input);
  if (!parsed.success) return fail("商品不存在");
  const { id, isActive } = parsed.data;

  try {
    const { count } = await prisma.product.updateMany({ where: { id }, data: { isActive } });
    if (count === 0) return fail("商品不存在");
  } catch (e) {
    if (isDbError(e)) return fail(DB_BUSY_MESSAGE);
    throw e;
  }
  refresh();
  return { ok: true };
}

/** 購物車項目隨商品刪除（Cascade）；訂單明細的 productId 設為 null，快照保留 */
export async function deleteProduct(input: { id: string }): Promise<ActionResult> {
  await requireAdmin(PATH);
  const parsed = productIdSchema.safeParse(input);
  if (!parsed.success) return fail("商品不存在");

  let image: string | null;
  try {
    // delete 會回傳被刪除那一筆的圖片，不必先查再刪
    ({ image } = await prisma.product.delete({ where: { id: parsed.data.id }, select: { image: true } }));
  } catch (e) {
    if (isRecordNotFound(e)) return fail("商品不存在");
    if (isDbError(e)) return fail(DB_BUSY_MESSAGE);
    throw e;
  }
  await deleteImageIfUnused(image);
  refresh();
  return { ok: true };
}
