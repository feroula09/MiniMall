import Link from "next/link";
import { Pagination } from "@/components/layout/Pagination";
import { OrderStatusBadge } from "@/components/order/OrderStatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireAdmin } from "@/lib/auth-guard";
import { formatDateTime } from "@/lib/format-date";
import { formatPrice } from "@/lib/money";
import type { RawSearchParams } from "@/lib/search-params";
import { buildAdminOrderDetailHref, buildAdminOrdersHref, parseAdminOrderParams } from "../params";
import { getAdminOrders } from "../queries";
import { AdminOrderFilters } from "./AdminOrderFilters";

type Props = { searchParams: Promise<RawSearchParams> };

/** 讀取 cookies、searchParams 與資料庫，必須放在 Suspense 內 */
export async function AdminOrderTable({ searchParams }: Props) {
  await requireAdmin("/admin/orders");
  const params = parseAdminOrderParams(await searchParams);
  const { items, counts, page, pageCount } = await getAdminOrders(params);

  return (
    <div className="space-y-4">
      <AdminOrderFilters params={params} counts={counts} />
      {items.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">
          {params.q || params.status ? "沒有符合條件的訂單" : "還沒有任何訂單"}
        </p>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>訂單編號</TableHead>
                <TableHead>買家</TableHead>
                <TableHead className="text-right">件數</TableHead>
                <TableHead className="text-right">金額</TableHead>
                <TableHead>狀態</TableHead>
                <TableHead>下單時間</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((o) => (
                <TableRow key={o.id}>
                  <TableCell>
                    <Link href={buildAdminOrderDetailHref(o.id, params)} className="font-mono text-sm hover:underline">
                      {o.orderNo}
                    </Link>
                  </TableCell>
                  <TableCell className="max-w-48">
                    <p className="truncate">{o.user.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{o.user.email}</p>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {o.items.reduce((n, i) => n + i.quantity, 0)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{formatPrice(o.totalAmount)}</TableCell>
                  <TableCell>
                    <OrderStatusBadge status={o.status} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDateTime(o.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <Pagination page={page} pageCount={pageCount} hrefFor={(n) => buildAdminOrdersHref(params, { page: n })} />
    </div>
  );
}

export function AdminOrderTableSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="載入訂單中">
      <Skeleton className="h-9 w-full" />
      <Skeleton className="h-8 w-80" />
      <Skeleton className="h-96 w-full" />
    </div>
  );
}
