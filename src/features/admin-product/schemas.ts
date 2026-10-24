import { z } from "zod";
import { idSchema, isId } from "@/lib/ids";
import { yuanToCents } from "@/lib/money";

export const MAX_PRICE_CENTS = 100_000_000; // 100 萬元
export const MAX_STOCK = 99_999;

/** 表單送來的原始字串；isActive 由 checkbox 是否勾選轉成布林 */
export type ProductFormValues = {
  name: string;
  description: string;
  price: string;
  stock: string;
  categoryId: string;
  isActive: boolean;
};

export const productSchema = z.object({
  name: z.string().trim().min(1, "請輸入商品名稱").max(100, "名稱最多 100 個字元"),
  description: z.string().trim().max(2000, "描述最多 2000 個字元"),
  // 以「元」輸入，最多兩位小數，轉成分
  price: z
    .string()
    .trim()
    .min(1, "請輸入價格")
    .transform((s, ctx) => {
      const cents = yuanToCents(s);
      if (cents === null) {
        ctx.addIssue({ code: "custom", message: "價格格式錯誤，最多兩位小數" });
        return z.NEVER;
      }
      return cents;
    })
    .pipe(z.number().min(1, "價格必須大於 0").max(MAX_PRICE_CENTS, "價格不可超過 1,000,000 元")),
  // 只接受十進位整數字串，擋掉 1e3、0x10、1.5 這類寫法
  stock: z
    .string()
    .trim()
    .min(1, "請輸入庫存")
    .regex(/^\d+$/, "庫存必須是 0 以上的整數")
    .transform(Number)
    .pipe(z.number().max(MAX_STOCK, `庫存不可超過 ${MAX_STOCK.toLocaleString()}`)),
  categoryId: z.string().min(1, "請選擇分類").refine(isId, "分類不存在"),
  isActive: z.boolean(),
});

export type ProductInput = z.infer<typeof productSchema>;

export const productIdSchema = z.object({ id: idSchema });

export const toggleActiveSchema = z.object({ id: idSchema, isActive: z.boolean() });
