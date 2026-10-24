import Link from "next/link";
import { PackageX } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export default function AdminProductNotFound() {
  return (
    <div className="flex flex-col items-center gap-4 py-24 text-center">
      <PackageX className="size-10 text-muted-foreground" aria-hidden />
      <h1 className="text-2xl font-semibold">找不到這個商品</h1>
      <p className="text-muted-foreground">商品可能已被刪除。</p>
      <Link href="/admin/products" className={buttonVariants({ variant: "outline" })}>
        回到商品列表
      </Link>
    </div>
  );
}
