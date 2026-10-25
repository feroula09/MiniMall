import Form from "next/form";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ORDER_STATUS_LABEL, ORDER_STATUSES } from "@/lib/order-status";
import { cn } from "@/lib/utils";
import { buildAdminOrdersHref, type AdminOrderParams } from "../params";
import type { StatusCounts } from "../queries";

type Props = { params: AdminOrderParams; counts: StatusCounts };

const TABS = [undefined, ...ORDER_STATUSES];

/** 狀態分頁標籤（附各狀態數量）+ 訂單編號搜尋；條件都寫在網址上 */
export function AdminOrderFilters({ params, counts }: Props) {
  const all = Object.values(counts).reduce((sum, n) => sum + (n ?? 0), 0);

  return (
    <div className="space-y-4">
      <nav aria-label="訂單狀態" className="flex gap-1 overflow-x-auto border-b">
        {TABS.map((status) => {
          const active = params.status === status;
          const count = status ? (counts[status] ?? 0) : all;
          return (
            <Link
              key={status ?? "all"}
              href={buildAdminOrdersHref(params, { status, page: 1 })}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2 text-sm transition-colors",
                active ? "border-primary font-medium" : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {status ? ORDER_STATUS_LABEL[status] : "全部"}
              <span className="rounded-full bg-muted px-1.5 text-xs tabular-nums text-muted-foreground">{count}</span>
            </Link>
          );
        })}
      </nav>

      {/* key：網址條件改變時重設輸入框，與網址保持一致 */}
      <Form key={params.q ?? ""} action="/admin/orders" role="search" className="flex gap-2">
        <Input
          type="search"
          name="q"
          defaultValue={params.q}
          placeholder="搜尋訂單編號"
          aria-label="搜尋訂單編號"
          maxLength={30}
          className="max-w-xs font-mono"
        />
        {params.status ? <input type="hidden" name="status" value={params.status} /> : null}
        <Button type="submit" variant="secondary">
          搜尋
        </Button>
        {params.q ? (
          <Link
            href={buildAdminOrdersHref(params, { q: undefined, page: 1 })}
            className={buttonVariants({ variant: "ghost" })}
          >
            清除
          </Link>
        ) : null}
      </Form>
    </div>
  );
}
