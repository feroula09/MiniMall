import { randomInt } from "node:crypto";

const parts = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Taipei",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

/** 訂單編號：MM + 台北時間 yyyyMMddHHmmss + 4 位亂數，例如 MM202610251530120427 */
export function generateOrderNo(now: Date = new Date(), random: () => number = () => randomInt(0, 10_000)): string {
  const p = Object.fromEntries(parts.formatToParts(now).map((x) => [x.type, x.value]));
  const stamp = `${p.year}${p.month}${p.day}${p.hour}${p.minute}${p.second}`;
  return `MM${stamp}${String(random()).padStart(4, "0")}`;
}
