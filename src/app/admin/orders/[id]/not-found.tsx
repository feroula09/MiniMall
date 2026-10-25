import Link from "next/link";
import { FileX } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export default function AdminOrderNotFound() {
  return (
    <div className="flex flex-col items-center gap-4 py-24 text-center">
      <FileX className="size-10 text-muted-foreground" aria-hidden />
      <h1 className="text-2xl font-semibold">找不到這筆訂單</h1>
      <Link href="/admin/orders" className={buttonVariants({ variant: "outline" })}>
        回到訂單列表
      </Link>
    </div>
  );
}
