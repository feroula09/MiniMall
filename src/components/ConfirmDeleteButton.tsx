"use client";

import type { ReactNode } from "react";
import { Trash2 } from "lucide-react";
import type { ActionResult } from "@/lib/action-result";
import { ConfirmButton } from "./ConfirmButton";

type Props = {
  /** 圖示按鈕的 aria-label */
  label: string;
  title: ReactNode;
  description: ReactNode;
  successMessage: string;
  onConfirm: () => Promise<ActionResult>;
};

/** 垃圾桶圖示按鈕 + 刪除確認對話框 */
export function ConfirmDeleteButton(props: Props) {
  return (
    <ConfirmButton variant="ghost" size="icon-sm" confirmText="刪除" pendingText="刪除中…" destructive {...props}>
      <Trash2 aria-hidden />
    </ConfirmButton>
  );
}
