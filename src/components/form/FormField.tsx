import type { ComponentProps } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = ComponentProps<typeof Input> & {
  name: string;
  label: string;
  errors?: string[];
  hint?: string;
};

/** 標籤 + 輸入框 + 錯誤訊息，錯誤以 aria-describedby 連到輸入框 */
export function FormField({ name, label, errors, hint, id = name, ...inputProps }: Props) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const hasError = Boolean(errors?.length);
  // 有錯誤時只顯示錯誤、不顯示提示，describedby 也只指向實際存在的元素
  const describedBy = hasError ? errorId : hint ? hintId : undefined;

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} name={name} aria-invalid={hasError || undefined} aria-describedby={describedBy} {...inputProps} />
      {hint && !hasError ? (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
      {hasError ? (
        <p id={errorId} className="text-xs text-destructive">
          {errors![0]}
        </p>
      ) : null}
    </div>
  );
}
