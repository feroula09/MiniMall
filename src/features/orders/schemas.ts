import { z } from "zod";
import { ORDER_STATUSES } from "@/lib/order-status";
import { firstParam, pageParam } from "@/lib/search-params";

/** 我的訂單列表的網址參數；不合法的值回到預設 */
export const orderListParamsSchema = z.object({
  status: z.preprocess(firstParam, z.enum(ORDER_STATUSES).optional()).catch(undefined),
  page: pageParam,
});

export type OrderListParams = z.infer<typeof orderListParamsSchema>;

export const ORDER_PAGE_SIZE = 10;
