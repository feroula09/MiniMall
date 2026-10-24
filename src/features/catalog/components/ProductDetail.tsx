import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductImage } from "@/components/ProductImage";
import { formatPrice } from "@/lib/money";
import { buildCatalogHref } from "../params";
import { getProductDetail } from "../queries";
import { PurchasePanel } from "./PurchasePanel";

type Props = { params: Promise<{ id: string }> };

/** 讀取路由參數與資料庫，必須放在 Suspense 內 */
export async function ProductDetail({ params }: Props) {
  const { id } = await params;
  const product = await getProductDetail(id);
  if (!product) notFound();

  return (
    <article className="space-y-6">
      <nav aria-label="麵包屑" className="text-sm text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/" className="hover:text-foreground">
              首頁
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li>
            <Link
              href={buildCatalogHref({ sort: "newest", page: 1, category: product.category.slug })}
              className="hover:text-foreground"
            >
              {product.category.name}
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li aria-current="page" className="line-clamp-1 text-foreground">
            {product.name}
          </li>
        </ol>
      </nav>

      <div className="grid gap-8 md:grid-cols-2">
        <ProductImage src={product.image} alt={product.name} sizes="(min-width: 768px) 50vw, 100vw" eager />

        <div className="flex flex-col gap-5">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">{product.name}</h1>
            <p className="text-2xl font-semibold">{formatPrice(product.price)}</p>
            <p className="text-sm text-muted-foreground">
              {product.stock > 0 ? `庫存 ${product.stock} 件` : "目前無庫存"}
            </p>
          </div>

          <PurchasePanel productId={product.id} stock={product.stock} />

          <section className="space-y-2 border-t pt-5">
            <h2 className="font-medium">商品說明</h2>
            <p className="leading-relaxed whitespace-pre-line text-muted-foreground">{product.description}</p>
          </section>
        </div>
      </div>
    </article>
  );
}
