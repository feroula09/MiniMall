import "server-only";
import { prisma } from "@/lib/prisma";

/** 付款頁用：只取得自己的訂單 */
export async function getOrderForPayment(userId: string, orderId: string) {
  return prisma.order.findFirst({
    where: { id: orderId, userId },
    select: {
      id: true,
      orderNo: true,
      status: true,
      totalAmount: true,
      receiverName: true,
      paidAt: true,
      items: { select: { quantity: true } },
    },
  });
}

export type PaymentOrder = NonNullable<Awaited<ReturnType<typeof getOrderForPayment>>>;
