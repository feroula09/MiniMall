import { Suspense } from "react";
import type { Metadata } from "next";
import { ProductDetail } from "@/features/catalog/components/ProductDetail";
import { ProductDetailSkeleton } from "@/features/catalog/components/ProductDetailSkeleton";
import { getProductDetail } from "@/features/catalog/queries";
import { truncate } from "@/lib/text";

export async function generateMetadata({ params }: PageProps<"/products/[id]">): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductDetail(id);
  return product
    ? { title: product.name, description: truncate(product.description, 120) }
    : { title: "找不到商品" };
}

export default function ProductPage({ params }: PageProps<"/products/[id]">) {
  return (
    <Suspense fallback={<ProductDetailSkeleton />}>
      <ProductDetail params={params} />
    </Suspense>
  );
}
