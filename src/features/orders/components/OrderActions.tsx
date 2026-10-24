"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type { OrderStatus } from "@prisma/client";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import type { ActionResult } from "@/lib/action-result";
import { canTransition } from "@/lib/order-status";
import { cancelOrder, confirmReceipt } from "../actions";

/** 依訂單狀態顯示使用者可執行的動作；是否允許以伺服器端的狀態機為準 */
export function OrderActions({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const [pending, startTransition] = useTransition();
  const [confirmCancel, setConfirmCancel] = useState(false);

  const run = (action: () => Promise<ActionResult>, success: string, after?: () => void) =>
    startTransition(async () => {
      const result = await action();
      if (result.ok) toast.success(success);
      else toast.error(result.error);
      after?.();
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
        <Button disabled={pending} onClick={() => run(() => confirmReceipt({ orderId }), "已確認收貨")}>
          確認收貨
        </Button>
      ) : null}
      {/* 送出期間不允許以 Esc 或點背景關閉，避免看不到結果或重複送出 */}
      {canCancel ? (
        <AlertDialog open={confirmCancel} onOpenChange={(open) => !pending && setConfirmCancel(open)}>
          <Button variant="outline" disabled={pending} onClick={() => setConfirmCancel(true)}>
            取消訂單
          </Button>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>確定要取消這筆訂單嗎？</AlertDialogTitle>
              <AlertDialogDescription>
                {status === "PAID" ? "此訂單已付款，取消後將視為退款（模擬）。" : "取消後無法復原。"}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={pending}>再想想</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                disabled={pending}
                onClick={() => run(() => cancelOrder({ orderId }), "訂單已取消", () => setConfirmCancel(false))}
              >
                {pending ? "取消中…" : "確定取消"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : null}
    </div>
  );
}
