import { z } from "zod";

export type FieldErrors = Record<string, string[] | undefined>;

export type ActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: string; fieldErrors?: FieldErrors };

export function fail(error: string, fieldErrors?: FieldErrors): ActionResult<never> {
  return { ok: false, error, fieldErrors };
}

/** zod 驗證失敗時，轉成表單用的欄位錯誤 */
export function failFromZod(error: z.ZodError, message = "請修正標示的欄位"): ActionResult<never> {
  return fail(message, z.flattenError(error).fieldErrors as FieldErrors);
}
