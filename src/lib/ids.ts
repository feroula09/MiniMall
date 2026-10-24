import { z } from "zod";

/** 資料表主鍵（cuid）格式；只用來擋掉明顯不合法的輸入，存在與否仍以資料庫為準 */
export const idSchema = z.string().regex(/^[a-z0-9]{1,64}$/i, "id 格式錯誤");

export function isId(value: unknown): value is string {
  return idSchema.safeParse(value).success;
}
