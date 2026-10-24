import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { buildCatalogHref, type CatalogParams } from "../params";
import type { CategoryOption } from "../queries";

type Props = { categories: CategoryOption[]; params: CatalogParams };

export function CategoryFilter({ categories, params }: Props) {
  const options = [{ slug: undefined, name: "全部" }, ...categories];

  return (
    <nav aria-label="商品分類" className="flex flex-wrap gap-2">
      {options.map((c) => {
        const active = params.category === c.slug;
        return (
          <Link
            key={c.slug ?? "all"}
            href={buildCatalogHref(params, { category: c.slug, page: 1 })}
            aria-current={active ? "page" : undefined}
            className={buttonVariants({ variant: active ? "default" : "outline", size: "sm" })}
          >
            {c.name}
          </Link>
        );
      })}
    </nav>
  );
}
