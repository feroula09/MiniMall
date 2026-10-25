"use client";

import { useTransition } from "react";
import Link from "next/link";
import type { OrderStatus } from "@prisma/client";
import { toast } from "sonner";
import { ConfirmButton } from "@/components/ConfirmButton";
import { Button, buttonVariants } from "@/components/ui/button";
import { canTransition } from "@/lib/order-status";
import { cancelOrder, confirmReceipt } from "../actions";

/** 依訂單狀態顯示使用者可執行的動作；是否允許以伺服器端的狀態機為準 */
export function OrderActions({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const [pending, startTransition] = useTransition();

  const confirm = () =>
    startTransition(async () => {
      const result = await confirmReceipt({ orderId });
      if (result.ok) toast.success("已確認收貨");
      else toast.error(result.error);
    });

  const canPay = canTransition(status, "pay", "user");
  const canCancel = canTransition(status, "cancel", "user");
  const canConfirm = canTransition(status, "confirm", "user");
  if (!canPay && !canCancel && !canConfirm) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {canPay ? (
        <Link href={`/orders/${orderId}/pay`} className={buttonVariants()}>
          前往付款
        </Link>
      ) : null}
      {canConfirm ? (
        <Button disabled={pending} onClick={confirm}>
          確認收貨
        </Button>
      ) : null}
      {canCancel ? (
        <ConfirmButton
          variant="outline"
          title="確定要取消這筆訂單嗎？"
          description={status === "PAID" ? "此訂單已付款，取消後將視為退款（模擬）。" : "取消後無法復原。"}
          confirmText="確定取消"
          pendingText="取消中…"
          cancelText="再想想"
          destructive
          successMessage="訂單已取消"
          onConfirm={() => cancelOrder({ orderId })}
        >
          取消訂單
        </ConfirmButton>
      ) : null}
    </div>
  );
}
