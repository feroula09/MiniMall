import { z } from "zod";

// 網址參數是使用者可任意修改的輸入：重複的參數取第一個，不合法的值一律回到預設

export type RawSearchParams = Record<string, string | string[] | undefined>;

export const firstParam = (v: unknown) => (Array.isArray(v) ? v[0] : v);

/** 取第一個值；空白字串視為沒有帶參數（例如 GET 表單送出的空欄位） */
export const optionalParam = (v: unknown) => {
  const value = firstParam(v);
  return typeof value === "string" && value.trim() === "" ? undefined : value;
};

/** 頁碼：1 ～ 10000 的整數，不合法時為 1 */
export const pageParam = z.preprocess(firstParam, z.coerce.number().int().min(1).max(10_000)).catch(1);
