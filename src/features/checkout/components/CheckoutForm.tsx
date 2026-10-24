"use client";

import { useActionState } from "react";
import { FormError } from "@/components/form/FormError";
import { FormField } from "@/components/form/FormField";
import { Button } from "@/components/ui/button";
import { placeOrder, type CheckoutFormState } from "../actions";

const initialState: CheckoutFormState = { ok: true };

/** expectedTotal：頁面上顯示的合計（分），下單時伺服器會比對，避免以使用者沒看到的價格成立訂單 */
export function CheckoutForm({ expectedTotal }: { expectedTotal: number }) {
  const [state, formAction, pending] = useActionState(placeOrder, initialState);
  const fieldErrors = state.ok ? undefined : state.fieldErrors;

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <input type="hidden" name="expectedTotal" value={expectedTotal} />
      <FormError message={state.ok ? undefined : state.error} />
      <FormField
        name="receiverName"
        label="收件人"
        autoComplete="name"
        required
        maxLength={30}
        defaultValue={state.values?.receiverName}
        errors={fieldErrors?.receiverName}
      />
      <FormField
        name="phone"
        label="手機號碼"
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        placeholder="0912345678"
        required
        defaultValue={state.values?.phone}
        errors={fieldErrors?.phone}
      />
      <FormField
        name="address"
        label="收件地址"
        autoComplete="street-address"
        required
        maxLength={200}
        defaultValue={state.values?.address}
        errors={fieldErrors?.address}
      />
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "建立訂單中…" : "確認下單"}
      </Button>
    </form>
  );
}
