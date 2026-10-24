const dateTime = new Intl.DateTimeFormat("zh-TW", {
  timeZone: "Asia/Taipei",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/** 顯示用的台北時間，例如 2026/10/25 07:05 */
export function formatDateTime(date: Date): string {
  return dateTime.format(date);
}
