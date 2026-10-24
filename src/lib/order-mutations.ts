import "server-only";
import type { Prisma } from "@prisma/client";
import { transitionUpdate, type OrderActor } from "./order-status";
import { prisma } from "./prisma";

/**
 * 取消訂單並回補庫存，在單一交易內完成。使用者取消與管理員取消共用。
 * scope 用來限定可取消的訂單（使用者端會帶 userId，確保只能取消自己的）。
 * 回傳 false 代表訂單不存在、不屬於 scope，或目前狀態不能取消。
 */
export async function cancelOrderAndRestock(
  orderId: string,
  actor: OrderActor,
  scope: Prisma.OrderWhereInput = {},
): Promise<boolean> {
  const { where, data } = transitionUpdate("cancel", actor);

  return prisma.$transaction(async (tx) => {
    // 條件式更新先搶下狀態，避免兩個取消請求各自回補一次庫存
    const { count } = await tx.order.updateMany({ where: { id: orderId, ...scope, ...where }, data });
    if (count === 0) return false;

    const items = await tx.orderItem.findMany({
      where: { orderId, productId: { not: null } },
      select: { productId: true, quantity: true },
    });
    for (const item of items) {
      await tx.product.update({ where: { id: item.productId! }, data: { stock: { increment: item.quantity } } });
    }
    return true;
  });
}

/**
 * 條件式更新沒有改到任何訂單時，判斷原因：
 * 訂單不在 scope 內（不存在或不是自己的）→「訂單不存在」；否則是狀態已被改變 → conflictMessage。
 * stale 為 true 時，呼叫端應 refresh() 讓畫面顯示最新狀態。
 */
export async function explainOrderConflict(
  orderId: string,
  scope: Prisma.OrderWhereInput,
  conflictMessage: string,
): Promise<{ error: string; stale: boolean }> {
  const exists = (await prisma.order.count({ where: { id: orderId, ...scope } })) > 0;
  return exists ? { error: conflictMessage, stale: true } : { error: "訂單不存在", stale: false };
}
