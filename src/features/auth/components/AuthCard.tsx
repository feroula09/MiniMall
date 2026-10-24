import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentUser } from "@/lib/auth-guard";
import { sanitizeNext } from "@/lib/safe-redirect";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export function AuthCard({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <Card className="mx-auto my-6 w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

/**
 * 解析 next 參數並擋掉已登入的使用者（直接送往 next）。
 * 讀取 searchParams 與 cookies，必須放在 Suspense 內。
 */
export async function GuestOnly({
  searchParams,
  render,
}: {
  searchParams: SearchParams;
  render: (next: string) => ReactNode;
}) {
  const raw = (await searchParams).next;
  const next = sanitizeNext(Array.isArray(raw) ? raw[0] : raw);
  if (await getCurrentUser()) redirect(next);
  return render(next);
}

export function AuthFormSkeleton({ fields }: { fields: number }) {
  return (
    <div className="space-y-4" aria-busy="true">
      {Array.from({ length: fields }, (_, i) => (
        <div key={i} className="space-y-1.5">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-8 w-full" />
        </div>
      ))}
      <Skeleton className="h-9 w-full" />
    </div>
  );
}
