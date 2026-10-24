import type { NextRequest } from "next/server";
import { readUploadedImage } from "@/lib/upload";

/** 讀取 storage/uploads 的商品圖（唯一的 Route Handler） */
export async function GET(_req: NextRequest, ctx: RouteContext<"/uploads/[name]">) {
  const { name } = await ctx.params;
  const image = await readUploadedImage(name);
  if (!image) return new Response("Not Found", { status: 404 });

  return new Response(image.bytes, {
    headers: {
      "Content-Type": image.contentType,
      "Content-Length": String(image.bytes.length),
      // 檔名是 UUID，內容不會變，可以長期快取
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
