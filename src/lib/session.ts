import "server-only";
import { cookies } from "next/headers";
import { getEnv } from "./env";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  signSessionToken,
  verifySessionToken,
  type SessionPayload,
} from "./session-token";

export async function createSession(payload: SessionPayload) {
  const token = await signSessionToken(payload, getEnv().SESSION_SECRET);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

/** 只驗證 cookie 內的 token，不查資料庫；需要最新使用者資料請用 getCurrentUser */
export async function readSession(): Promise<SessionPayload | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return verifySessionToken(token, getEnv().SESSION_SECRET);
}

export async function deleteSession() {
  (await cookies()).delete(SESSION_COOKIE);
}
