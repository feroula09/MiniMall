import Link from "next/link";
import type { ReactNode } from "react";
import { Store } from "lucide-react";

/** 前台與後台頂部列共用的品牌連結；compact 時手機版只顯示圖示（文字保留給螢幕閱讀器） */
export function BrandLink({ href = "/", compact, suffix }: { href?: string; compact?: boolean; suffix?: ReactNode }) {
  return (
    <Link href={href} className="flex shrink-0 items-center gap-2 font-semibold tracking-tight">
      <Store className="size-5" aria-hidden />
      <span className={compact ? "sr-only sm:not-sr-only" : undefined}>Mini Mall</span>
      {suffix}
    </Link>
  );
}

/** 頂部列外層的共用樣式 */
export const headerBarClass =
  "sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80";
