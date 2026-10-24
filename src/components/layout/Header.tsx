import Link from "next/link";
import { ShoppingCart, Store } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <Store className="size-5" aria-hidden />
          <span>Mini Mall</span>
        </Link>

        <nav className="ml-auto flex items-center gap-1">
          <Link
            href="/cart"
            aria-label="購物車"
            className={buttonVariants({ variant: "ghost", size: "icon" })}
          >
            <ShoppingCart aria-hidden />
          </Link>
          <Link href="/login" className={buttonVariants({ variant: "ghost", size: "sm" })}>
            登入
          </Link>
          <Link href="/register" className={buttonVariants({ size: "sm" })}>
            註冊
          </Link>
        </nav>
      </div>
    </header>
  );
}
