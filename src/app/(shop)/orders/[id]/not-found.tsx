import Link from "next/link";
import { PackageX } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

// 不存在或不屬於自己的訂單都顯示這頁（不透露訂單是否存在）
export default function OrderNotFound() {
  return (
    <div className="flex flex-col items-center gap-4 py-24 text-center">
      <PackageX className="size-10 text-muted-foreground" aria-hidden />
      <h1 className="text-2xl font-semibold">找不到這筆訂單</h1>
      <Link href="/orders" className={buttonVariants({ variant: "outline" })}>
        回到我的訂單
      </Link>
    </div>
  );
}
