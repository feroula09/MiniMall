import "server-only";
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL 未設定"),
  SESSION_SECRET: z.string().min(32, "SESSION_SECRET 至少需要 32 個字元，請參考 .env.example"),
});

let cached: z.infer<typeof envSchema> | undefined;

/** 第一次使用時驗證環境變數，設定錯誤直接拋錯，不會用空金鑰簽 JWT */
export function getEnv() {
  if (!cached) {
    const result = envSchema.safeParse(process.env);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message).join("；");
      throw new Error(`環境變數設定錯誤：${messages}`);
    }
    cached = result.data;
  }
  return cached;
}
