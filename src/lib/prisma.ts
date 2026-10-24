import "server-only";
import { PrismaClient } from "@prisma/client";

// 開發模式熱更新會重新載入模組，掛在 globalThis 避免重複建立連線
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
