import { Skeleton } from "@/components/ui/skeleton";

export function ProductDetailSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="載入商品中">
      <Skeleton className="h-4 w-48" />
      <div className="grid gap-8 md:grid-cols-2">
        <Skeleton className="aspect-square w-full" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-8 w-1/4" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    </div>
  );
}
