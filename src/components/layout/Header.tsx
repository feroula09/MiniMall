import { Suspense } from "react";
import Link from "next/link";
import { ShoppingCart, Store } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { SearchBar, SearchForm } from "@/features/catalog/components/SearchBar";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-semibold tracking-tight">
          <Store className="size-5" aria-hidden />
          {/* 手機版只顯示圖示，文字仍保留給螢幕閱讀器 */}
          <span className="sr-only sm:not-sr-only">Mini Mall</span>
        </Link>

        <div className="max-w-md flex-1">
          {/* useSearchParams 在預渲染時會暫停，外殼先顯示空白搜尋框 */}
          <Suspense fallback={<SearchForm />}>
            <SearchBar />
          </Suspense>
        </div>

        <nav className="ml-auto flex shrink-0 items-center gap-1">
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
