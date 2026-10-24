import { NextResponse, type NextRequest } from "next/server";
import { getEnv } from "@/lib/env";
import { loginHref } from "@/lib/safe-redirect";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session-token";

/**
 * 只做導向（樂觀檢查）：讀 cookie 驗簽章，不查資料庫。
 * 不判斷角色：角色以資料庫為準，由各頁面與 Server Action 的 requireUser / requireAdmin 負責。
 */
export async function proxy(request: NextRequest) {
  const session = await verifySessionToken(
    request.cookies.get(SESSION_COOKIE)?.value,
    getEnv().SESSION_SECRET,
  );

  if (!session) {
    const { pathname, search } = request.nextUrl;
    return NextResponse.redirect(new URL(loginHref(pathname + search), request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/cart", "/checkout", "/orders/:path*", "/admin/:path*"],
};
