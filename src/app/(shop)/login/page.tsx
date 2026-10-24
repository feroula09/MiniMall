import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthCard, AuthFormSkeleton, GuestOnly } from "@/features/auth/components/AuthCard";
import { LoginForm } from "@/features/auth/components/LoginForm";

export const metadata: Metadata = { title: "登入" };

export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <AuthCard title="登入" description="登入後即可使用購物車與查看訂單">
      <Suspense fallback={<AuthFormSkeleton fields={2} />}>
        <GuestOnly searchParams={searchParams} render={(next) => <LoginForm next={next} />} />
      </Suspense>
    </AuthCard>
  );
}
