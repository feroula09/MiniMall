import Link from "next/link";
import { SearchX } from "lucide-react";
import { Pagination } from "@/components/layout/Pagination";
import { buttonVariants } from "@/components/ui/button";
import { buildCatalogHref, parseCatalogParams } from "../params";
import { getCategories, getProducts } from "../queries";
import { CategoryFilter } from "./CategoryFilter";
import { ProductGrid } from "./ProductGrid";
import { SortTabs } from "./SortTabs";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

/** 讀取網址條件與資料庫，必須放在 Suspense 內 */
export async function Catalog({ searchParams }: Props) {
  const parsed = parseCatalogParams(await searchParams);
  const categories = await getCategories();
  // 不存在的分類（打錯或已被後台刪除）視為未篩選，而不是顯示空列表
  const category = categories.find((c) => c.slug === parsed.category);
  const params = { ...parsed, category: category?.slug };

  const result = await getProducts(params);
  const current = { ...params, page: result.page };
  const categoryName = category?.name;

  return (
    <div className="space-y-6">
      <CategoryFilter categories={categories} params={current} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {params.q ? <>「{params.q}」的搜尋結果，</> : null}
          {categoryName ? <>{categoryName}，</> : null}共 {result.total} 件商品
        </p>
        <SortTabs params={current} />
      </div>

      {result.items.length > 0 ? (
        <ProductGrid products={result.items} />
      ) : (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <SearchX className="size-10 text-muted-foreground" aria-hidden />
          <p className="text-muted-foreground">找不到符合條件的商品</p>
          <Link href="/" className={buttonVariants({ variant: "outline" })}>
            清除篩選條件
          </Link>
        </div>
      )}

      <Pagination
        page={result.page}
        pageCount={result.pageCount}
        hrefFor={(page) => buildCatalogHref(current, { page })}
      />
    </div>
  );
}
