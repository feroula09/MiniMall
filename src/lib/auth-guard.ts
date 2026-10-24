import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";
import { prisma } from "./prisma";
import { loginHref } from "./safe-redirect";
import { readSession } from "./session";

export type CurrentUser = { id: string; name: string; email: string; role: Role };

/**
 * 目前登入的使用者，從資料庫讀取（角色以資料庫為準，不信任 JWT 內的 role）。
 * 讀取 cookies，呼叫端必須在 Suspense 內。同一請求內只查一次。
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const session = await readSession();
  if (!session) return null;
  return prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, email: true, role: true },
  });
});

/** 未登入時導向登入頁，登入後回到 nextPath */
export async function requireUser(nextPath: string): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect(loginHref(nextPath));
  return user;
}

/** 非管理員導回首頁 */
export async function requireAdmin(nextPath: string): Promise<CurrentUser> {
  const user = await requireUser(nextPath);
  if (user.role !== "ADMIN") redirect("/");
  return user;
}
