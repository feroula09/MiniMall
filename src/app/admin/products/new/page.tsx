import { Suspense } from "react";
import type { Metadata } from "next";
import { NewProductEditor, ProductEditorSkeleton } from "@/features/admin-product/components/ProductEditor";

export const metadata: Metadata = { title: "新增商品" };

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">新增商品</h1>
      <Suspense fallback={<ProductEditorSkeleton />}>
        <NewProductEditor />
      </Suspense>
    </div>
  );
}
