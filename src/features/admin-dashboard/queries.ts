import "server-only";
import { REVENUE_STATUSES } from "@/lib/order-status";
import { prisma } from "@/lib/prisma";

export const LOW_STOCK_THRESHOLD = 5;
const LOW_STOCK_LIST_SIZE = 5;

export async function getDashboardStats() {
  const lowStockWhere = { isActive: true, stock: { lte: LOW_STOCK_THRESHOLD } };
  const [productGroups, orderGroups, recentOrders, lowStock, lowStockCount] = await Promise.all([
    prisma.product.groupBy({ by: ["isActive"], _count: { _all: true } }),
    prisma.order.groupBy({ by: ["status"], _count: { _all: true }, _sum: { totalAmount: true } }),
    prisma.order.findMany({
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: 5,
      select: { id: true, orderNo: true, status: true, totalAmount: true, createdAt: true, user: { select: { name: true } } },
    }),
    prisma.product.findMany({
      where: lowStockWhere,
      orderBy: [{ stock: "asc" }, { name: "asc" }],
      take: LOW_STOCK_LIST_SIZE,
      select: { id: true, name: true, stock: true },
    }),
    prisma.product.count({ where: lowStockWhere }),
  ]);

  const sumCount = (groups: { _count: { _all: number } }[]) => groups.reduce((n, g) => n + g._count._all, 0);

  return {
    productCount: sumCount(productGroups),
    activeProductCount: productGroups.find((g) => g.isActive)?._count._all ?? 0,
    orderCount: sumCount(orderGroups),
    toShipCount: orderGroups.find((g) => g.status === "PAID")?._count._all ?? 0,
    paidRevenue: orderGroups
      .filter((g) => REVENUE_STATUSES.includes(g.status))
      .reduce((sum, g) => sum + (g._sum.totalAmount ?? 0), 0),
    recentOrders,
    lowStock,
    /** 清單只列前幾項，這是符合條件的總數 */
    lowStockCount,
  };
}
