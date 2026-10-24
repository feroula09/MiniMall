// 依檔頭 magic bytes 判斷圖片格式，不信任瀏覽器提供的 MIME 與副檔名

export type ImageExt = "jpg" | "png" | "webp";

export const IMAGE_CONTENT_TYPE: Record<ImageExt, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
export const ACCEPTED_IMAGE_MIME = Object.values(IMAGE_CONTENT_TYPE);

/**
 * 依瀏覽器回報的類型與大小做初步檢查（前端選檔與伺服器共用）。
 * 通過後伺服器仍要用 detectImageType 檢查實際內容。
 */
export function imageFileError(file: { type: string; size: number }): string | null {
  if (!ACCEPTED_IMAGE_MIME.includes(file.type)) return "圖片只接受 JPG、PNG 或 WebP";
  if (file.size === 0) return "圖片檔案是空的";
  if (file.size > MAX_IMAGE_BYTES) return "圖片不可超過 2MB";
  return null;
}

const startsWith =(bytes: Uint8Array, signature: number[], offset = 0) =>
  bytes.length >= offset + signature.length && signature.every((b, i) => bytes[offset + i] === b);

const ascii = (text: string) => [...text].map((c) => c.charCodeAt(0));

/** 回傳圖片格式；不是 JPEG、PNG、WebP 時回傳 null */
export function detectImageType(bytes: Uint8Array): ImageExt | null {
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return "jpg";
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "png";
  // RIFF <4 bytes 長度> WEBP
  if (startsWith(bytes, ascii("RIFF")) && startsWith(bytes, ascii("WEBP"), 8)) return "webp";
  return null;
}
