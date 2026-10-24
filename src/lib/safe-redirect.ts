/**
 * 只接受站內路徑作為登入後的回跳目標，避免開放式重導（例如 next=//evil.com）。
 * 不合法時回傳 fallback。
 */
export function sanitizeNext(next: unknown, fallback = "/"): string {
  if (typeof next !== "string" || next.length === 0 || next.length > 512) return fallback;
  if (!next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  // 控制字元（含換行、tab）可能被瀏覽器忽略而改變網址解析結果
  if (/[\u0000-\u001f\u007f]/.test(next)) return fallback;
  return next;
}

function withNext(path: string, next: string): string {
  const target = sanitizeNext(next);
  return target === "/" ? path : `${path}?next=${encodeURIComponent(target)}`;
}

export const loginHref = (next: string) => withNext("/login", next);
export const registerHref = (next: string) => withNext("/register", next);
