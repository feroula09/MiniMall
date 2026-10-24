import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthCard, AuthFormSkeleton, GuestOnly } from "@/features/auth/components/AuthCard";
import { RegisterForm } from "@/features/auth/components/RegisterForm";

export const metadata: Metadata = { title: "註冊" };

export default function RegisterPage({ searchParams }: PageProps<"/register">) {
  return (
    <AuthCard title="建立帳號" description="註冊後即可開始購物">
      <Suspense fallback={<AuthFormSkeleton fields={4} />}>
        <GuestOnly searchParams={searchParams} render={(next) => <RegisterForm next={next} />} />
      </Suspense>
    </AuthCard>
  );
}
