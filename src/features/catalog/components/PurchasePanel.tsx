"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { QuantityInput } from "./QuantityInput";

type Props = { productId: string; stock: number };

/**
 * 數量選擇 + 加入購物車。
 * 購物車功能（F5）完成前，按鈕一律導向登入頁並帶 next 回到本商品。
 */
export function PurchasePanel({ productId, stock }: Props) {
  const [quantity, setQuantity] = useState(1);
  const soldOut = stock <= 0;

  if (soldOut) {
    return (
      <Button size="lg" disabled className="w-full sm:w-auto">
        已售完
      </Button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <QuantityInput value={quantity} max={stock} onChange={setQuantity} />
      <Link
        href={`/login?next=${encodeURIComponent(`/products/${productId}`)}`}
        className={buttonVariants({ size: "lg", className: "flex-1 sm:flex-none" })}
      >
        <ShoppingCart aria-hidden />
        加入購物車
      </Link>
    </div>
  );
}
