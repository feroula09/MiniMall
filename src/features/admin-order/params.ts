import type { OrderStatus } from "@prisma/client";
import { z } from "zod";
import { ORDER_STATUSES } from "@/lib/order-status";
import { optionalParam, pageParam, type RawSearchParams } from "@/lib/search-params";

export const ADMIN_ORDER_PAGE_SIZE = 20;

export type AdminOrderParams = { status?: OrderStatus; q?: string; page: number };

// 網址參數不合法時回到預設，不讓頁面報錯
const schema = z.object({
  status: z.preprocess(optionalParam, z.enum(ORDER_STATUSES).optional()).catch(undefined),
  // 訂單編號是大寫英數（MM + 18 位數字）：只保留英數字元，貼上時帶的空白與 LIKE 萬用字元（% _）都會去掉；部分比對
  q: z
    .preprocess(
      optionalParam,
      z
        .string()
        .transform((s) => s.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 30) || undefined)
        .optional(),
    )
    .catch(undefined),
  page: pageParam,
});

export function parseAdminOrderParams(raw: RawSearchParams): AdminOrderParams {
  return schema.parse(raw);
}

/** 列表條件的 query string（含 ?）；都是預設值時為空字串 */
function toQuery({ status, q, page }: AdminOrderParams) {
  const search = new URLSearchParams();
  if (status) search.set("status", status);
  if (q) search.set("q", q);
  if (page > 1) search.set("page", String(page));
  const query = search.toString();
  return query ? `?${query}` : "";
}

export function buildAdminOrdersHref(current: AdminOrderParams, overrides: Partial<AdminOrderParams> = {}) {
  return `/admin/orders${toQuery({ ...current, ...overrides })}`;
}

/** 詳情頁連結：帶上目前的列表條件，讓詳情頁的「返回列表」回到同一個篩選與頁碼 */
export function buildAdminOrderDetailHref(orderId: string, list: AdminOrderParams) {
  return `/admin/orders/${orderId}${toQuery(list)}`;
}
