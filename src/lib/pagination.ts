/** 頁碼列表：第一頁、最後一頁、目前頁前後各一頁，其餘以 "gap" 表示省略 */
export function pageItems(page: number, pageCount: number): (number | "gap")[] {
  const pages = new Set([1, pageCount, page - 1, page, page + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= pageCount).sort((a, b) => a - b);
  const items: (number | "gap")[] = [];
  for (const [i, p] of sorted.entries()) {
    if (i > 0 && p - sorted[i - 1] > 1) items.push("gap");
    items.push(p);
  }
  return items;
}
