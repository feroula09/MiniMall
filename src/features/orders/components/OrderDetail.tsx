import { notFound } from "next/navigation";
import { OrderStatusBadge } from "@/components/order/OrderStatusBadge";
import { OrderItemsCard } from "@/components/order/OrderItemsCard";
import { ReceiverCard } from "@/components/order/ReceiverCard";
import { TimelineCard } from "@/components/order/TimelineCard";
import { Skeleton } from "@/components/ui/skeleton";
import { requireUser } from "@/lib/auth-guard";
import { isId } from "@/lib/ids";
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
        <OrderItemsCard items={order.items} totalAmount={order.totalAmount} productHref={(id) => `/products/${id}`} />
        <div className="space-y-6">
          <ReceiverCard {...order} />
          <TimelineCard {...order} />
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
