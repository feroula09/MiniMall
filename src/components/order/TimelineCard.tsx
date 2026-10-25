import type { ComponentProps } from "react";
import { OrderTimeline } from "@/components/order/OrderTimeline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/** 訂單狀態時間軸卡片（前台與後台共用） */
export function TimelineCard(order: ComponentProps<typeof OrderTimeline>) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>訂單狀態</CardTitle>
      </CardHeader>
      <CardContent>
        <OrderTimeline {...order} />
      </CardContent>
    </Card>
  );
}
