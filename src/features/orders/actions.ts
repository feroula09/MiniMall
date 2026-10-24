"use server";

import { refresh } from "next/cache";
import { fail, type ActionResult } from "@/lib/action-result";
import { requireUser } from "@/lib/auth-guard";
import { DB_BUSY_MESSAGE, isDbError } from "@/lib/db-errors";
import { isId } from "@/lib/ids";
import { cancelOrderAndRestock, explainOrderConflict } from "@/lib/order-mutations";
import { transitionUpdate } from "@/lib/order-status";
import { prisma } from "@/lib/prisma";
import { orderIdSchema } from "./schemas";

const backTo = (orderId: unknown) => (isId(orderId) ? `/orders/${orderId}` : "/orders");

/** 狀態衝突時回傳錯誤；訂單仍存在代表畫面已過期，順便刷新 */
async function conflict(orderId: string, userId: string, message: string): Promise<ActionResult> {
  const { error, stale } = await explainOrderConflict(orderId, { userId }, message);
  if (stale) refresh();
  return fail(error);
}

export async function cancelOrder(input: { orderId: string }): Promise<ActionResult> {
  const user = await requireUser(backTo(input?.orderId));
  const parsed = orderIdSchema.safeParse(input);
  if (!parsed.success) return fail("訂單不存在");
  const { orderId } = parsed.data;

  try {
    const cancelled = await cancelOrderAndRestock(orderId, "user", { userId: user.id });
    if (!cancelled) return conflict(orderId, user.id, "此訂單目前無法取消（已出貨、已完成或已取消）");
  } catch (e) {
    if (isDbError(e)) return fail(DB_BUSY_MESSAGE);
    throw e;
  }
  refresh();
  return { ok: true };
}

export async function confirmReceipt(input: { orderId: string }): Promise<ActionResult> {
  const user = await requireUser(backTo(input?.orderId));
  const parsed = orderIdSchema.safeParse(input);
  if (!parsed.success) return fail("訂單不存在");
  const { orderId } = parsed.data;

  try {
    const { where, data } = transitionUpdate("confirm", "user");
    const { count } = await prisma.order.updateMany({ where: { id: orderId, userId: user.id, ...where }, data });
    if (count === 0) return conflict(orderId, user.id, "訂單尚未出貨或已結束");
  } catch (e) {
    if (isDbError(e)) return fail(DB_BUSY_MESSAGE);
    throw e;
  }
  refresh();
  return { ok: true };
}
