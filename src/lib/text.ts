/** 依字元（非 UTF-16 code unit）截斷，避免把 emoji 等切成一半；有截斷時加上省略號 */
export function truncate(text: string, maxChars: number): string {
  const chars = Array.from(text);
  return chars.length > maxChars ? `${chars.slice(0, maxChars).join("")}…` : text;
}
