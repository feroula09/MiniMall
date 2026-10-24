"use client";

import { useTransition } from "react";
import { CreditCard } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { payOrder } from "../actions";

export function PayButton({ orderId }: { orderId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      size="lg"
      className="w-full"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const result = await payOrder({ orderId });
          if (result.ok) toast.success("付款成功");
          else toast.error(result.error);
        })
      }
    >
      <CreditCard aria-hidden />
      {pending ? "付款處理中…" : "確認付款（模擬）"}
    </Button>
  );
}
