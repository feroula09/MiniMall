import "server-only";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ORDER_PAGE_SIZE, type OrderListParams } from "./schemas";

const listSelect = {
  id: true,
  orderNo: true,
  status: true,
  totalAmount: true,
  createdAt: true,
  items: {
    select: { productName: true, productImage: true, quantity: true },
    orderBy: { id: "asc" },
  },
} satisfies Prisma.OrderSelect;

export type MyOrderListItem = Prisma.OrderGetPayload<{ select: typeof listSelect }>;

/** 我的訂單列表（新到舊），page 超出範圍時夾到最後一頁 */
export async function getMyOrders(userId: string, params: OrderListParams) {
  const where: Prisma.OrderWhereInput = { userId, ...(params.status && { status: params.status }) };
  const findPage = (page: number) =>
    prisma.order.findMany({
      where,
      select: listSelect,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: (page - 1) * ORDER_PAGE_SIZE,
      take: ORDER_PAGE_SIZE,
    });

  const [total, items] = await Promise.all([prisma.order.count({ where }), findPage(params.page)]);
  const pageCount = Math.max(1, Math.ceil(total / ORDER_PAGE_SIZE));
  if (params.page <= pageCount) return { items, total, page: params.page, pageCount };
  return { items: await findPage(pageCount), total, page: pageCount, pageCount };
}

/** 我的訂單詳情：只能取得自己的訂單 */
export async function getMyOrder(userId: string, orderId: string) {
  return prisma.order.findFirst({
    where: { id: orderId, userId },
    select: {
      id: true,
      orderNo: true,
      status: true,
      totalAmount: true,
      receiverName: true,
      phone: true,
      address: true,
      createdAt: true,
      paidAt: true,
      shippedAt: true,
      completedAt: true,
      cancelledAt: true,
      items: {
        select: { id: true, productId: true, productName: true, productImage: true, price: true, quantity: true },
        orderBy: { id: "asc" },
      },
    },
  });
}

export type MyOrderDetail = NonNullable<Awaited<ReturnType<typeof getMyOrder>>>;
