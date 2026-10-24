import { purchaseLimit } from "@/lib/purchase-limit";

export type CartLineInput = {
  quantity: number;
  product: { price: number; stock: number; isActive: boolean };
};

export type CartLineIssue =
  | { kind: "inactive" }
  | { kind: "soldOut" }
  | { kind: "insufficient"; available: number };

export function lineIssue(line: CartLineInput): CartLineIssue | null {
  if (!line.product.isActive) return { kind: "inactive" };
  if (line.product.stock <= 0) return { kind: "soldOut" };
  if (line.quantity > line.product.stock) return { kind: "insufficient", available: line.product.stock };
  return null;
}

export function issueMessage(issue: CartLineIssue): string {
  switch (issue.kind) {
    case "inactive":
      return "商品已下架";
    case "soldOut":
      return "已售完";
    case "insufficient":
      return `庫存不足，目前剩 ${issue.available} 件`;
  }
}

export type CartSummary = {
  /** 可結帳的件數（與 subtotal 同一範圍，不含有問題的項目） */
  itemCount: number;
  /** 合計（分），只計入沒有問題的項目 */
  subtotal: number;
  hasIssues: boolean;
  canCheckout: boolean;
};

export function summarizeCart(lines: CartLineInput[]): CartSummary {
  let itemCount = 0;
  let subtotal = 0;
  let hasIssues = false;
  for (const line of lines) {
    if (lineIssue(line)) {
      hasIssues = true;
      continue;
    }
    itemCount += line.quantity;
    subtotal += line.product.price * line.quantity;
  }
  return { itemCount, subtotal, hasIssues, canCheckout: lines.length > 0 && !hasIssues };
}

/** 加入購物車後的數量是否可行；不可行時回傳錯誤訊息 */
export function checkAddQuantity(existing: number, adding: number, stock: number): string | null {
  const limit = purchaseLimit(stock);
  if (existing + adding <= limit) return null;
  const remaining = Math.max(0, limit - existing);
  if (remaining === 0) return existing > 0 ? `購物車內已有 ${existing} 件，已達可購買上限` : "已售完";
  if (existing === 0) return `庫存不足，最多可購買 ${remaining} 件`;
  return `購物車內已有 ${existing} 件，最多還能加入 ${remaining} 件`;
}
