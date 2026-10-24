import { jwtVerify, SignJWT } from "jose";
import { z } from "zod";

// JWT 簽發與驗證，不碰 cookies()，所以 proxy 與單元測試都能直接使用。
// 只存 userId：角色等可能變動的資料一律從資料庫讀，避免升降權後要等 token 過期才生效。

export const SESSION_COOKIE = "session";
export const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

const payloadSchema = z.object({ sub: z.string().min(1) });

export type SessionPayload = { userId: string };

const encodeKey = (secret: string) => new TextEncoder().encode(secret);

export async function signSessionToken(payload: SessionPayload, secret: string): Promise<string> {
  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.userId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(encodeKey(secret));
}

/** 簽章錯誤、過期或內容格式不對都回傳 null */
export async function verifySessionToken(
  token: string | undefined,
  secret: string,
): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, encodeKey(secret), { algorithms: ["HS256"] });
    const parsed = payloadSchema.safeParse(payload);
    return parsed.success ? { userId: parsed.data.sub } : null;
  } catch {
    return null;
  }
}
