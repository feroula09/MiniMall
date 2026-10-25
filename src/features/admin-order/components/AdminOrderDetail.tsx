import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { OrderItemsCard } from "@/components/order/OrderItemsCard";
import { OrderStatusBadge } from "@/components/order/OrderStatusBadge";
import { ReceiverCard } from "@/components/order/ReceiverCard";
import { TimelineCard } from "@/components/order/TimelineCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { requireAdmin } from "@/lib/auth-guard";
import { isId } from "@/lib/ids";
import type { RawSearchParams } from "@/lib/search-params";
import { buildAdminOrdersHref, parseAdminOrderParams } from "../params";
import { getAdminOrder } from "../queries";
import { AdminOrderActions } from "./AdminOrderActions";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<RawSearchParams> };

/** 讀取路由參數、cookies 與資料庫，必須放在 Suspense 內 */
export async function AdminOrderDetail({ params, searchParams }: Props) {
  const { id } = await params;
  await requireAdmin(isId(id) ? `/admin/orders/${id}` : "/admin/orders");
  if (!isId(id)) notFound();
  const [order, list] = await Promise.all([getAdminOrder(id), searchParams.then(parseAdminOrderParams)]);
  if (!order) notFound();

  return (
    <div className="space-y-6">
      {/* 列表條件經過驗證後重新組成連結，不直接使用網址上的字串 */}
      <Link
        href={buildAdminOrdersHref(list)}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" aria-hidden />
        訂單列表
      </Link>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">訂單詳情</h1>
            <OrderStatusBadge status={order.status} />
          </div>
          <p className="font-mono text-sm text-muted-foreground">{order.orderNo}</p>
        </div>
        <AdminOrderActions orderId={order.id} orderNo={order.orderNo} status={order.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_18rem] lg:items-start">
        <OrderItemsCard
          items={order.items}
          totalAmount={order.totalAmount}
          productHref={(productId) => `/admin/products/${productId}/edit`}
        />
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>買家</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p>{order.user.name}</p>
              <p className="break-all text-muted-foreground">{order.user.email}</p>
            </CardContent>
          </Card>
          <ReceiverCard {...order} />
          <TimelineCard {...order} />
        </div>
      </div>
    </div>
  );
}

export function AdminOrderDetailSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="載入訂單中">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-8 w-48" />
      <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
        <Skeleton className="h-72 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    </div>
  );
}
