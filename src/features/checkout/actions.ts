"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { fail, failFromZod, type ActionResult } from "@/lib/action-result";
import { requireUser } from "@/lib/auth-guard";
import { DB_BUSY_MESSAGE, isDbError, isUniqueViolation } from "@/lib/db-errors";
import { isId, orderIdSchema } from "@/lib/ids";
import { orderConflict } from "@/lib/order-mutations";
import { generateOrderNo } from "@/lib/order-no";
import { transitionUpdate } from "@/lib/order-status";
import { formText } from "@/lib/form-data";
import { prisma } from "@/lib/prisma";
import { checkoutSchema, expectedTotalSchema, type CheckoutInput } from "./schemas";

export type CheckoutFormState = ActionResult & { values?: Partial<CheckoutInput> };

/** 交易內的業務錯誤：拋出以回滾整筆交易，訊息直接給使用者看 */
class CheckoutError extends Error {
  constructor(message: string, readonly refreshPage = false) {
    super(message);
  }
}

export async function placeOrder(_prev: CheckoutFormState, formData: FormData): Promise<CheckoutFormState> {
  const user = await requireUser("/checkout");
  const values = {
    receiverName: formText(formData, "receiverName"),
    phone: formText(formData, "phone"),
    address: formText(formData, "address"),
  };
  const parsed = checkoutSchema.safeParse(values);
  if (!parsed.success) return { ...failFromZod(parsed.error), values };
  const expectedTotal = expectedTotalSchema.safeParse(formData.get("expectedTotal"));
  if (!expectedTotal.success) return { ...fail("頁面資料已過期，請重新整理後再下單"), values };

  let orderId: string;
  try {
    orderId = await createOrderWithRetry(user.id, parsed.data, expectedTotal.data);
  } catch (e) {
    if (e instanceof CheckoutError) {
      // 價格或內容有變時重新渲染結帳頁，讓使用者看到最新金額
      if (e.refreshPage) refresh();
      return { ...fail(e.message), values };
    }
    if (isDbError(e)) return { ...fail(DB_BUSY_MESSAGE), values };
    throw e;
  }
  // 購物車已清空：先刷新共用 layout（頁首角標），再導向付款頁
  refresh();
  redirect(`/orders/${orderId}/pay`);
}

/** 訂單編號極少數情況會撞號（同一秒 + 同一組亂數），撞號時整筆重試 */
async function createOrderWithRetry(
  userId: string,
  input: CheckoutInput,
  expectedTotal: number,
  attempts = 3,
): Promise<string> {
  for (let i = 1; ; i++) {
    try {
      return await createOrder(userId, input, expectedTotal);
    } catch (e) {
      if (i < attempts && isUniqueViolation(e)) continue;
      throw e;
    }
  }
}

/**
 * 單一交易內完成：讀購物車 → 條件扣減庫存（防超賣）→ 以伺服器端價格計算並與使用者看到的金額比對
 * → 建立訂單與明細快照 → 清空購物車。任何一步失敗都會回滾，不會出現扣了庫存卻沒有訂單的情況。
 */
async function createOrder(userId: string, input: CheckoutInput, expectedTotal: number): Promise<string> {
  return prisma.$transaction(async (tx) => {
    const items = await tx.cartItem.findMany({
      where: { userId },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      select: {
        quantity: true,
        product: { select: { id: true, name: true, price: true, image: true } },
      },
    });
    if (items.length === 0) throw new CheckoutError("購物車是空的", true);

    for (const { product, quantity } of items) {
      const { count } = await tx.product.updateMany({
        where: { id: product.id, isActive: true, stock: { gte: quantity } },
        data: { stock: { decrement: quantity } },
      });
      if (count === 0) throw new CheckoutError(`「${product.name}」已下架或庫存不足，請回購物車調整`);
    }

    const totalAmount = items.reduce((sum, { product, quantity }) => sum + product.price * quantity, 0);
    if (totalAmount !== expectedTotal) {
      throw new CheckoutError("商品價格或內容有異動，已更新為最新金額，請確認後再下單", true);
    }
    const order = await tx.order.create({
      data: {
        orderNo: generateOrderNo(),
        userId,
        totalAmount,
        ...input,
        items: {
          create: items.map(({ product, quantity }) => ({
            productId: product.id,
            productName: product.name,
            productImage: product.image,
            price: product.price,
            quantity,
          })),
        },
      },
      select: { id: true },
    });

    await tx.cartItem.deleteMany({ where: { userId } });
    return order.id;
  });
}

export async function payOrder(input: { orderId: string }): Promise<ActionResult> {
  const rawId = input?.orderId;
  const user = await requireUser(isId(rawId) ? `/orders/${rawId}/pay` : "/");
  const parsed = orderIdSchema.safeParse(input);
  if (!parsed.success) return fail("訂單不存在");
  const { orderId } = parsed.data;

  try {
    // 條件式更新：只有本人的待付款訂單會被改成已付款，同時按兩次也只會成功一次
    const { where, data } = transitionUpdate("pay", "user");
    const { count } = await prisma.order.updateMany({ where: { id: orderId, userId: user.id, ...where }, data });
    if (count === 0) return await orderConflict(orderId, { userId: user.id }, "訂單狀態已變更，無法付款");
  } catch (e) {
    if (isDbError(e)) return fail(DB_BUSY_MESSAGE);
    throw e;
  }
  refresh();
  return { ok: true };
}
