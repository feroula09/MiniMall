import "server-only";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ADMIN_PAGE_SIZE, type AdminProductParams } from "./params";

const listSelect = {
  id: true,
  name: true,
  price: true,
  stock: true,
  image: true,
  isActive: true,
  category: { select: { name: true } },
} satisfies Prisma.ProductSelect;

export type AdminProductRow = Prisma.ProductGetPayload<{ select: typeof listSelect }>;

/** 後台商品列表（含下架商品）。page 超出範圍時夾到最後一頁 */
export async function getAdminProducts(params: AdminProductParams) {
  const where: Prisma.ProductWhereInput = {
    // SQLite 的 LIKE 對 ASCII 不分大小寫
    ...(params.q && { name: { contains: params.q } }),
    ...(params.category && { category: { slug: params.category } }),
    ...(params.active && { isActive: params.active === "true" }),
  };

  const findPage = (page: number) =>
    prisma.product.findMany({
      where,
      select: listSelect,
      orderBy: [{ createdAt: "desc" }, { id: "asc" }],
      skip: (page - 1) * ADMIN_PAGE_SIZE,
      take: ADMIN_PAGE_SIZE,
    });

  const [total, items] = await Promise.all([prisma.product.count({ where }), findPage(params.page)]);
  const pageCount = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE));
  if (params.page <= pageCount) return { items, total, page: params.page, pageCount };
  return { items: await findPage(pageCount), total, page: pageCount, pageCount };
}

/** 編輯用：不存在時回傳 null（下架商品也要能編輯） */
export async function getAdminProduct(id: string) {
  return prisma.product.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      stock: true,
      image: true,
      isActive: true,
      categoryId: true,
    },
  });
}

export type AdminProductDetail = NonNullable<Awaited<ReturnType<typeof getAdminProduct>>>;
