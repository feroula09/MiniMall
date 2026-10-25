import { z } from "zod";
import { optionalParam, pageParam, type RawSearchParams } from "@/lib/search-params";

export const ADMIN_PAGE_SIZE = 20;

export type ActiveFilter = "true" | "false";

export type AdminProductParams = {
  q?: string;
  category?: string;
  active?: ActiveFilter;
  page: number;
};

// 網址參數不合法時回到預設，不讓頁面報錯
const schema = z.object({
  q: z
    .preprocess(optionalParam, z.string().trim().transform((s) => s.slice(0, 50)).optional())
    .catch(undefined),
  category: z.preprocess(optionalParam, z.string().regex(/^[a-z0-9-]+$/).optional()).catch(undefined),
  active: z.preprocess(optionalParam, z.enum(["true", "false"]).optional()).catch(undefined),
  page: pageParam,
});

export function parseAdminProductParams(raw: RawSearchParams): AdminProductParams {
  return schema.parse(raw);
}

export function buildAdminProductsHref(current: AdminProductParams, overrides: Partial<AdminProductParams> = {}) {
  const next = { ...current, ...overrides };
  const search = new URLSearchParams();
  if (next.q) search.set("q", next.q);
  if (next.category) search.set("category", next.category);
  if (next.active) search.set("active", next.active);
  if (next.page > 1) search.set("page", String(next.page));
  const query = search.toString();
  return query ? `/admin/products?${query}` : "/admin/products";
}
