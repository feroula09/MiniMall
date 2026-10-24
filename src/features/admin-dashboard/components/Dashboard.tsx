import Link from "next/link";
import { AlertTriangle, ClipboardList, DollarSign, Package, Truck } from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { requireAdmin } from "@/lib/auth-guard";
import { formatDateTime } from "@/lib/format-date";
import { formatPrice } from "@/lib/money";
import { getDashboardStats, LOW_STOCK_THRESHOLD } from "../queries";

/** 讀取 cookies 與資料庫，必須放在 Suspense 內 */
export async function Dashboard() {
  await requireAdmin("/admin");
  const stats = await getDashboardStats();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Package} label="商品數" value={`${stats.productCount}`} hint={`上架中 ${stats.activeProductCount}`} href="/admin/products" />
        <StatCard icon={ClipboardList} label="訂單數" value={`${stats.orderCount}`} href="/admin/orders" />
        <StatCard icon={Truck} label="待出貨" value={`${stats.toShipCount}`} hint="已付款、尚未出貨" href="/admin/orders?status=PAID" highlight={stats.toShipCount > 0} />
        <StatCard icon={DollarSign} label="已付款金額" value={formatPrice(stats.paidRevenue)} hint="含已出貨、已完成" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <Card>
          <CardHeader>
            <CardTitle>最新訂單</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground">目前沒有訂單</p>
            ) : (
              <ul className="divide-y">
                {stats.recentOrders.map((o) => (
                  <li key={o.id}>
                    <Link href={`/admin/orders/${o.id}`} className="flex items-center gap-3 py-3 hover:underline">
                      <OrderStatusBadge status={o.status} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-mono text-sm">{o.orderNo}</p>
                        <p className="text-xs text-muted-foreground">
                          {o.user.name} ・ {formatDateTime(o.createdAt)}
                        </p>
                      </div>
                      <span className="text-sm font-semibold">{formatPrice(o.totalAmount)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="size-4 text-amber-600" aria-hidden />
              庫存偏低
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.lowStock.length === 0 ? (
              <p className="text-sm text-muted-foreground">上架商品庫存都高於 {LOW_STOCK_THRESHOLD} 件</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {stats.lowStock.map((p) => (
                  <li key={p.id} className="flex justify-between gap-3">
                    <Link href={`/admin/products/${p.id}/edit`} className="truncate hover:underline">
                      {p.name}
                    </Link>
                    <span className={p.stock === 0 ? "font-medium text-destructive" : "text-muted-foreground"}>
                      {p.stock === 0 ? "售完" : `${p.stock} 件`}
                    </span>
                  </li>
                ))}
                {stats.lowStockCount > stats.lowStock.length ? (
                  <li className="pt-1 text-xs text-muted-foreground">
                    另有 {stats.lowStockCount - stats.lowStock.length} 項庫存偏低
                  </li>
                ) : null}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

type StatCardProps = {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  value: string;
  hint?: string;
  href?: string;
  highlight?: boolean;
};

function StatCard({ icon: Icon, label, value, hint, href, highlight }: StatCardProps) {
  const body = (
    <Card className={highlight ? "ring-2 ring-amber-400" : undefined}>
      <CardContent className="space-y-1">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{label}</span>
          <Icon className="size-4" aria-hidden />
        </div>
        <p className="text-2xl font-semibold tracking-tight">{value}</p>
        {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </Card>
  );
  return href ? (
    <Link href={href} className="block rounded-xl transition-opacity hover:opacity-80">
      {body}
    </Link>
  ) : (
    body
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="載入中">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-28 w-full" />
        ))}
      </div>
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
