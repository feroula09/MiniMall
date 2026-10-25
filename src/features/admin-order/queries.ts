import "server-only";
import type { OrderStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ADMIN_ORDER_PAGE_SIZE, type AdminOrderParams } from "./params";

const buyerSelect = { select: { name: true, email: true } } satisfies Prisma.UserDefaultArgs;

const listSelect = {
  id: true,
  orderNo: true,
  status: true,
  totalAmount: true,
  createdAt: true,
  user: buyerSelect,
  items: { select: { quantity: true } },
} satisfies Prisma.OrderSelect;

export type AdminOrderRow = Prisma.OrderGetPayload<{ select: typeof listSelect }>;

const searchWhere = (q?: string): Prisma.OrderWhereInput => (q ? { orderNo: { contains: q } } : {});

export type StatusCounts = Partial<Record<OrderStatus, number>>;

/**
 * 後台訂單列表（新到舊）與各狀態的數量。page 超出範圍時夾到最後一頁。
 * 狀態數量套用訂單編號搜尋、不套用狀態篩選（給分頁標籤顯示）；總數也由它算出，不另外 count。
 */
export async function getAdminOrders(params: AdminOrderParams) {
  const where: Prisma.OrderWhereInput = {
    ...searchWhere(params.q),
    ...(params.status && { status: params.status }),
  };
  const findPage = (page: number) =>
    prisma.order.findMany({
      where,
      select: listSelect,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: (page - 1) * ADMIN_ORDER_PAGE_SIZE,
      take: ADMIN_ORDER_PAGE_SIZE,
    });

  const [groups, items] = await Promise.all([
    prisma.order.groupBy({ by: ["status"], where: searchWhere(params.q), _count: { _all: true } }),
    findPage(params.page),
  ]);
  const counts: StatusCounts = Object.fromEntries(groups.map((g) => [g.status, g._count._all]));
  const total = params.status ? (counts[params.status] ?? 0) : groups.reduce((n, g) => n + g._count._all, 0);
  const pageCount = Math.max(1, Math.ceil(total / ADMIN_ORDER_PAGE_SIZE));
  if (params.page <= pageCount) return { items, counts, page: params.page, pageCount };
  return { items: await findPage(pageCount), counts, page: pageCount, pageCount };
}

/** 後台訂單詳情（任何使用者的訂單），含買家資料 */
export async function getAdminOrder(id: string) {
  return prisma.order.findUnique({
    where: { id },
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
      user: buyerSelect,
      items: {
        select: { id: true, productId: true, productName: true, productImage: true, price: true, quantity: true },
        orderBy: { id: "asc" },
      },
    },
  });
}
