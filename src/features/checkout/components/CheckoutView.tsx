import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getCartWithSummary } from "@/features/cart/queries";
import { requireUser } from "@/lib/auth-guard";
import { formatPrice } from "@/lib/money";
import { CheckoutForm } from "./CheckoutForm";

/** 讀取 cookies 與資料庫，必須放在 Suspense 內 */
export async function CheckoutView() {
  const user = await requireUser("/checkout");
  const { items, summary } = await getCartWithSummary(user.id);
  // 購物車是空的或有問題時回購物車處理；送出時伺服器端仍會再檢查一次
  if (!summary.canCheckout) redirect("/cart");

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_22rem] lg:items-start">
      <Card>
        <CardHeader>
          <CardTitle>收件資訊</CardTitle>
        </CardHeader>
        <CardContent>
          <CheckoutForm expectedTotal={summary.subtotal} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>訂單內容</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <ul className="space-y-2">
            {items.map(({ id, quantity, product }) => (
              <li key={id} className="flex justify-between gap-4">
                <span className="min-w-0 truncate">
                  {product.name} <span className="text-muted-foreground">× {quantity}</span>
                </span>
                <span className="shrink-0">{formatPrice(product.price * quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="flex justify-between border-t pt-4 text-base font-semibold">
            <span>合計（{summary.itemCount} 件）</span>
            <span>{formatPrice(summary.subtotal)}</span>
          </div>
          <p className="text-xs text-muted-foreground">下單後會保留庫存，請於付款頁完成模擬付款。</p>
        </CardContent>
      </Card>
    </div>
  );
}

export function CheckoutSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_22rem]" aria-busy="true" aria-label="載入中">
      <Skeleton className="h-80 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
