import { Suspense } from "react";
import type { Metadata } from "next";
import { EditProductEditor, ProductEditorSkeleton } from "@/features/admin-product/components/ProductEditor";

export const metadata: Metadata = { title: "編輯商品" };

export default function EditProductPage({ params }: PageProps<"/admin/products/[id]/edit">) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">編輯商品</h1>
      <Suspense fallback={<ProductEditorSkeleton />}>
        <EditProductEditor params={params} />
      </Suspense>
    </div>
  );
}
