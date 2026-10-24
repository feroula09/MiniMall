"use client";

import { Trash2 } from "lucide-react";
import { ConfirmDeleteButton } from "@/components/ConfirmDeleteButton";
import { Button } from "@/components/ui/button";
import { deleteCategory } from "../actions";

type Props = { id: string; name: string; productCount: number };

export function DeleteCategoryButton({ id, name, productCount }: Props) {
  // 有商品時直接停用；伺服器端仍會再檢查一次
  if (productCount > 0) {
    return (
      <Button variant="ghost" size="icon-sm" disabled aria-label={`${name} 底下有商品，無法刪除`} title="分類底下有商品，無法刪除">
        <Trash2 aria-hidden />
      </Button>
    );
  }

  return (
    <ConfirmDeleteButton
      label={`刪除 ${name}`}
      title={`刪除分類「${name}」？`}
      description="刪除後無法復原。"
      successMessage={`已刪除分類「${name}」`}
      onConfirm={() => deleteCategory({ id })}
    />
  );
}
