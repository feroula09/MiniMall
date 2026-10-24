import Form from "next/form";
import Link from "next/link";
import { NativeSelect } from "@/components/form/NativeSelect";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CategoryOption } from "@/features/catalog/queries";
import type { AdminProductParams } from "../params";

type Props = { params: AdminProductParams; categories: CategoryOption[] };

/** GET 表單：條件寫進網址，可分享、可上一頁；送出時頁碼自動回到第一頁 */
export function ProductFilters({ params, categories }: Props) {
  const filtered = Boolean(params.q || params.category || params.active);
  return (
    // key：網址條件改變時（例如點分頁或上一頁）重設欄位，與網址保持一致
    <Form
      key={`${params.q}|${params.category}|${params.active}`}
      action="/admin/products"
      role="search"
      className="flex flex-col gap-2 sm:flex-row sm:items-center"
    >
      <Input
        type="search"
        name="q"
        defaultValue={params.q}
        placeholder="搜尋商品名稱"
        aria-label="搜尋商品名稱"
        maxLength={50}
        className="sm:max-w-xs"
      />
      <NativeSelect name="category" defaultValue={params.category ?? ""} aria-label="分類" className="sm:w-40">
        <option value="">全部分類</option>
        {categories.map((c) => (
          <option key={c.id} value={c.slug}>
            {c.name}
          </option>
        ))}
      </NativeSelect>
      <NativeSelect name="active" defaultValue={params.active ?? ""} aria-label="上架狀態" className="sm:w-32">
        <option value="">全部狀態</option>
        <option value="true">上架中</option>
        <option value="false">已下架</option>
      </NativeSelect>
      <div className="flex gap-2">
        <Button type="submit" variant="secondary">
          篩選
        </Button>
        {filtered ? (
          <Link href="/admin/products" className={buttonVariants({ variant: "ghost" })}>
            清除
          </Link>
        ) : null}
      </div>
    </Form>
  );
}
