import Link from "next/link";
import { ChevronRight, Package } from "lucide-react";
import { Pagination } from "@/components/layout/Pagination";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { ProductImage } from "@/components/ProductImage";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { requireUser } from "@/lib/auth-guard";
import { formatDateTime } from "@/lib/format-date";
import { formatPrice } from "@/lib/money";
import { ORDER_STATUS_LABEL, ORDER_STATUSES } from "@/lib/order-status";
import { cn } from "@/lib/utils";
import { getMyOrders, type MyOrderListItem } from "../queries";
import { orderListParamsSchema, type OrderListParams } from "../schemas";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const TABS = [undefined, ...ORDER_STATUSES];

function hrefFor(params: OrderListParams) {
  const search = new URLSearchParams();
  if (params.status) search.set("status", params.status);
  if (params.page > 1) search.set("page", String(params.page));
  const q = search.toString();
  return q ? `/orders?${q}` : "/orders";
}

/** 讀取網址條件、cookies 與資料庫，必須放在 Suspense 內 */
export async function OrderList({ searchParams }: { searchParams: SearchParams }) {
  const user = await requireUser("/orders");
  const params = orderListParamsSchema.parse(await searchParams);
  const result = await getMyOrders(user.id, params);

  return (
    <div className="space-y-6">
      <nav aria-label="訂單狀態" className="flex gap-1 overflow-x-auto border-b">
        {TABS.map((status) => {
          const active = params.status === status;
          return (
            <Link
              key={status ?? "all"}
              href={hrefFor({ status, page: 1 })}
              aria-current={active ? "page" : undefined}
              className={cn(
                "shrink-0 border-b-2 px-3 py-2 text-sm transition-colors",
                active ? "border-primary font-medium" : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {status ? ORDER_STATUS_LABEL[status] : "全部"}
            </Link>
          );
        })}
      </nav>

      {result.items.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <Package className="size-10 text-muted-foreground" aria-hidden />
          <p className="text-muted-foreground">{params.status ? "沒有這個狀態的訂單" : "還沒有任何訂單"}</p>
          <Link href="/" className={buttonVariants({ variant: "outline" })}>
            去逛逛
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {result.items.map((order) => (
            <li key={order.id}>
              <OrderRow order={order} />
            </li>
          ))}
        </ul>
      )}

      <Pagination
        page={result.page}
        pageCount={result.pageCount}
        hrefFor={(page) => hrefFor({ ...params, page })}
      />
    </div>
  );
}

function OrderRow({ order }: { order: MyOrderListItem }) {
  const [first, ...rest] = order.items;
  const count = order.items.reduce((n, i) => n + i.quantity, 0);

  return (
    <Link
      href={`/orders/${order.id}`}
      className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50"
    >
      <div className="w-14 shrink-0">
        <ProductImage src={first?.productImage ?? null} alt={first?.productName ?? ""} sizes="56px" />
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <OrderStatusBadge status={order.status} />
          <span className="font-mono text-xs text-muted-foreground">{order.orderNo}</span>
        </div>
        <p className="truncate text-sm">
          {first?.productName}
          {rest.length > 0 ? <span className="text-muted-foreground"> 等 {order.items.length} 項</span> : null}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatDateTime(order.createdAt)} ・ 共 {count} 件
        </p>
      </div>
      <p className="shrink-0 font-semibold">{formatPrice(order.totalAmount)}</p>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
    </Link>
  );
}

export function OrderListSkeleton() {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="載入訂單中">
      <Skeleton className="h-9 w-full" />
      {Array.from({ length: 4 }, (_, i) => (
        <Skeleton key={i} className="h-24 w-full" />
      ))}
    </div>
  );
}
