"use client";

import { useActionState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Field } from "@/components/form/Field";
import { FormError } from "@/components/form/FormError";
import { FormField } from "@/components/form/FormField";
import { NativeSelect } from "@/components/form/NativeSelect";
import { Button, buttonVariants } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { CategoryOption } from "@/features/catalog/queries";
import { centsToYuan } from "@/lib/money";
import { createProduct, updateProduct, type ProductFormState } from "../actions";
import type { AdminProductDetail } from "../queries";
import { MAX_STOCK, type ProductFormValues } from "../schemas";
import { ImageField } from "./ImageField";

type Props = { product?: AdminProductDetail; categories: CategoryOption[] };

const LIST = "/admin/products";

const initialValues = (product?: AdminProductDetail): ProductFormValues => ({
  name: product?.name ?? "",
  description: product?.description ?? "",
  price: product ? centsToYuan(product.price) : "",
  stock: product ? String(product.stock) : "",
  categoryId: product?.categoryId ?? "",
  isActive: product?.isActive ?? true,
});

/** 新增（不傳 product）或編輯商品 */
export function ProductForm({ product, categories }: Props) {
  const router = useRouter();
  const action = product ? updateProduct : createProduct;
  const [state, formAction, pending] = useActionState(async (prev: ProductFormState, formData: FormData) => {
    const result = await action(prev, formData);
    if (result.ok) {
      toast.success(product ? "商品已更新" : "商品已新增");
      router.push(LIST);
    }
    return result;
  }, { ok: true } as ProductFormState);
  const [, startTransition] = useTransition();

  // 自行送出而不是交給 <form action>：React 在 action 完成後會重設表單，
  // 失敗時已選的圖片和預覽會被清掉，使用者得重新選檔
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(() => formAction(formData));
  };

  const errors = state.ok ? undefined : state.fieldErrors;
  const values = initialValues(product);

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-5" noValidate>
      {product ? <input type="hidden" name="id" value={product.id} /> : null}
      <FormError message={state.ok ? undefined : state.error} />

      <FormField name="name" label="商品名稱" required maxLength={100} defaultValue={values.name} errors={errors?.name} />

      <Field id="description" label="描述" errors={errors?.description} hint="最多 2000 個字元">
        {(control) => (
          <Textarea name="description" rows={5} maxLength={2000} defaultValue={values.description} {...control} />
        )}
      </Field>

      <div className="grid gap-5 sm:grid-cols-3">
        <FormField
          name="price"
          label="價格（元）"
          required
          inputMode="decimal"
          placeholder="199"
          hint="最多兩位小數"
          defaultValue={values.price}
          errors={errors?.price}
        />
        <FormField
          name="stock"
          label="庫存"
          required
          type="number"
          inputMode="numeric"
          min={0}
          max={MAX_STOCK}
          defaultValue={values.stock}
          errors={errors?.stock}
        />
        <Field id="categoryId" label="分類" errors={errors?.categoryId}>
          {(control) => (
            <NativeSelect name="categoryId" required defaultValue={values.categoryId} {...control}>
              <option value="" disabled>
                請選擇
              </option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </NativeSelect>
          )}
        </Field>
      </div>

      <ImageField current={product?.image ?? null} errors={errors?.image} />

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isActive" defaultChecked={values.isActive} className="size-4 accent-primary" />
        上架（前台可看到並購買）
      </label>

      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "儲存中…" : "儲存"}
        </Button>
        <Link href={LIST} className={buttonVariants({ variant: "outline" })}>
          取消
        </Link>
      </div>
    </form>
  );
}
