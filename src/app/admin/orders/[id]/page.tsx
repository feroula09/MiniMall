import { Suspense } from "react";
import type { Metadata } from "next";
import { AdminOrderDetail, AdminOrderDetailSkeleton } from "@/features/admin-order/components/AdminOrderDetail";

export const metadata: Metadata = { title: "訂單詳情" };

export default function AdminOrderPage({ params, searchParams }: PageProps<"/admin/orders/[id]">) {
  return (
    <Suspense fallback={<AdminOrderDetailSkeleton />}>
      <AdminOrderDetail params={params} searchParams={searchParams} />
    </Suspense>
  );
}
