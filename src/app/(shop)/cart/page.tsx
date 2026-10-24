import { Suspense } from "react";
import type { Metadata } from "next";
import { CartSkeleton, CartView } from "@/features/cart/components/CartView";

export const metadata: Metadata = { title: "購物車" };

export default function CartPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">購物車</h1>
      <Suspense fallback={<CartSkeleton />}>
        <CartView />
      </Suspense>
    </div>
  );
}
