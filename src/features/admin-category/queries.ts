import "server-only";
import { prisma } from "@/lib/prisma";

/** 後台分類列表，含各分類的商品數 */
export async function getAdminCategories() {
  return prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, name: true, slug: true, sortOrder: true, _count: { select: { products: true } } },
  });
}

export type AdminCategory = Awaited<ReturnType<typeof getAdminCategories>>[number];
