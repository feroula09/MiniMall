import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { requireUser } from "@/lib/auth-guard";
import { formatPrice } from "@/lib/money";
import { getCartItems } from "../queries";
import { summarizeCart } from "../summary";
import { CartItemRow } from "./CartItemRow";

/** 讀取 cookies 與資料庫，必須放在 Suspense 內 */
export async function CartView() {
  const user = await requireUser("/cart");
  const items = await getCartItems(user.id);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <ShoppingBag className="size-10 text-muted-foreground" aria-hidden />
        <p className="text-muted-foreground">購物車是空的</p>
        <Link href="/" className={buttonVariants({ variant: "outline" })}>
          去逛逛
        </Link>
      </div>
    );
  }

  const summary = summarizeCart(items);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_20rem] lg:items-start">
      <ul className="divide-y border-y">
        {items.map((item) => (
          <CartItemRow key={item.id} item={item} />
        ))}
      </ul>

      <Card className="lg:sticky lg:top-20">
        <CardHeader>
          <CardTitle>訂單摘要</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">商品件數</span>
            <span>{summary.itemCount} 件</span>
          </div>
          <div className="flex justify-between text-base font-semibold">
            <span>合計</span>
            <span>{formatPrice(summary.subtotal)}</span>
          </div>
          {summary.hasIssues ? (
            <p className="pt-2 text-destructive">部分商品已下架或庫存不足，請調整數量或移除後再結帳。</p>
          ) : null}
        </CardContent>
        <CardFooter>
          {summary.canCheckout ? (
            <Link href="/checkout" className={buttonVariants({ size: "lg", className: "w-full" })}>
              前往結帳
            </Link>
          ) : (
            <Button size="lg" className="w-full" disabled>
              前往結帳
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

export function CartSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_20rem]" aria-busy="true" aria-label="載入購物車中">
      <div className="space-y-4">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="size-24" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          </div>
        ))}
      </div>
      <Skeleton className="h-48 w-full" />
    </div>
  );
}
