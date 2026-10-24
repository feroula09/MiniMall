import type { ComponentProps } from "react";
import { Input } from "@/components/ui/input";
import { Field } from "./Field";

type Props = ComponentProps<typeof Input> & {
  name: string;
  label: string;
  errors?: string[];
  hint?: string;
};

/** 標籤 + 輸入框 + 錯誤訊息 */
export function FormField({ name, label, errors, hint, id = name, ...inputProps }: Props) {
  return (
    <Field id={id} label={label} errors={errors} hint={hint}>
      {(control) => <Input name={name} {...control} {...inputProps} />}
    </Field>
  );
}
