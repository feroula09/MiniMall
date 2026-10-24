import Link from "next/link";
import { notFound } from "next/navigation";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { OrderTimeline } from "@/components/OrderTimeline";
import { ProductImage } from "@/components/ProductImage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { requireUser } from "@/lib/auth-guard";
import { isId } from "@/lib/ids";
import { formatPrice } from "@/lib/money";
import { getMyOrder } from "../queries";
import { OrderActions } from "./OrderActions";

/** 讀取路由參數、cookies 與資料庫，必須放在 Suspense 內 */
export async function OrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isId(id)) notFound();
  const user = await requireUser(`/orders/${id}`);
  const order = await getMyOrder(user.id, id);
  if (!order) notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">訂單詳情</h1>
            <OrderStatusBadge status={order.status} />
          </div>
          <p className="font-mono text-sm text-muted-foreground">{order.orderNo}</p>
        </div>
        <OrderActions orderId={order.id} status={order.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_18rem] lg:items-start">
        <Card>
          <CardHeader>
            <CardTitle>商品明細</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-center gap-4 py-3">
                  <div className="w-16 shrink-0">
                    <ProductImage src={item.productImage} alt={item.productName} sizes="64px" />
                  </div>
                  <div className="min-w-0 flex-1">
                    {/* 明細是快照：商品被刪除後仍顯示，只是不能連結 */}
                    {item.productId ? (
                      <Link href={`/products/${item.productId}`} className="line-clamp-2 font-medium hover:underline">
                        {item.productName}
                      </Link>
                    ) : (
                      <p className="line-clamp-2 font-medium">{item.productName}</p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      {formatPrice(item.price)} × {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                </li>
              ))}
            </ul>
            <div className="flex justify-between border-t pt-4 text-base font-semibold">
              <span>合計</span>
              <span>{formatPrice(order.totalAmount)}</span>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>收件資訊</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="text-muted-foreground">收件人</dt>
                  <dd>{order.receiverName}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">手機</dt>
                  <dd>{order.phone}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">地址</dt>
                  <dd className="break-words">{order.address}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>訂單狀態</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderTimeline {...order} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export function OrderDetailSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="載入訂單中">
      <Skeleton className="h-8 w-48" />
      <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
        <Skeleton className="h-72 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    </div>
  );
}
