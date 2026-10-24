"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
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
import { deleteCategory } from "../actions";

type Props = { id: string; name: string; productCount: number };

export function DeleteCategoryButton({ id, name, productCount }: Props) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  // 有商品時直接停用；伺服器端仍會再檢查一次
  if (productCount > 0) {
    return (
      <Button variant="ghost" size="icon-sm" disabled aria-label={`${name} 底下有商品，無法刪除`} title="分類底下有商品，無法刪除">
        <Trash2 aria-hidden />
      </Button>
    );
  }

  const confirm = () =>
    startTransition(async () => {
      const result = await deleteCategory({ id });
      if (result.ok) toast.success(`已刪除分類「${name}」`);
      else toast.error(result.error);
      setOpen(false);
    });

  return (
    <AlertDialog open={open} onOpenChange={(next) => !pending && setOpen(next)}>
      <Button variant="ghost" size="icon-sm" aria-label={`刪除 ${name}`} onClick={() => setOpen(true)}>
        <Trash2 aria-hidden />
      </Button>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>刪除分類「{name}」？</AlertDialogTitle>
          <AlertDialogDescription>刪除後無法復原。</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>取消</AlertDialogCancel>
          <AlertDialogAction variant="destructive" disabled={pending} onClick={confirm}>
            {pending ? "刪除中…" : "刪除"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
