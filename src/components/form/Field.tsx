import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";

export type FieldControlProps = {
  id: string;
  "aria-invalid"?: true;
  "aria-describedby"?: string;
};

type Props = {
  id: string;
  label: string;
  errors?: string[];
  hint?: ReactNode;
  /** 收到要掛在控制項上的 id 與 aria 屬性 */
  children: (control: FieldControlProps) => ReactNode;
};

/** 標籤 + 任意控制項 + 提示或錯誤訊息，錯誤以 aria-describedby 連到控制項 */
export function Field({ id, label, errors, hint, children }: Props) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const hasError = Boolean(errors?.length);
  // 有錯誤時只顯示錯誤、不顯示提示，describedby 也只指向實際存在的元素
  const describedBy = hasError ? errorId : hint ? hintId : undefined;

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children({ id, "aria-invalid": hasError || undefined, "aria-describedby": describedBy })}
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
