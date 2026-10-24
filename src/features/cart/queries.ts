import "server-only";
import { prisma } from "@/lib/prisma";
import { summarizeCart } from "./summary";

/** 購物車明細（含商品目前的價格、庫存與上架狀態），依加入順序排列 */
export async function getCartItems(userId: string) {
  return prisma.cartItem.findMany({
    where: { userId },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    select: {
      id: true,
      quantity: true,
      product: {
        select: { id: true, name: true, price: true, stock: true, image: true, isActive: true },
      },
    },
  });
}

export type CartItemData = Awaited<ReturnType<typeof getCartItems>>[number];

/** 頁首角標用：購物車內的件數總和 */
export async function getCartCount(userId: string): Promise<number> {
  const result = await prisma.cartItem.aggregate({ where: { userId }, _sum: { quantity: true } });
  return result._sum.quantity ?? 0;
}

/** 結帳等其他模組用：購物車明細加上檢查結果與合計 */
export async function getCartWithSummary(userId: string) {
  const items = await getCartItems(userId);
  return { items, summary: summarizeCart(items) };
}
