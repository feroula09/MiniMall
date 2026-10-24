import { Prisma } from "@prisma/client";

/** 資料庫暫時性錯誤（例如 SQLite 鎖定）時回給使用者的訊息 */
export const DB_BUSY_MESSAGE = "系統忙碌中，請稍後再試";

export function isDbError(e: unknown): boolean {
  return e instanceof Prisma.PrismaClientKnownRequestError || e instanceof Prisma.PrismaClientUnknownRequestError;
}

export function isUniqueViolation(e: unknown): boolean {
  return e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002";
}
