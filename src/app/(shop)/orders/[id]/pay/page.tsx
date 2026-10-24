import { Suspense } from "react";
import type { Metadata } from "next";
import { PaymentSkeleton, PaymentView } from "@/features/checkout/components/PaymentView";

export const metadata: Metadata = { title: "付款" };

export default function PayPage({ params }: PageProps<"/orders/[id]/pay">) {
  return (
    <div className="py-6">
      <Suspense fallback={<PaymentSkeleton />}>
        <PaymentView params={params} />
      </Suspense>
    </div>
  );
}
