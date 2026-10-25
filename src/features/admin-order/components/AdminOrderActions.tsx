"use client";

import type { OrderStatus } from "@prisma/client";
import { ConfirmButton } from "@/components/ConfirmButton";
import { canTransition } from "@/lib/order-status";
import { adminCancelOrder, shipOrder } from "../actions";

type Props = { orderId: string; orderNo: string; status: OrderStatus };

/** 依狀態顯示管理員可執行的動作；是否允許以伺服器端的狀態機為準 */
export function AdminOrderActions({ orderId, orderNo, status }: Props) {
  const canShip = canTransition(status, "ship", "admin");
  const canCancel = canTransition(status, "cancel", "admin");
  if (!canShip && !canCancel) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {canShip ? (
        <ConfirmButton
          title="確認出貨？"
          description={`訂單 ${orderNo} 將標記為已出貨，買家可在訂單頁確認收貨。出貨後無法取消。`}
          confirmText="確認出貨"
          pendingText="出貨中…"
          successMessage="訂單已出貨"
          onConfirm={() => shipOrder({ orderId })}
        >
          出貨
        </ConfirmButton>
      ) : null}
      {canCancel ? (
        <ConfirmButton
          variant="outline"
          title="取消這筆訂單？"
          description={
            status === "PAID"
              ? "此訂單已付款，取消後視為退款（模擬），商品庫存會回補。"
              : "訂單取消後商品庫存會回補，無法復原。"
          }
          confirmText="確定取消"
          pendingText="取消中…"
          cancelText="再想想"
          destructive
          successMessage="訂單已取消"
          onConfirm={() => adminCancelOrder({ orderId })}
        >
          取消訂單
        </ConfirmButton>
      ) : null}
    </div>
  );
}
