import { Suspense } from "react";
import type { Metadata } from "next";
import { OrderDetail, OrderDetailSkeleton } from "@/features/orders/components/OrderDetail";

export const metadata: Metadata = { title: "訂單詳情" };

export default function OrderPage({ params }: PageProps<"/orders/[id]">) {
  return (
    <Suspense fallback={<OrderDetailSkeleton />}>
      <OrderDetail params={params} />
    </Suspense>
  );
}
