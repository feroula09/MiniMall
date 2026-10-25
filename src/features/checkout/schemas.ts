import { z } from "zod";

export const checkoutSchema = z.object({
  receiverName: z.string().trim().min(1, "請輸入收件人").max(30, "收件人最多 30 個字元"),
  // 允許輸入 0912-345-678 或 0912 345 678，存入前去掉空白與連字號
  phone: z
    .string()
    .transform((v) => v.replace(/[\s-]/g, ""))
    .pipe(z.string().regex(/^09\d{8}$/, "請輸入 09 開頭的 10 碼手機號碼")),
  address: z.string().trim().min(5, "地址至少 5 個字元").max(200, "地址最多 200 個字元"),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

/** 使用者在結帳頁看到的合計（分），下單時與伺服器端計算的金額比對 */
export const expectedTotalSchema = z.coerce.number().int().nonnegative();

