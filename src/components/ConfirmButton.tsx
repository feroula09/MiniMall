"use client";

import { useState, useTransition, type ComponentProps, type ReactNode } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import type { ActionResult } from "@/lib/action-result";

type Props = {
  /** 觸發按鈕的內容 */
  children: ReactNode;
  variant?: ComponentProps<typeof Button>["variant"];
  size?: ComponentProps<typeof Button>["size"];
  /** 觸發按鈕的 aria-label（按鈕只有圖示時必填） */
  label?: string;
  title: ReactNode;
  description: ReactNode;
  confirmText: string;
  pendingText: string;
  cancelText?: string;
  destructive?: boolean;
  successMessage: string;
  onConfirm: () => Promise<ActionResult>;
};

/** 按鈕 + 確認對話框，確認後執行 Server Action 並以 toast 回報；執行中不能關閉對話框 */
export function ConfirmButton({
  children,
  variant = "default",
  size,
  label,
  title,
  description,
  confirmText,
  pendingText,
  cancelText = "取消",
  destructive,
  successMessage,
  onConfirm,
}: Props) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const confirm = () =>
    startTransition(async () => {
      const result = await onConfirm();
      if (result.ok) toast.success(successMessage);
      else toast.error(result.error);
      setOpen(false);
    });

  return (
    <AlertDialog open={open} onOpenChange={(next) => !pending && setOpen(next)}>
      <Button variant={variant} size={size} aria-label={label} disabled={pending} onClick={() => setOpen(true)}>
        {children}
      </Button>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>{cancelText}</AlertDialogCancel>
          <AlertDialogAction variant={destructive ? "destructive" : "default"} disabled={pending} onClick={confirm}>
            {pending ? pendingText : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
