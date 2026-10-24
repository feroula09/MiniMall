import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getCurrentUser } from "@/lib/auth-guard";
import { getCartCount } from "../queries";

/** 頁首的購物車圖示與件數。讀取 cookies，必須放在 Suspense 內 */
export async function CartLink() {
  const user = await getCurrentUser();
  const count = user ? await getCartCount(user.id) : 0;
  return <CartLinkView count={count} />;
}

export function CartLinkView({ count = 0 }: { count?: number }) {
  const label = count > 0 ? `購物車，${count} 件商品` : "購物車";
  return (
    <Link href="/cart" aria-label={label} className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "relative")}>
      <ShoppingCart aria-hidden />
      {count > 0 ? (
        <span
          aria-hidden
          className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] leading-none font-semibold text-primary-foreground"
        >
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </Link>
  );
}
