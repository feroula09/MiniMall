"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toggleProductActive } from "../actions";

type Props = { id: string; name: string; isActive: boolean };

/** 列表上直接切換上下架 */
export function ToggleActiveButton({ id, name, isActive }: Props) {
  const [pending, startTransition] = useTransition();

  const toggle = () =>
    startTransition(async () => {
      const result = await toggleProductActive({ id, isActive: !isActive });
      if (result.ok) toast.success(`「${name}」已${isActive ? "下架" : "上架"}`);
      else toast.error(result.error);
    });

  return (
    <Button
      variant="outline"
      size="xs"
      disabled={pending}
      onClick={toggle}
      aria-label={`${name}：${isActive ? "上架中，點擊下架" : "已下架，點擊上架"}`}
      className={cn(isActive ? "text-emerald-700 dark:text-emerald-400" : "text-muted-foreground")}
    >
      <span className={cn("size-1.5 rounded-full", isActive ? "bg-emerald-500" : "bg-muted-foreground/50")} aria-hidden />
      {pending ? "更新中…" : isActive ? "上架中" : "已下架"}
    </Button>
  );
}
