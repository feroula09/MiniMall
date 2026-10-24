import { Suspense } from "react";
import type { Metadata } from "next";
import { CheckoutSkeleton, CheckoutView } from "@/features/checkout/components/CheckoutView";

export const metadata: Metadata = { title: "結帳" };

export default function CheckoutPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">結帳</h1>
      <Suspense fallback={<CheckoutSkeleton />}>
        <CheckoutView />
      </Suspense>
    </div>
  );
}
