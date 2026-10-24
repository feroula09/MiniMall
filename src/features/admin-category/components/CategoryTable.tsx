import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireAdmin } from "@/lib/auth-guard";
import { getAdminCategories } from "../queries";
import { CategoryFormDialog } from "./CategoryFormDialog";
import { DeleteCategoryButton } from "./DeleteCategoryButton";

/** 讀取 cookies 與資料庫，必須放在 Suspense 內 */
export async function CategoryTable() {
  await requireAdmin("/admin/categories");
  const categories = await getAdminCategories();

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <CategoryFormDialog />
      </div>
      {categories.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">還沒有任何分類</p>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">排序</TableHead>
                <TableHead>名稱</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead className="text-right">商品數</TableHead>
                <TableHead className="w-24 text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="text-muted-foreground">{c.sortOrder}</TableCell>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="font-mono text-sm">{c.slug}</TableCell>
                  <TableCell className="text-right">
                    <Link href={`/admin/products?category=${c.slug}`} className="hover:underline">
                      {c._count.products}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <CategoryFormDialog category={c} />
                      <DeleteCategoryButton id={c.id} name={c.name} productCount={c._count.products} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

export function CategoryTableSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="載入分類中">
      <Skeleton className="ml-auto h-8 w-28" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
