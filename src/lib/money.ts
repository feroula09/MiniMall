// 金額在系統內一律以「分」(Int) 儲存與計算，只在顯示與表單輸入時轉換

const formatter = new Intl.NumberFormat("zh-TW", {
  style: "currency",
  currency: "TWD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

/** 12900 → "$129" ；12950 → "$129.5" */
export function formatPrice(cents: number): string {
  return formatter.format(cents / 100);
}

/**
 * 表單輸入的「元」字串轉成分。非數字、負數或超過兩位小數時回傳 null。
 * 只收字串：數字可能已帶浮點誤差（0.1 + 0.2），不該再拿來換算金額。
 */
export function yuanToCents(input: string): number | null {
  const text = input.trim();
  if (!/^\d+(\.\d{1,2})?$/.test(text)) return null;
  const [whole, fraction = ""] = text.split(".");
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  return Number.isSafeInteger(cents) ? cents : null;
}

/** 分轉成表單顯示用的「元」字串：12950 → "129.5" */
export function centsToYuan(cents: number): string {
  return String(cents / 100);
}
