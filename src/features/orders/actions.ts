"use server";

import { refresh } from "next/cache";
import { fail, type ActionResult } from "@/lib/action-result";
import { requireUser } from "@/lib/auth-guard";
import { DB_BUSY_MESSAGE, isDbError } from "@/lib/db-errors";
import { isId, orderIdSchema } from "@/lib/ids";
import { cancelOrderAndRestock, orderConflict } from "@/lib/order-mutations";
import { transitionUpdate } from "@/lib/order-status";
import { prisma } from "@/lib/prisma";

const backTo = (orderId: unknown) => (isId(orderId) ? `/orders/${orderId}` : "/orders");

export async function cancelOrder(input: { orderId: string }): Promise<ActionResult> {
  const user = await requireUser(backTo(input?.orderId));
  const parsed = orderIdSchema.safeParse(input);
  if (!parsed.success) return fail("訂單不存在");
  const { orderId } = parsed.data;

  try {
    const cancelled = await cancelOrderAndRestock(orderId, "user", { userId: user.id });
    if (!cancelled) return await orderConflict(orderId, { userId: user.id }, "此訂單目前無法取消（已出貨、已完成或已取消）");
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
    if (count === 0) return await orderConflict(orderId, { userId: user.id }, "訂單尚未出貨或已結束");
  } catch (e) {
    if (isDbError(e)) return fail(DB_BUSY_MESSAGE);
    throw e;
  }
  refresh();
  return { ok: true };
}
