import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentUser } from "@/lib/auth-guard";
import { UserMenuDropdown } from "./UserMenuDropdown";

/** 頁首的登入狀態。讀取 cookies，必須放在 Suspense 內 */
export async function UserMenu() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <>
        <Link href="/login" className={buttonVariants({ variant: "ghost", size: "sm" })}>
          登入
        </Link>
        <Link href="/register" className={buttonVariants({ size: "sm" })}>
          註冊
        </Link>
      </>
    );
  }

  return <UserMenuDropdown name={user.name} email={user.email} isAdmin={user.role === "ADMIN"} />;
}

export function UserMenuSkeleton() {
  return <Skeleton className="h-7 w-24" aria-hidden />;
}
