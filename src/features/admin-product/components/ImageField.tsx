"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { Field } from "@/components/form/Field";
import { ProductImage } from "@/components/ProductImage";
import { Input } from "@/components/ui/input";
import { ACCEPTED_IMAGE_MIME, imageFileError } from "@/lib/image-type";

type Props = {
  /** 編輯時的目前圖片 */
  current: string | null;
  errors?: string[];
};

/** 選擇圖片後立即預覽；按儲存時才隨表單上傳。編輯時可勾選移除目前圖片 */
export function ImageField({ current, errors }: Props) {
  const [preview, setPreview] = useState<string | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);
  const [remove, setRemove] = useState(false);

  // 換圖或離開頁面時釋放預覽用的 object URL
  useEffect(() => {
    if (!preview) return;
    return () => URL.revokeObjectURL(preview);
  }, [preview]);

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setPreview(null);
    setClientError(null);
    if (!file) return;
    // 和伺服器同一套規則先檢查一次；超過上限的檔案不送出，避免撞到 Server Action 的請求大小限制
    const error = imageFileError(file);
    if (error) {
      setClientError(error);
      e.target.value = "";
      return;
    }
    setPreview(URL.createObjectURL(file));
  };

  const shown = preview ?? (remove ? null : current);
  // 送出後以伺服器的結果為準；伺服器沒有回報圖片錯誤時，才保留選檔時的錯誤提示
  const fieldErrors = errors ?? (clientError ? [clientError] : undefined);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
      <ProductImage src={shown} alt="商品圖片預覽" sizes="160px" className="w-40 shrink-0" />
      <div className="flex-1 space-y-3">
        <Field id="image" label="商品圖片" errors={fieldErrors} hint="JPG、PNG 或 WebP，最大 2MB。選擇後按「儲存」才會上傳。">
          {(control) => (
            <Input type="file" name="image" accept={ACCEPTED_IMAGE_MIME.join(",")} onChange={onChange} {...control} />
          )}
        </Field>
        {current && !preview ? (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="removeImage"
              checked={remove}
              onChange={(e) => setRemove(e.target.checked)}
              className="size-4 accent-primary"
            />
            移除目前圖片
          </label>
        ) : null}
      </div>
    </div>
  );
}
