import Link from "next/link";
import { PackageX } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

// 在 (shop) layout 內渲染，Header/Footer 已由 layout 提供
export default function ProductNotFound() {
  return (
    <div className="flex flex-col items-center gap-4 py-24 text-center">
      <PackageX className="size-10 text-muted-foreground" aria-hidden />
      <h1 className="text-2xl font-semibold">找不到這個商品</h1>
      <p className="text-muted-foreground">商品可能已下架或不存在。</p>
      <Link href="/" className={buttonVariants({ variant: "outline" })}>
        繼續逛逛
      </Link>
    </div>
  );
}
