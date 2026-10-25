import "server-only";
import type { Prisma } from "@prisma/client";
import { refresh } from "next/cache";
import { fail, type ActionResult } from "./action-result";
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
 * 條件式更新沒有改到任何訂單時，回傳給前端的結果：
 * 訂單不在 scope 內（不存在或不是自己的）→「訂單不存在」；
 * 否則是狀態剛被改變 → conflictMessage，並 refresh() 讓畫面顯示最新狀態。只能在 Server Action 內呼叫。
 */
export async function orderConflict(
  orderId: string,
  scope: Prisma.OrderWhereInput,
  conflictMessage: string,
): Promise<ActionResult> {
  const exists = (await prisma.order.count({ where: { id: orderId, ...scope } })) > 0;
  if (!exists) return fail("訂單不存在");
  refresh();
  return fail(conflictMessage);
}
