import Link from "next/link";
import { ProductImage } from "@/components/ProductImage";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/money";
import type { ProductCardData } from "../queries";

export function ProductCard({ product, eager }: { product: ProductCardData; eager?: boolean }) {
  const soldOut = product.stock <= 0;

  return (
    <Link href={`/products/${product.id}`} className="group flex flex-col gap-3">
      <div className="relative">
        <ProductImage
          src={product.image}
          alt={product.name}
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          eager={eager}
          className="transition-opacity group-hover:opacity-90"
        />
        {soldOut && (
          <Badge variant="secondary" className="absolute top-2 left-2">
            已售完
          </Badge>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">{product.category.name}</p>
        <h3 className="line-clamp-2 text-sm font-medium group-hover:underline">{product.name}</h3>
        <p className="font-semibold">{formatPrice(product.price)}</p>
      </div>
    </Link>
  );
}
