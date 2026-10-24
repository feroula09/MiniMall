import Image from "next/image";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  src: string | null;
  alt: string;
  sizes: string;
  className?: string;
  /** 首屏圖片立即載入（Next 16 已棄用 priority，文件建議改用 loading="eager"） */
  eager?: boolean;
};

/**
 * 正方形商品圖。圖片來源是本機的 /seed 與 /uploads，不需要最佳化服務，
 * 統一用 unoptimized（SVG 也因此能直接顯示）。
 */
export function ProductImage({ src, alt, sizes, className, eager }: Props) {
  return (
    <div className={cn("relative aspect-square overflow-hidden rounded-lg bg-muted", className)}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          loading={eager ? "eager" : "lazy"}
          unoptimized
          className="object-cover"
        />
      ) : (
        <div className="flex size-full items-center justify-center text-muted-foreground">
          <ImageOff className="size-8" aria-label="沒有圖片" />
        </div>
      )}
    </div>
  );
}
