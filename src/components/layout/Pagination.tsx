import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { pageItems } from "@/lib/pagination";

type Props = {
  page: number;
  pageCount: number;
  /** 產生指定頁碼的連結（由使用端保留其他篩選條件） */
  hrefFor: (page: number) => string;
};

export function Pagination({ page, pageCount, hrefFor }: Props) {
  if (pageCount <= 1) return null;

  const nav = "inline-flex items-center gap-1";
  return (
    <nav aria-label="分頁" className="flex items-center justify-center gap-1">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} className={buttonVariants({ variant: "ghost", size: "sm", className: nav })}>
          <ChevronLeft aria-hidden />
          上一頁
        </Link>
      ) : null}

      {pageItems(page, pageCount).map((item, i) =>
        item === "gap" ? (
          <span key={`gap-${i}`} className="px-2 text-muted-foreground" aria-hidden>
            …
          </span>
        ) : (
          <Link
            key={item}
            href={hrefFor(item)}
            aria-current={item === page ? "page" : undefined}
            className={buttonVariants({ variant: item === page ? "outline" : "ghost", size: "icon-sm" })}
          >
            {item}
          </Link>
        ),
      )}

      {page < pageCount ? (
        <Link href={hrefFor(page + 1)} className={buttonVariants({ variant: "ghost", size: "sm", className: nav })}>
          下一頁
          <ChevronRight aria-hidden />
        </Link>
      ) : null}
    </nav>
  );
}
