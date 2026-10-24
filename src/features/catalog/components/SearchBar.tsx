"use client";

import Form from "next/form";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

/** 頁首搜尋框：送出到首頁 /?q=...，並保留目前選擇的分類與排序 */
export function SearchBar() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const category = searchParams.get("category") ?? undefined;
  const sort = searchParams.get("sort") ?? undefined;
  // key 讓網址條件改變時（例如點分類、上一頁）重設輸入框內容
  return (
    <SearchForm key={`${q}|${category}|${sort}`} defaultValue={q} category={category} sort={sort} />
  );
}

type FormProps = { defaultValue?: string; category?: string; sort?: string };

export function SearchForm({ defaultValue = "", category, sort }: FormProps) {
  return (
    <Form action="/" role="search" className="relative w-full">
      <Search
        className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder="搜尋商品"
        aria-label="搜尋商品"
        maxLength={50}
        className="pl-8"
      />
      {/* 值由伺服器端再驗證，這裡只負責原樣帶回 */}
      {category ? <input type="hidden" name="category" value={category} /> : null}
      {sort ? <input type="hidden" name="sort" value={sort} /> : null}
    </Form>
  );
}
