import "server-only";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { PAGE_SIZE, type CatalogParams, type SortValue } from "./params";

export type CategoryOption = { id: string; name: string; slug: string };

export async function getCategories(): Promise<CategoryOption[]> {
  return prisma.category.findMany({
    select: { id: true, name: true, slug: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}

const productCardSelect = {
  id: true,
  name: true,
  price: true,
  stock: true,
  image: true,
  category: { select: { name: true, slug: true } },
} satisfies Prisma.ProductSelect;

export type ProductCardData = Prisma.ProductGetPayload<{ select: typeof productCardSelect }>;

// id 作為次要排序，確保同價格或同時間的商品在分頁間順序固定
const orderByMap: Record<SortValue, Prisma.ProductOrderByWithRelationInput[]> = {
  newest: [{ createdAt: "desc" }, { id: "asc" }],
  price_asc: [{ price: "asc" }, { id: "asc" }],
  price_desc: [{ price: "desc" }, { id: "asc" }],
};

export type ProductPage = {
  items: ProductCardData[];
  total: number;
  page: number;
  pageCount: number;
};

/** 前台商品列表：只列出上架中的商品。page 超出範圍時夾到最後一頁 */
export async function getProducts(params: CatalogParams): Promise<ProductPage> {
  const where: Prisma.ProductWhereInput = {
    isActive: true,
    // SQLite 的 LIKE 對 ASCII 不分大小寫；Prisma 在 SQLite 不支援 mode: "insensitive"
    ...(params.q && {
      OR: [{ name: { contains: params.q } }, { description: { contains: params.q } }],
    }),
    ...(params.category && { category: { slug: params.category } }),
  };

  const findPage = (page: number) =>
    prisma.product.findMany({
      where,
      select: productCardSelect,
      orderBy: orderByMap[params.sort],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    });

  // 一般情況兩個查詢並行；只有頁碼超出範圍（少見）時才補查最後一頁
  const [total, items] = await Promise.all([prisma.product.count({ where }), findPage(params.page)]);
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (params.page <= pageCount) {
    return { items, total, page: params.page, pageCount };
  }
  return { items: await findPage(pageCount), total, page: pageCount, pageCount };
}
