/** 讀取表單文字欄位；欄位不存在或是檔案時回傳空字串 */
export function formText(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}
