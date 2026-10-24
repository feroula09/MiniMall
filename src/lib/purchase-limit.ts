/** 每項商品在購物車內的數量上限，避免一次塞入極大數量 */
export const MAX_QUANTITY_PER_ITEM = 99;

/** 單一商品可放進購物車的最大數量（受庫存與每項上限限制） */
export function purchaseLimit(stock: number): number {
  return Math.max(0, Math.min(stock, MAX_QUANTITY_PER_ITEM));
}
