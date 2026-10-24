import { Skeleton } from "@/components/ui/skeleton";
import { productGridClass } from "./ProductGrid";

export function CatalogSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="載入商品中">
      <div className="flex gap-2">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-7 w-20" />
        ))}
      </div>
      <Skeleton className="h-5 w-64" />
      <div className={productGridClass}>
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-square w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        ))}
      </div>
    </div>
  );
}
