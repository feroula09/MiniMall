import { Suspense } from "react";
import type { Metadata } from "next";
import { Dashboard, DashboardSkeleton } from "@/features/admin-dashboard/components/Dashboard";

export const metadata: Metadata = { title: "概覽" };

export default function AdminHomePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">概覽</h1>
      <Suspense fallback={<DashboardSkeleton />}>
        <Dashboard />
      </Suspense>
    </div>
  );
}
