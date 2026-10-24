import { formatDateTime } from "@/lib/format-date";
import { cn } from "@/lib/utils";

type Props = {
  createdAt: Date;
  paidAt: Date | null;
  shippedAt: Date | null;
  completedAt: Date | null;
  cancelledAt: Date | null;
};

/** 訂單狀態時間軸，只列出已發生的事件（前台與後台共用） */
export function OrderTimeline(order: Props) {
  const events = [
    { label: "訂單成立", at: order.createdAt },
    { label: "付款完成", at: order.paidAt },
    { label: "已出貨", at: order.shippedAt },
    { label: "完成收貨", at: order.completedAt },
    { label: "訂單取消", at: order.cancelledAt, cancelled: true },
  ].filter((e): e is { label: string; at: Date; cancelled?: boolean } => e.at !== null);

  return (
    <ol className="space-y-3 border-l pl-4">
      {events.map((e) => (
        <li key={e.label} className="relative">
          <span
            aria-hidden
            className={cn(
              "absolute top-1.5 -left-[1.3rem] size-2.5 rounded-full",
              e.cancelled ? "bg-muted-foreground" : "bg-primary",
            )}
          />
          <p className="text-sm font-medium">{e.label}</p>
          <p className="text-xs text-muted-foreground">{formatDateTime(e.at)}</p>
        </li>
      ))}
    </ol>
  );
}
