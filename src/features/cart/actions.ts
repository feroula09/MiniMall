"use server";

import { refresh } from "next/cache";
import { fail, type ActionResult } from "@/lib/action-result";
import { requireUser } from "@/lib/auth-guard";
import { isId } from "@/lib/ids";
import { DB_BUSY_MESSAGE as BUSY, isDbError, isUniqueViolation } from "@/lib/db-errors";
import { prisma } from "@/lib/prisma";
import { purchaseLimit } from "@/lib/purchase-limit";
import { addToCartSchema, removeCartItemSchema, updateCartItemSchema } from "./schemas";
import { checkAddQuantity } from "./summary";

// 資料都沒有快取，異動後用 refresh() 讓頁首角標與購物車頁重新渲染

export async function addToCart(input: { productId: string; quantity: number }): Promise<ActionResult> {
  // 先確認登入；未登入時導向登入頁，登入後回到該商品（id 格式不對就回首頁）
  const rawId = input?.productId;
  const back = isId(rawId) ? `/products/${rawId}` : "/";
  const user = await requireUser(back);

  const parsed = addToCartSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "資料格式錯誤");

  try {
    const error = await addQuantity(user.id, parsed.data.productId, parsed.data.quantity);
    if (error) return fail(error);
  } catch (e) {
    if (isDbError(e)) return fail(BUSY);
    throw e;
  }
  refresh();
  return { ok: true };
}

/**
 * 以條件式更新累加數量：只有「現有數量 + 新增數量 ≤ 上限」時才寫入，
 * 同時送出的兩個請求不會讓數量超過庫存。回傳錯誤訊息或 null。
 */
async function addQuantity(userId: string, productId: string, quantity: number): Promise<string | null> {
  const product = await prisma.product.findFirst({
    where: { id: productId, isActive: true },
    select: { stock: true },
  });
  if (!product) return "商品不存在或已下架";
  const limit = purchaseLimit(product.stock);

  const incrementWithinLimit = () =>
    prisma.cartItem.updateMany({
      where: { userId, productId, quantity: { lte: limit - quantity } },
      data: { quantity: { increment: quantity } },
    });
  const explain = async () => {
    const existing = await prisma.cartItem.findUnique({
      where: { userId_productId: { userId, productId } },
      select: { quantity: true },
    });
    return checkAddQuantity(existing?.quantity ?? 0, quantity, product.stock) ?? BUSY;
  };

  if ((await incrementWithinLimit()).count === 1) return null;

  const inCart = await prisma.cartItem.count({ where: { userId, productId } });
  if (inCart > 0 || quantity > limit) return explain();

  try {
    await prisma.cartItem.create({ data: { userId, productId, quantity } });
    return null;
  } catch (e) {
    // 另一個請求剛好先建立了同一項目：改走一次條件累加
    if (isUniqueViolation(e)) {
      return (await incrementWithinLimit()).count === 1 ? null : explain();
    }
    throw e;
  }
}

export async function updateCartItem(input: { itemId: string; quantity: number }): Promise<ActionResult> {
  const user = await requireUser("/cart");
  const parsed = updateCartItemSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "資料格式錯誤");
  const { itemId, quantity } = parsed.data;

  try {
    // 以 userId 一起查詢與更新，確保只能改自己的購物車
    const item = await prisma.cartItem.findFirst({
      where: { id: itemId, userId: user.id },
      select: { product: { select: { stock: true, isActive: true } } },
    });
    if (!item) return fail("購物車項目不存在");
    if (!item.product.isActive) return fail("商品已下架，請移除此項目");

    const limit = purchaseLimit(item.product.stock);
    if (quantity > limit) return fail(limit > 0 ? `最多只能購買 ${limit} 件` : "已售完，請移除此項目");

    // 項目可能剛被另一個分頁刪除：用 updateMany 以 count 判斷，不會拋錯
    const { count } = await prisma.cartItem.updateMany({ where: { id: itemId, userId: user.id }, data: { quantity } });
    if (count === 0) return fail("購物車項目不存在");
  } catch (e) {
    if (isDbError(e)) return fail(BUSY);
    throw e;
  }
  refresh();
  return { ok: true };
}

export async function removeCartItem(input: { itemId: string }): Promise<ActionResult> {
  const user = await requireUser("/cart");
  const parsed = removeCartItemSchema.safeParse(input);
  if (!parsed.success) return fail("資料格式錯誤");

  try {
    await prisma.cartItem.deleteMany({ where: { id: parsed.data.itemId, userId: user.id } });
  } catch (e) {
    if (isDbError(e)) return fail(BUSY);
    throw e;
  }
  refresh();
  return { ok: true };
}
