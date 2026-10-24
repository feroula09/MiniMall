"use server";

import { refresh } from "next/cache";
import { fail, failFromZod, type ActionResult, type FieldErrors } from "@/lib/action-result";
import { requireAdmin } from "@/lib/auth-guard";
import {
  DB_BUSY_MESSAGE,
  isDbError,
  isForeignKeyViolation,
  isUniqueViolation,
  uniqueViolationFields,
} from "@/lib/db-errors";
import { isId } from "@/lib/ids";
import { prisma } from "@/lib/prisma";
import { categoryIdSchema, categorySchema, type CategoryInput } from "./schemas";

const PATH = "/admin/categories";

export type CategoryFormState = ActionResult & { values?: Record<keyof CategoryInput, string> };

const text = (formData: FormData, key: string) => {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
};

export async function createCategory(_prev: CategoryFormState, formData: FormData): Promise<CategoryFormState> {
  await requireAdmin(PATH);
  return save(formData);
}

export async function updateCategory(_prev: CategoryFormState, formData: FormData): Promise<CategoryFormState> {
  await requireAdmin(PATH);
  const id = formData.get("id");
  if (!isId(id)) return { ...fail("分類不存在"), values: formValues(formData) };
  return save(formData, id);
}

const formValues = (formData: FormData) => ({
  name: text(formData, "name"),
  slug: text(formData, "slug"),
  sortOrder: text(formData, "sortOrder"),
});

async function save(formData: FormData, id?: string): Promise<CategoryFormState> {
  const values = formValues(formData);
  const parsed = categorySchema.safeParse(values);
  if (!parsed.success) return { ...failFromZod(parsed.error), values };
  const data = parsed.data;

  try {
    const duplicate = await findDuplicate(data, id);
    if (duplicate) return { ...fail("請修正標示的欄位", duplicate), values };

    if (id) {
      const { count } = await prisma.category.updateMany({ where: { id }, data });
      if (count === 0) return { ...fail("分類不存在"), values };
    } else {
      await prisma.category.create({ data });
    }
  } catch (e) {
    // 事前檢查之後才被別人搶先使用：由唯一索引擋下，依資料庫回報的欄位標示錯誤
    if (isUniqueViolation(e)) {
      const fields = uniqueViolationFields(e);
      const errors: FieldErrors = {};
      if (fields.some((f) => f.includes("name"))) errors.name = ["此名稱已被使用"];
      if (fields.some((f) => f.includes("slug"))) errors.slug = ["此 slug 已被使用"];
      return { ...fail("名稱或 slug 已被使用", errors), values };
    }
    if (isDbError(e)) return { ...fail(DB_BUSY_MESSAGE), values };
    throw e;
  }
  refresh();
  return { ok: true };
}

/** 名稱或 slug 和其他分類重複時，回傳對應欄位的錯誤 */
async function findDuplicate(data: CategoryInput, excludeId?: string): Promise<FieldErrors | null> {
  const others = await prisma.category.findMany({
    where: { OR: [{ name: data.name }, { slug: data.slug }], ...(excludeId && { NOT: { id: excludeId } }) },
    select: { name: true, slug: true },
  });
  if (others.length === 0) return null;
  const errors: FieldErrors = {};
  if (others.some((c) => c.name === data.name)) errors.name = ["此名稱已被使用"];
  if (others.some((c) => c.slug === data.slug)) errors.slug = ["此 slug 已被使用"];
  return errors;
}

export async function deleteCategory(input: { id: string }): Promise<ActionResult> {
  await requireAdmin(PATH);
  const parsed = categoryIdSchema.safeParse(input);
  if (!parsed.success) return fail("分類不存在");
  const { id } = parsed.data;

  try {
    const productCount = await prisma.product.count({ where: { categoryId: id } });
    if (productCount > 0) return fail(`此分類下還有 ${productCount} 項商品，請先移動或刪除商品`);

    const { count } = await prisma.category.deleteMany({ where: { id } });
    if (count === 0) return fail("分類不存在");
  } catch (e) {
    // 檢查之後剛好有商品被加進此分類：外鍵 onDelete: Restrict 會擋下（不再重查數量，避免再出錯或數字矛盾）
    if (isForeignKeyViolation(e)) return fail("此分類下仍有商品，請先移動或刪除商品");
    if (isDbError(e)) return fail(DB_BUSY_MESSAGE);
    throw e;
  }
  refresh();
  return { ok: true };
}
