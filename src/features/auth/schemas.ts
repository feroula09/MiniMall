import { z } from "zod";

const email = z.preprocess(
  (v) => (typeof v === "string" ? v.trim().toLowerCase() : v),
  z.email("請輸入有效的 Email").max(254, "Email 過長"),
);

// bcrypt 只取前 72 bytes，超過的部分會被忽略，因此直接拒絕
const password = z
  .string()
  .min(8, "密碼至少 8 個字元")
  .refine((v) => new TextEncoder().encode(v).length <= 72, "密碼過長（上限 72 bytes）");

export const registerSchema = z
  .object({
    name: z.string().trim().min(1, "請輸入名稱").max(30, "名稱最多 30 個字元"),
    email,
    password,
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: "兩次輸入的密碼不一致",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email,
  // 登入時不檢查長度規則，避免透露密碼政策；錯誤一律回「Email 或密碼錯誤」
  password: z.string().min(1, "請輸入密碼").max(200, "Email 或密碼錯誤"),
});
