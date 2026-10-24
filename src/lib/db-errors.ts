import { Prisma } from "@prisma/client";

/** 資料庫暫時性錯誤（例如 SQLite 鎖定）時回給使用者的訊息 */
export const DB_BUSY_MESSAGE = "系統忙碌中，請稍後再試";

export function isDbError(e: unknown): boolean {
  return e instanceof Prisma.PrismaClientKnownRequestError || e instanceof Prisma.PrismaClientUnknownRequestError;
}

export function isUniqueViolation(e: unknown): boolean {
  return e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002";
}

/** 唯一索引衝突時，資料庫回報的欄位名稱（例如 ["slug"]）；取不到時為空陣列 */
export function uniqueViolationFields(e: unknown): string[] {
  if (!(e instanceof Prisma.PrismaClientKnownRequestError) || e.code !== "P2002") return [];
  const target = e.meta?.target;
  if (Array.isArray(target)) return target.map(String);
  return typeof target === "string" ? [target] : [];
}

/** update / delete 找不到要操作的資料 */
export function isRecordNotFound(e: unknown): boolean {
  return e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025";
}

/** 外鍵限制（例如分類下仍有商品時刪除分類） */
export function isForeignKeyViolation(e: unknown): boolean {
  return e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2003";
}
