import Link from "next/link";
import { ProductImage } from "@/components/ProductImage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/money";

type Item = {
  id: string;
  productId: string | null;
  productName: string;
  productImage: string | null;
  price: number;
  quantity: number;
};

type Props = {
  items: Item[];
  totalAmount: number;
  /** 商品名稱的連結（前台連商品頁、後台連編輯頁）；商品已刪除時不連結 */
  productHref: (productId: string) => string;
};

/** 訂單商品明細與合計（前台與後台共用）。明細是下單當下的快照 */
export function OrderItemsCard({ items, totalAmount, productHref }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>商品明細</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="divide-y">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-4 py-3">
              <div className="w-16 shrink-0">
                <ProductImage src={item.productImage} alt={item.productName} sizes="64px" />
              </div>
              <div className="min-w-0 flex-1">
                {item.productId ? (
                  <Link href={productHref(item.productId)} className="line-clamp-2 font-medium hover:underline">
                    {item.productName}
                  </Link>
                ) : (
                  <p className="line-clamp-2 font-medium">{item.productName}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  {formatPrice(item.price)} × {item.quantity}
                </p>
              </div>
              <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
            </li>
          ))}
        </ul>
        <div className="flex justify-between border-t pt-4 text-base font-semibold">
          <span>合計</span>
          <span>{formatPrice(totalAmount)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
