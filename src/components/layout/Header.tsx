import { Suspense } from "react";
import { BrandLink, headerBarClass } from "./BrandLink";
import { UserMenu, UserMenuSkeleton } from "@/features/auth/components/UserMenu";
import { CartLink, CartLinkView } from "@/features/cart/components/CartLink";
import { SearchBar, SearchForm } from "@/features/catalog/components/SearchBar";

export function Header() {
  return (
    <header className={headerBarClass}>
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
        <BrandLink compact />

        <div className="max-w-md flex-1">
          {/* useSearchParams 在預渲染時會暫停，外殼先顯示空白搜尋框 */}
          <Suspense fallback={<SearchForm />}>
            <SearchBar />
          </Suspense>
        </div>

        <nav className="ml-auto flex shrink-0 items-center gap-1">
          <Suspense fallback={<CartLinkView />}>
            <CartLink />
          </Suspense>
          {/* 登入狀態依請求而定，在靜態外殼之後串流進來 */}
          <Suspense fallback={<UserMenuSkeleton />}>
            <UserMenu />
          </Suspense>
        </nav>
      </div>
    </header>
  );
}
