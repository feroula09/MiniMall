import Link from "next/link";
import { notFound } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getCategories } from "@/features/catalog/queries";
import { requireAdmin } from "@/lib/auth-guard";
import { isId } from "@/lib/ids";
import { getAdminProduct } from "../queries";
import { ProductForm } from "./ProductForm";

// 以下元件讀取 cookies、params 與資料庫，必須放在 Suspense 內

export async function NewProductEditor() {
  await requireAdmin("/admin/products/new");
  const categories = await getCategories();
  if (categories.length === 0) {
    return (
      <div className="space-y-4 rounded-lg border p-6 text-center">
        <p className="text-muted-foreground">商品必須屬於一個分類，請先建立分類。</p>
        <Link href="/admin/categories" className={buttonVariants()}>
          前往分類管理
        </Link>
      </div>
    );
  }
  return <ProductForm categories={categories} />;
}

export async function EditProductEditor({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireAdmin(isId(id) ? `/admin/products/${id}/edit` : "/admin/products");
  if (!isId(id)) notFound();
  const [product, categories] = await Promise.all([getAdminProduct(id), getCategories()]);
  if (!product) notFound();
  return <ProductForm product={product} categories={categories} />;
}

export function ProductEditorSkeleton() {
  return (
    <div className="max-w-2xl space-y-5" aria-busy="true" aria-label="載入表單中">
      <Skeleton className="h-14 w-full" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-14 w-full" />
      <Skeleton className="h-40 w-full" />
    </div>
  );
}
