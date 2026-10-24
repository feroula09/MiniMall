import { Suspense } from "react";
import type { Metadata } from "next";
import { CategoryTable, CategoryTableSkeleton } from "@/features/admin-category/components/CategoryTable";

export const metadata: Metadata = { title: "分類管理" };

export default function AdminCategoriesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">分類管理</h1>
      <Suspense fallback={<CategoryTableSkeleton />}>
        <CategoryTable />
      </Suspense>
    </div>
  );
}
