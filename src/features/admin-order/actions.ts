"use server";

import { refresh } from "next/cache";
import { fail, type ActionResult } from "@/lib/action-result";
import { requireAdmin } from "@/lib/auth-guard";
import { DB_BUSY_MESSAGE, isDbError } from "@/lib/db-errors";
import { orderIdSchema } from "@/lib/ids";
import { cancelOrderAndRestock, orderConflict } from "@/lib/order-mutations";
import { transitionUpdate } from "@/lib/order-status";
import { prisma } from "@/lib/prisma";

const PATH = "/admin/orders";

export async function shipOrder(input: { orderId: string }): Promise<ActionResult> {
  await requireAdmin(PATH);
  const parsed = orderIdSchema.safeParse(input);
  if (!parsed.success) return fail("訂單不存在");
  const { orderId } = parsed.data;

  try {
    const { where, data } = transitionUpdate("ship", "admin");
    const { count } = await prisma.order.updateMany({ where: { id: orderId, ...where }, data });
    if (count === 0) return await orderConflict(orderId, {}, "只有已付款的訂單可以出貨（訂單狀態可能剛被變更）");
  } catch (e) {
    if (isDbError(e)) return fail(DB_BUSY_MESSAGE);
    throw e;
  }
  refresh();
  return { ok: true };
}

/** 取消待付款或已付款的訂單並回補庫存（已付款視為模擬退款） */
export async function adminCancelOrder(input: { orderId: string }): Promise<ActionResult> {
  await requireAdmin(PATH);
  const parsed = orderIdSchema.safeParse(input);
  if (!parsed.success) return fail("訂單不存在");
  const { orderId } = parsed.data;

  try {
    const cancelled = await cancelOrderAndRestock(orderId, "admin");
    if (!cancelled) return await orderConflict(orderId, {}, "此訂單目前無法取消（已出貨、已完成或已取消）");
  } catch (e) {
    if (isDbError(e)) return fail(DB_BUSY_MESSAGE);
    throw e;
  }
  refresh();
  return { ok: true };
}
