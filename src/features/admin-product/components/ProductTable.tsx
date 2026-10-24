import Link from "next/link";
import { Pencil } from "lucide-react";
import { Pagination } from "@/components/layout/Pagination";
import { ProductImage } from "@/components/ProductImage";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LOW_STOCK_THRESHOLD } from "@/features/admin-dashboard/queries";
import { getCategories } from "@/features/catalog/queries";
import { requireAdmin } from "@/lib/auth-guard";
import { formatPrice } from "@/lib/money";
import type { RawSearchParams } from "@/lib/search-params";
import { cn } from "@/lib/utils";
import { buildAdminProductsHref, parseAdminProductParams } from "../params";
import { getAdminProducts } from "../queries";
import { DeleteProductButton } from "./DeleteProductButton";
import { ProductFilters } from "./ProductFilters";
import { ToggleActiveButton } from "./ToggleActiveButton";

type Props = { searchParams: Promise<RawSearchParams> };

/** 讀取 cookies、searchParams 與資料庫，必須放在 Suspense 內 */
export async function ProductTable({ searchParams }: Props) {
  await requireAdmin("/admin/products");
  const params = parseAdminProductParams(await searchParams);
  const [{ items, total, page, pageCount }, categories] = await Promise.all([
    getAdminProducts(params),
    getCategories(),
  ]);
  const filtered = Boolean(params.q || params.category || params.active);

  return (
    <div className="space-y-4">
      <ProductFilters params={params} categories={categories} />
      <p className="text-sm text-muted-foreground">共 {total} 項商品</p>
      {items.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">{filtered ? "沒有符合條件的商品" : "還沒有任何商品"}</p>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-14">
                  <span className="sr-only">圖片</span>
                </TableHead>
                <TableHead>商品</TableHead>
                <TableHead className="text-right">價格</TableHead>
                <TableHead className="text-right">庫存</TableHead>
                <TableHead>狀態</TableHead>
                <TableHead className="w-24 text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <ProductImage src={p.image} alt="" sizes="40px" className="size-10 rounded-md" />
                  </TableCell>
                  <TableCell className="max-w-64">
                    <Link href={`/admin/products/${p.id}/edit`} className="block truncate font-medium hover:underline">
                      {p.name}
                    </Link>
                    <span className="text-xs text-muted-foreground">{p.category.name}</span>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{formatPrice(p.price)}</TableCell>
                  <TableCell
                    className={cn(
                      "text-right tabular-nums",
                      p.stock === 0 ? "font-medium text-destructive" : p.stock <= LOW_STOCK_THRESHOLD && "text-amber-600",
                    )}
                  >
                    {p.stock === 0 ? "缺貨" : p.stock}
                  </TableCell>
                  <TableCell>
                    <ToggleActiveButton id={p.id} name={p.name} isActive={p.isActive} />
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Link
                        href={`/admin/products/${p.id}/edit`}
                        aria-label={`編輯 ${p.name}`}
                        className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
                      >
                        <Pencil aria-hidden />
                      </Link>
                      <DeleteProductButton id={p.id} name={p.name} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <Pagination page={page} pageCount={pageCount} hrefFor={(n) => buildAdminProductsHref(params, { page: n })} />
    </div>
  );
}

export function ProductTableSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="載入商品中">
      <Skeleton className="h-8 w-full max-w-xl" />
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-96 w-full" />
    </div>
  );
}
