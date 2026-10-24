"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  value: number;
  /** 上限，呼叫端需保證 ≥ 1 */
  max: number;
  onChange: (value: number) => void;
  /** 例如送出中時停用，避免連點時以舊數值重複送出 */
  disabled?: boolean;
};

/** 數量選擇器，值固定在 1 ～ max 之間 */
export function QuantityInput({ value, max, onChange, disabled }: Props) {
  // 輸入中的文字先暫存，離開欄位時才校正，才能先清空再輸入新數字
  const [draft, setDraft] = useState<string | null>(null);
  const clamp = (n: number) => Math.min(Math.max(1, Math.trunc(n) || 1), max);

  const commit = () => {
    if (draft !== null) onChange(clamp(Number(draft)));
    setDraft(null);
  };

  return (
    <div className="inline-flex items-center rounded-lg border">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="減少數量"
        disabled={disabled || value <= 1}
        onClick={() => onChange(clamp(value - 1))}
      >
        <Minus aria-hidden />
      </Button>
      <input
        type="number"
        inputMode="numeric"
        min={1}
        max={max}
        value={draft ?? value}
        aria-label="數量"
        disabled={disabled}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
        }}
        className="h-8 w-12 [appearance:textfield] bg-transparent text-center text-sm outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="增加數量"
        disabled={disabled || value >= max}
        onClick={() => onChange(clamp(value + 1))}
      >
        <Plus aria-hidden />
      </Button>
    </div>
  );
}
