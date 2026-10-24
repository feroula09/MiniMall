import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { detectImageType, IMAGE_CONTENT_TYPE, imageFileError, type ImageExt } from "./image-type";

// 上傳檔不能放 public/：next start 只服務建置當下已存在的 public 檔案
const UPLOAD_DIR = path.join(process.cwd(), "storage", "uploads");
const PUBLIC_PREFIX = "/uploads/";
// 檔名一律由伺服器產生（UUID + 副檔名），符合這個格式才會讀寫，杜絕路徑穿越
const NAME_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp)$/;

export const isUploadName = (name: string) => NAME_PATTERN.test(name);

/** "/uploads/<uuid>.png" → "<uuid>.png"；不是上傳檔（例如 /seed/*.svg）時回傳 null */
export function uploadedImageName(publicPath: string | null | undefined): string | null {
  if (!publicPath?.startsWith(PUBLIC_PREFIX)) return null;
  const name = publicPath.slice(PUBLIC_PREFIX.length);
  return isUploadName(name) ? name : null;
}

/** 表單沒有選檔時，瀏覽器仍會送出一個檔名為空、大小為 0 的 File */
export function pickedFile(value: FormDataEntryValue | null): File | null {
  if (!(value instanceof File)) return null;
  return value.size === 0 && value.name === "" ? null : value;
}

export type SaveImageResult = { ok: true; path: string } | { ok: false; error: string };

/** 檢查並儲存商品圖，成功時回傳要存進資料庫的路徑 */
export async function saveProductImage(file: File): Promise<SaveImageResult> {
  const error = imageFileError(file);
  if (error) return { ok: false, error };

  const bytes = new Uint8Array(await file.arrayBuffer());
  const ext = detectImageType(bytes);
  if (!ext) return { ok: false, error: "檔案內容不是有效的 JPG、PNG 或 WebP 圖片" };

  const name = `${randomUUID()}.${ext}`;
  try {
    await mkdir(UPLOAD_DIR, { recursive: true });
    await writeFile(path.join(UPLOAD_DIR, name), bytes, { flag: "wx" });
  } catch (e) {
    console.error("儲存上傳圖片失敗", e);
    return { ok: false, error: "圖片儲存失敗，請稍後再試" };
  }
  return { ok: true, path: PUBLIC_PREFIX + name };
}

/** 刪除上傳的圖片；seed 圖片與不存在的檔案略過。清理失敗不影響主要流程 */
export async function deleteUploadedImage(publicPath: string | null | undefined): Promise<void> {
  const name = uploadedImageName(publicPath);
  if (!name) return;
  try {
    await unlink(path.join(UPLOAD_DIR, name));
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== "ENOENT") console.error("刪除上傳圖片失敗", name, e);
  }
}

/** 給 /uploads/[name] 讀檔；檔名不合法或檔案不存在時回傳 null */
export async function readUploadedImage(name: string): Promise<{ bytes: Uint8Array<ArrayBuffer>; contentType: string } | null> {
  if (!isUploadName(name)) return null;
  try {
    // readFile 回傳的 Buffer 底層是一般 ArrayBuffer，可直接當 Response body，不必再複製
    const bytes = (await readFile(path.join(UPLOAD_DIR, name))) as Uint8Array<ArrayBuffer>;
    const ext = name.slice(name.lastIndexOf(".") + 1) as ImageExt;
    return { bytes, contentType: IMAGE_CONTENT_TYPE[ext] };
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw e;
  }
}
