"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { fail, failFromZod, type ActionResult } from "@/lib/action-result";
import { isUniqueViolation } from "@/lib/db-errors";
import { formText } from "@/lib/form-data";
import { prisma } from "@/lib/prisma";
import { sanitizeNext } from "@/lib/safe-redirect";
import { createSession, deleteSession } from "@/lib/session";
import { loginSchema, registerSchema } from "./schemas";

/** 表單送出失敗時回傳已填的值（不含密碼），讓表單重新顯示 */
export type AuthFormState = ActionResult & { values?: { name?: string; email?: string } };

// 帳號不存在時也做一次比對，讓回應時間與密碼錯誤相同，避免被用來探測已註冊的 Email
const DUMMY_HASH = "$2b$10$meZlowL9AJyn4kHM1NfTM.BPLHbP8rYfIMePxQIuYSQAyIi8Sd1PW";
const BCRYPT_COST = 10;

export async function register(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const values = { name: formText(formData, "name"), email: formText(formData, "email") };
  const parsed = registerSchema.safeParse({
    ...values,
    password: formText(formData, "password"),
    confirmPassword: formText(formData, "confirmPassword"),
  });
  if (!parsed.success) return { ...failFromZod(parsed.error), values };

  const { name, email, password } = parsed.data;
  const emailTaken = { ...fail("請修正標示的欄位", { email: ["此 Email 已被註冊"] }), values };

  if (await prisma.user.findUnique({ where: { email }, select: { id: true } })) return emailTaken;

  let user;
  try {
    user = await prisma.user.create({
      data: { name, email, passwordHash: await bcrypt.hash(password, BCRYPT_COST) },
      select: { id: true },
    });
  } catch (e) {
    // 兩個請求同時用同一個 Email 註冊時，由唯一索引擋下
    if (isUniqueViolation(e)) return emailTaken;
    throw e;
  }

  await createSession({ userId: user.id });
  redirect(sanitizeNext(formData.get("next")));
}

export async function login(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const values = { email: formText(formData, "email") };
  const parsed = loginSchema.safeParse({ ...values, password: formText(formData, "password") });
  if (!parsed.success) return { ...failFromZod(parsed.error), values };

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true, passwordHash: true },
  });
  const valid = await bcrypt.compare(parsed.data.password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !valid) return { ...fail("Email 或密碼錯誤"), values };

  await createSession({ userId: user.id });
  redirect(sanitizeNext(formData.get("next")));
}

export async function logout() {
  await deleteSession();
  redirect("/");
}
