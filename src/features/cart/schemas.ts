import { z } from "zod";
import { idSchema as id } from "@/lib/ids";
import { MAX_QUANTITY_PER_ITEM } from "@/lib/purchase-limit";
const quantity = z
  .number({ error: "數量格式錯誤" })
  .int("數量必須是整數")
  .min(1, "數量至少為 1")
  .max(MAX_QUANTITY_PER_ITEM, `每項商品最多 ${MAX_QUANTITY_PER_ITEM} 件`);

export const addToCartSchema = z.object({ productId: id, quantity });
export const updateCartItemSchema = z.object({ itemId: id, quantity });
export const removeCartItemSchema = z.object({ itemId: id });
