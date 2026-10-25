import { Suspense } from "react";
import type { Metadata } from "next";
import { AdminOrderTable, AdminOrderTableSkeleton } from "@/features/admin-order/components/AdminOrderTable";

export const metadata: Metadata = { title: "訂單管理" };

export default function AdminOrdersPage({ searchParams }: PageProps<"/admin/orders">) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">訂單管理</h1>
      <Suspense fallback={<AdminOrderTableSkeleton />}>
        <AdminOrderTable searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
