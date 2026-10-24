"use client";

import { useActionState, useEffect, useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import { FormError } from "@/components/form/FormError";
import { FormField } from "@/components/form/FormField";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createCategory, updateCategory, type CategoryFormState } from "../actions";
import type { AdminCategory } from "../queries";

type Props = { category?: Pick<AdminCategory, "id" | "name" | "slug" | "sortOrder"> };

/** 新增（不傳 category）或編輯分類的對話框 */
export function CategoryFormDialog({ category }: Props) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const editing = Boolean(category);

  return (
    // 儲存中不允許以 Esc、點背景或 X 關閉，避免看不到伺服器回傳的錯誤
    <Dialog open={open} onOpenChange={(next) => !pending && setOpen(next)}>
      {editing ? (
        <Button variant="ghost" size="icon-sm" aria-label={`編輯 ${category!.name}`} onClick={() => setOpen(true)}>
          <Pencil aria-hidden />
        </Button>
      ) : (
        <Button onClick={() => setOpen(true)}>
          <Plus aria-hidden />
          新增分類
        </Button>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? "編輯分類" : "新增分類"}</DialogTitle>
          <DialogDescription>slug 會出現在商品列表的網址上，例如 /?category=home。</DialogDescription>
        </DialogHeader>
        {/* 每次打開都重新掛載表單，清掉上次的錯誤與輸入 */}
        {open ? (
          <CategoryForm category={category} onPendingChange={setPending} onDone={() => setOpen(false)} />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

type FormProps = Props & { onDone: () => void; onPendingChange: (pending: boolean) => void };

function CategoryForm({ category, onDone, onPendingChange }: FormProps) {
  const action = category ? updateCategory : createCategory;
  const [state, formAction, pending] = useActionState(async (prev: CategoryFormState, formData: FormData) => {
    const result = await action(prev, formData);
    if (result.ok) {
      toast.success(category ? "分類已更新" : "分類已新增");
      onDone();
    }
    return result;
  }, { ok: true } as CategoryFormState);
  useEffect(() => onPendingChange(pending), [pending, onPendingChange]);
  const errors = state.ok ? undefined : state.fieldErrors;
  const value = (key: "name" | "slug" | "sortOrder") => state.values?.[key] ?? (category ? String(category[key]) : undefined);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {category ? <input type="hidden" name="id" value={category.id} /> : null}
      <FormError message={state.ok ? undefined : state.error} />
      <FormField name="name" label="名稱" required maxLength={20} defaultValue={value("name")} errors={errors?.name} />
      <FormField
        name="slug"
        label="Slug"
        required
        maxLength={40}
        placeholder="outdoor-gear"
        hint="小寫英文、數字與連字號"
        defaultValue={value("slug")}
        errors={errors?.slug}
      />
      <FormField
        name="sortOrder"
        label="排序"
        type="number"
        inputMode="numeric"
        min={0}
        max={9999}
        hint="數字越小越前面，留空為 0"
        defaultValue={value("sortOrder") ?? "0"}
        errors={errors?.sortOrder}
      />
      <DialogFooter>
        <Button type="submit" disabled={pending}>
          {pending ? "儲存中…" : "儲存"}
        </Button>
      </DialogFooter>
    </form>
  );
}
