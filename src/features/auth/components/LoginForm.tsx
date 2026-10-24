"use client";

import { useActionState } from "react";
import Link from "next/link";
import { FormError } from "@/components/form/FormError";
import { FormField } from "@/components/form/FormField";
import { Button } from "@/components/ui/button";
import { registerHref } from "@/lib/safe-redirect";
import { login, type AuthFormState } from "../actions";

const initialState: AuthFormState = { ok: true };

export function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState(login, initialState);
  const fieldErrors = state.ok ? undefined : state.fieldErrors;

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <input type="hidden" name="next" value={next} />
      <FormError message={state.ok ? undefined : state.error} />
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
        autoComplete="current-password"
        required
        errors={fieldErrors?.password}
      />
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "登入中…" : "登入"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        還沒有帳號？{" "}
        <Link href={registerHref(next)} className="font-medium text-foreground underline-offset-4 hover:underline">
          立即註冊
        </Link>
      </p>
    </form>
  );
}
