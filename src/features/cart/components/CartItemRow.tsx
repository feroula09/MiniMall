"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ProductImage } from "@/components/ProductImage";
import { QuantityInput } from "@/components/QuantityInput";
import { Button } from "@/components/ui/button";
import type { ActionResult } from "@/lib/action-result";
import { formatPrice } from "@/lib/money";
import { purchaseLimit } from "@/lib/purchase-limit";
import { cn } from "@/lib/utils";
import { removeCartItem, updateCartItem } from "../actions";
import type { CartItemData } from "../queries";
import { issueMessage, lineIssue } from "../summary";

export function CartItemRow({ item }: { item: CartItemData }) {
  const [pending, startTransition] = useTransition();
  const { product } = item;
  const issue = lineIssue(item);
  // 下架或售完時不能調整數量，只能移除
  const adjustable = !issue || issue.kind === "insufficient";

  const run = (action: () => Promise<ActionResult>) =>
    startTransition(async () => {
      const result = await action();
      if (!result.ok) toast.error(result.error);
    });

  return (
    <li className={cn("flex gap-4 py-4 transition-opacity", pending && "opacity-60")} aria-busy={pending}>
      <Link href={`/products/${product.id}`} className="w-20 shrink-0 sm:w-24">
        <ProductImage src={product.image} alt={product.name} sizes="96px" />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <Link href={`/products/${product.id}`} className="line-clamp-2 font-medium hover:underline">
            {product.name}
          </Link>
          <p className="text-sm text-muted-foreground">單價 {formatPrice(product.price)}</p>
          {issue ? <p className="text-sm font-medium text-destructive">{issueMessage(issue)}</p> : null}
        </div>

        <div className="flex items-center gap-3 sm:flex-col sm:items-end">
          {adjustable ? (
            <QuantityInput
              value={item.quantity}
              max={Math.max(1, purchaseLimit(product.stock))}
              disabled={pending}
              onChange={(quantity) => {
                if (quantity !== item.quantity) run(() => updateCartItem({ itemId: item.id, quantity }));
              }}
            />
          ) : (
            <span className="text-sm text-muted-foreground">數量 {item.quantity}</span>
          )}
          <p className="w-20 text-right font-semibold sm:w-auto">
            {/* 有問題的項目不計入合計，小計也不顯示 */}
            {issue ? "—" : formatPrice(product.price * item.quantity)}
          </p>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`移除 ${product.name}`}
            disabled={pending}
            onClick={() => run(() => removeCartItem({ itemId: item.id }))}
            className="ml-auto sm:ml-0"
          >
            <Trash2 aria-hidden />
          </Button>
        </div>
      </div>
    </li>
  );
}
