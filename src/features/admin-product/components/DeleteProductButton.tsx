"use client";

import { ConfirmDeleteButton } from "@/components/ConfirmDeleteButton";
import { deleteProduct } from "../actions";

type Props = { id: string; name: string };

export function DeleteProductButton({ id, name }: Props) {
  return (
    <ConfirmDeleteButton
      label={`刪除 ${name}`}
      title={`刪除商品「${name}」？`}
      description="商品會從所有購物車移除，已成立的訂單仍保留商品名稱、圖片與價格。刪除後無法復原；只想暫停販售的話，改用下架。"
      successMessage={`已刪除商品「${name}」`}
      onConfirm={() => deleteProduct({ id })}
    />
  );
}
