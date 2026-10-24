import { Suspense } from "react";
import type { Metadata } from "next";
import { AdminShell, AdminShellSkeleton } from "@/components/layout/AdminShell";

export const metadata: Metadata = { title: { default: "後台", template: "%s | Mini Mall 後台" } };

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <Suspense fallback={<AdminShellSkeleton />}>
      <AdminShell>{children}</AdminShell>
    </Suspense>
  );
}
