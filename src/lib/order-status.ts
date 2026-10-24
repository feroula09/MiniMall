import type { OrderStatus } from "@prisma/client";

// 訂單狀態機：所有改變訂單狀態的程式都要經過這裡，見 specs/SPEC.md §5

export type OrderAction = "pay" | "ship" | "confirm" | "cancel";
export type OrderActor = "user" | "admin";

type Transition = { from: readonly OrderStatus[]; to: OrderStatus; actors: readonly OrderActor[] };

export const ORDER_TRANSITIONS: Record<OrderAction, Transition> = {
  pay: { from: ["PENDING"], to: "PAID", actors: ["user"] },
  ship: { from: ["PAID"], to: "SHIPPED", actors: ["admin"] },
  confirm: { from: ["SHIPPED"], to: "COMPLETED", actors: ["user"] },
  cancel: { from: ["PENDING", "PAID"], to: "CANCELLED", actors: ["user", "admin"] },
};

/** 進入各狀態時要寫入的時間欄位 */
export const STATUS_TIMESTAMP = {
  PAID: "paidAt",
  SHIPPED: "shippedAt",
  COMPLETED: "completedAt",
  CANCELLED: "cancelledAt",
} as const satisfies Partial<Record<OrderStatus, string>>;

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "待付款",
  PAID: "已付款",
  SHIPPED: "已出貨",
  COMPLETED: "已完成",
  CANCELLED: "已取消",
};

/** 檢查 actor 能否對目前狀態執行動作；可以時回傳目標狀態，否則回傳 null */
export function nextStatus(from: OrderStatus, action: OrderAction, actor: OrderActor): OrderStatus | null {
  const t = ORDER_TRANSITIONS[action];
  return t.from.includes(from) && t.actors.includes(actor) ? t.to : null;
}

export function canTransition(from: OrderStatus, action: OrderAction, actor: OrderActor): boolean {
  return nextStatus(from, action, actor) !== null;
}

/**
 * 產生條件式更新用的 where 與 data：
 * `updateMany({ where: { id, ...where }, data })`，count === 0 代表訂單目前的狀態不允許此動作。
 * actor 沒有權限執行此動作時直接拋錯（屬於程式錯誤，不是使用者輸入問題）。
 */
export function transitionUpdate(action: OrderAction, actor: OrderActor, now: Date = new Date()) {
  const t = ORDER_TRANSITIONS[action];
  if (!t.actors.includes(actor)) throw new Error(`${actor} 不能執行訂單動作 ${action}`);
  const timestampField = STATUS_TIMESTAMP[t.to as keyof typeof STATUS_TIMESTAMP];
  return {
    where: { status: { in: [...t.from] } },
    data: { status: t.to, [timestampField]: now },
  };
}
