import { z } from "zod";
import { idSchema } from "@/lib/ids";

export const categorySchema = z.object({
  name: z.string().trim().min(1, "請輸入分類名稱").max(20, "名稱最多 20 個字元"),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "請輸入 slug")
    .max(40, "slug 最多 40 個字元")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "只能使用小寫英文、數字與連字號，且不可以連字號開頭或結尾"),
  // 留空視為 0（排在最前）；只接受十進位數字字串，擋掉 0x10、1e3 這類 Number() 也能解析的寫法
  sortOrder: z.preprocess(
    (v) => {
      if (typeof v !== "string") return v;
      const t = v.trim();
      if (t === "") return 0;
      return /^-?\d+(\.\d+)?$/.test(t) ? t : Number.NaN;
    },
    z.coerce
      .number({ error: "排序必須是數字" })
      .int("排序必須是整數")
      .min(0, "排序不可小於 0")
      .max(9999, "排序不可大於 9999"),
  ),
});

export type CategoryInput = z.infer<typeof categorySchema>;

export const categoryIdSchema = z.object({ id: idSchema });
