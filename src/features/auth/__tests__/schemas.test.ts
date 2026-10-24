import { describe, expect, it } from "vitest";
import { z } from "zod";
import { loginSchema, registerSchema } from "../schemas";

const valid = {
  name: " 小明 ",
  email: " Ming@Example.COM ",
  password: "password123",
  confirmPassword: "password123",
};

const errorsOf = (input: unknown) => {
  const result = registerSchema.safeParse(input);
  return result.success ? {} : z.flattenError(result.error).fieldErrors;
};

describe("registerSchema", () => {
  it("normalizes name and email", () => {
    const data = registerSchema.parse(valid);
    expect(data.name).toBe("小明");
    expect(data.email).toBe("ming@example.com");
  });

  it("requires matching passwords", () => {
    expect(errorsOf({ ...valid, confirmPassword: "different1" })).toHaveProperty("confirmPassword");
  });

  it("requires at least 8 characters", () => {
    expect(errorsOf({ ...valid, password: "short", confirmPassword: "short" })).toHaveProperty("password");
  });

  it("rejects passwords longer than 72 bytes", () => {
    const long = "密".repeat(25); // 75 bytes
    expect(errorsOf({ ...valid, password: long, confirmPassword: long })).toHaveProperty("password");
  });

  it.each(["", "not-an-email", "a@b"])("rejects email %j", (email) => {
    expect(errorsOf({ ...valid, email })).toHaveProperty("email");
  });

  it("rejects an empty or too long name", () => {
    expect(errorsOf({ ...valid, name: "   " })).toHaveProperty("name");
    expect(errorsOf({ ...valid, name: "a".repeat(31) })).toHaveProperty("name");
  });
});

describe("loginSchema", () => {
  it("normalizes email", () => {
    expect(loginSchema.parse({ email: " A@B.CO ", password: "x" }).email).toBe("a@b.co");
  });

  it("requires a password", () => {
    expect(loginSchema.safeParse({ email: "a@b.co", password: "" }).success).toBe(false);
  });

  it("uses the generic message for an overlong password", () => {
    const result = loginSchema.safeParse({ email: "a@b.co", password: "x".repeat(201) });
    expect(result.success ? [] : z.flattenError(result.error).fieldErrors.password).toEqual(["Email 或密碼錯誤"]);
  });
});
