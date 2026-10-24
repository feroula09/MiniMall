"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { QuantityInput } from "@/components/QuantityInput";
import { Button } from "@/components/ui/button";
import { addToCart } from "@/features/cart/actions";
import { purchaseLimit } from "@/lib/purchase-limit";

type Props = { productId: string; stock: number };

/** 數量選擇 + 加入購物車。未登入時由 action 導向登入頁，登入後回到本商品 */
export function PurchasePanel({ productId, stock }: Props) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [pending, startTransition] = useTransition();

  if (stock <= 0) {
    return (
      <Button size="lg" disabled className="w-full sm:w-auto">
        已售完
      </Button>
    );
  }

  const add = () =>
    startTransition(async () => {
      const result = await addToCart({ productId, quantity });
      if (result.ok) {
        toast.success(`已加入購物車（${quantity} 件）`, {
          action: { label: "查看購物車", onClick: () => router.push("/cart") },
        });
        setQuantity(1);
      } else {
        toast.error(result.error);
      }
    });

  return (
    <div className="flex flex-wrap items-center gap-3">
      <QuantityInput value={quantity} max={purchaseLimit(stock)} onChange={setQuantity} disabled={pending} />
      <Button size="lg" className="flex-1 sm:flex-none" disabled={pending} onClick={add}>
        <ShoppingCart aria-hidden />
        {pending ? "加入中…" : "加入購物車"}
      </Button>
    </div>
  );
}
