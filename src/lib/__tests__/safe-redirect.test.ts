import { describe, expect, it } from "vitest";
import { loginHref, sanitizeNext } from "../safe-redirect";

describe("sanitizeNext", () => {
  it.each(["/", "/cart", "/products/abc?x=1", "/orders/1#top"])("accepts in-site path %s", (p) => {
    expect(sanitizeNext(p)).toBe(p);
  });

  it.each([
    undefined,
    null,
    123,
    "",
    "cart",
    "https://evil.com",
    "//evil.com",
    "/\\evil.com",
    "/\tevil",
    "/\nevil",
    "javascript:alert(1)",
    "/" + "a".repeat(600),
  ])("rejects %j", (p) => {
    expect(sanitizeNext(p)).toBe("/");
  });

  it("uses the given fallback", () => {
    expect(sanitizeNext("//evil.com", "/orders")).toBe("/orders");
  });
});

describe("loginHref", () => {
  it("omits next for the home page", () => {
    expect(loginHref("/")).toBe("/login");
  });

  it("encodes the next path", () => {
    expect(loginHref("/cart?a=1")).toBe("/login?next=%2Fcart%3Fa%3D1");
  });

  it("drops unsafe next paths", () => {
    expect(loginHref("//evil.com")).toBe("/login");
  });
});
