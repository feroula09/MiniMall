"use client";

import { useActionState } from "react";
import Link from "next/link";
import { FormError } from "@/components/form/FormError";
import { FormField } from "@/components/form/FormField";
import { Button } from "@/components/ui/button";
import { loginHref } from "@/lib/safe-redirect";
import { register, type AuthFormState } from "../actions";

const initialState: AuthFormState = { ok: true };

export function RegisterForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState(register, initialState);
  const fieldErrors = state.ok ? undefined : state.fieldErrors;

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <input type="hidden" name="next" value={next} />
      <FormError message={state.ok ? undefined : state.error} />
      <FormField
        name="name"
        label="名稱"
        autoComplete="name"
        required
        maxLength={30}
        defaultValue={state.values?.name}
        errors={fieldErrors?.name}
      />
      <FormField
        name="email"
        label="Email"
        type="email"
        autoComplete="email"
        required
        defaultValue={state.values?.email}
        errors={fieldErrors?.email}
      />
      <FormField
        name="password"
        label="密碼"
        type="password"
        autoComplete="new-password"
        required
        hint="至少 8 個字元"
        errors={fieldErrors?.password}
      />
      <FormField
        name="confirmPassword"
        label="確認密碼"
        type="password"
        autoComplete="new-password"
        required
        errors={fieldErrors?.confirmPassword}
      />
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "註冊中…" : "註冊"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        已經有帳號？{" "}
        <Link href={loginHref(next)} className="font-medium text-foreground underline-offset-4 hover:underline">
          登入
        </Link>
      </p>
    </form>
  );
}
