"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList, FolderTree, LayoutDashboard, Package } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/admin", label: "概覽", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "商品", icon: Package },
  { href: "/admin/categories", label: "分類", icon: FolderTree },
  { href: "/admin/orders", label: "訂單", icon: ClipboardList },
];

/** 後台選單：桌面版為側邊欄，手機版為橫向捲動列 */
export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="後台選單" className="flex gap-1 overflow-x-auto md:flex-col">
      {ITEMS.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
              active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="size-4" aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
