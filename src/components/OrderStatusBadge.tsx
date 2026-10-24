import type { OrderStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { ORDER_STATUS_LABEL } from "@/lib/order-status";
import { cn } from "@/lib/utils";

const tone: Record<OrderStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  PAID: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  SHIPPED: "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300",
  COMPLETED: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
  CANCELLED: "bg-muted text-muted-foreground",
};

export function OrderStatusBadge({ status, className }: { status: OrderStatus; className?: string }) {
  return <Badge className={cn(tone[status], className)}>{ORDER_STATUS_LABEL[status]}</Badge>;
}
