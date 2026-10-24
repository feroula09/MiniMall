import { z } from "zod";
import { firstParam as first, pageParam, type RawSearchParams } from "@/lib/search-params";

export const PAGE_SIZE = 12;

export const SORT_OPTIONS = [
  { value: "newest", label: "最新上架" },
  { value: "price_asc", label: "價格低到高" },
  { value: "price_desc", label: "價格高到低" },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];

export type CatalogParams = {
  q?: string;
  category?: string;
  sort: SortValue;
  page: number;
};

const emptyToUndefined = (v: unknown) => {
  const value = first(v);
  return typeof value === "string" && value.trim() === "" ? undefined : value;
};

// 網址參數是使用者可任意修改的輸入：不合法的值一律回到預設，不讓頁面報錯
const catalogParamsSchema = z.object({
  // 過長的關鍵字截斷而不是丟棄，避免看起來像沒有搜尋
  q: z
    .preprocess(emptyToUndefined, z.string().trim().transform((s) => s.slice(0, 50)).optional())
    .catch(undefined),
  category: z
    .preprocess(emptyToUndefined, z.string().regex(/^[a-z0-9-]+$/).optional())
    .catch(undefined),
  sort: z
    .preprocess(first, z.enum(SORT_OPTIONS.map((o) => o.value) as [SortValue, ...SortValue[]]))
    .catch("newest"),
  page: pageParam,
});

export function parseCatalogParams(raw: RawSearchParams): CatalogParams {
  return catalogParamsSchema.parse(raw);
}

/** 依目前條件產生列表連結；預設值不寫進網址，讓網址保持乾淨 */
export function buildCatalogHref(current: CatalogParams, overrides: Partial<CatalogParams> = {}) {
  const next = { ...current, ...overrides };
  const search = new URLSearchParams();
  if (next.q) search.set("q", next.q);
  if (next.category) search.set("category", next.category);
  if (next.sort !== "newest") search.set("sort", next.sort);
  if (next.page > 1) search.set("page", String(next.page));
  const query = search.toString();
  return query ? `/?${query}` : "/";
}
