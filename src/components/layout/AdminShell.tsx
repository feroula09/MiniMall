import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { UserMenu } from "@/features/auth/components/UserMenu";
import { getCurrentUser } from "@/lib/auth-guard";
import { AdminNav } from "./AdminNav";
import { BrandLink, headerBarClass } from "./BrandLink";

/**
 * 後台外框，只有管理員才會看到選單。讀取 cookies，必須放在 Suspense 內。
 * - 已登入但不是管理員：導回首頁
 * - 未登入：不渲染外框，交給頁面的 requireAdmin 以正確的回跳路徑導向登入（layout 拿不到目前路徑）
 * 各頁面與 action 仍會各自呼叫 requireAdmin。
 */
export async function AdminShell({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) return children;
  if (user.role !== "ADMIN") redirect("/");

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className={headerBarClass}>
        <div className="flex h-14 items-center gap-3 px-4">
          <BrandLink href="/admin" suffix={<span className="text-muted-foreground">後台</span>} />
          <div className="ml-auto flex items-center gap-1">
            <Link href="/" className={buttonVariants({ variant: "ghost", size: "sm" })}>
              <ArrowLeft aria-hidden />
              回到前台
            </Link>
            <UserMenu />
          </div>
        </div>
      </header>
      <div className="flex flex-1 flex-col md:flex-row">
        <aside className="border-b p-3 md:w-52 md:shrink-0 md:border-r md:border-b-0">
          <AdminNav />
        </aside>
        <main className="min-w-0 flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}

export function AdminShellSkeleton() {
  return (
    <div className="flex flex-1 flex-col" aria-busy="true" aria-label="載入後台中">
      <div className="h-14 border-b" />
      <div className="flex flex-1 flex-col md:flex-row">
        {/* 與實際外框相同：手機版為上方橫列，桌面版為側邊欄，避免載入後跳動 */}
        <div className="flex gap-1 border-b p-3 md:w-52 md:flex-col md:border-r md:border-b-0">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-9 w-16 md:w-full" />
          ))}
        </div>
        <div className="flex-1 p-4 md:p-6">
          <Skeleton className="h-8 w-40" />
        </div>
      </div>
    </div>
  );
}
