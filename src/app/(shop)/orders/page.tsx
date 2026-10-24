import { Suspense } from "react";
import type { Metadata } from "next";
import { OrderList, OrderListSkeleton } from "@/features/orders/components/OrderList";

export const metadata: Metadata = { title: "我的訂單" };

export default function OrdersPage({ searchParams }: PageProps<"/orders">) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">我的訂單</h1>
      <Suspense fallback={<OrderListSkeleton />}>
        <OrderList searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
