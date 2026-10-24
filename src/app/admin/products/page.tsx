import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { ProductTable, ProductTableSkeleton } from "@/features/admin-product/components/ProductTable";

export const metadata: Metadata = { title: "商品管理" };

export default function AdminProductsPage({ searchParams }: PageProps<"/admin/products">) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">商品管理</h1>
        <Link href="/admin/products/new" className={buttonVariants()}>
          <Plus aria-hidden />
          新增商品
        </Link>
      </div>
      <Suspense fallback={<ProductTableSkeleton />}>
        <ProductTable searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
