import { CircleAlert } from "lucide-react";

/** 表單整體的錯誤訊息（例如「Email 或密碼錯誤」） */
export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
      <CircleAlert className="size-4 shrink-0" aria-hidden />
      {message}
    </p>
  );
}
