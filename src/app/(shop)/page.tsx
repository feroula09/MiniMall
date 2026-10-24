import { Suspense } from "react";
import { Catalog } from "@/features/catalog/components/Catalog";
import { CatalogSkeleton } from "@/features/catalog/components/CatalogSkeleton";

export default function HomePage({ searchParams }: PageProps<"/">) {
  return (
    <Suspense fallback={<CatalogSkeleton />}>
      <Catalog searchParams={searchParams} />
    </Suspense>
  );
}
