import type { ProductCardData } from "../queries";
import { ProductCard } from "./ProductCard";

/** 商品格線的欄數與間距，CatalogSkeleton 共用，避免載入前後版面跳動 */
export const productGridClass = "grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4";

export function ProductGrid({ products }: { products: ProductCardData[] }) {
  return (
    <ul className={productGridClass}>
      {products.map((product, i) => (
        <li key={product.id}>
          {/* 首屏的前四張立即載入 */}
          <ProductCard product={product} eager={i < 4} />
        </li>
      ))}
    </ul>
  );
}
