import Link from "next/link";
import { cn } from "@/lib/utils";
import { buildCatalogHref, SORT_OPTIONS, type CatalogParams } from "../params";

export function SortTabs({ params }: { params: CatalogParams }) {
  return (
    <nav aria-label="排序方式" className="flex items-center gap-4 text-sm">
      {SORT_OPTIONS.map((option) => {
        const active = params.sort === option.value;
        return (
          <Link
            key={option.value}
            href={buildCatalogHref(params, { sort: option.value, page: 1 })}
            aria-current={active ? "page" : undefined}
            className={cn(
              "transition-colors hover:text-foreground",
              active ? "font-medium text-foreground" : "text-muted-foreground",
            )}
          >
            {option.label}
          </Link>
        );
      })}
    </nav>
  );
}
