import { SignJWT } from "jose";
import { describe, expect, it } from "vitest";
import { signSessionToken, verifySessionToken } from "../session-token";

const SECRET = "test-secret-test-secret-test-secret-123";
const key = new TextEncoder().encode(SECRET);

describe("session token", () => {
  it("round-trips the payload", async () => {
    const token = await signSessionToken({ userId: "u1" }, SECRET);
    expect(await verifySessionToken(token, SECRET)).toEqual({ userId: "u1" });
  });

  it("returns null without a token", async () => {
    expect(await verifySessionToken(undefined, SECRET)).toBeNull();
    expect(await verifySessionToken("", SECRET)).toBeNull();
  });

  it("rejects a token signed with another secret", async () => {
    const token = await signSessionToken({ userId: "u1" }, "another-secret-another-secret-xx");
    expect(await verifySessionToken(token, SECRET)).toBeNull();
  });

  it("rejects a tampered token", async () => {
    const token = await signSessionToken({ userId: "u1" }, SECRET);
    const [header, , signature] = token.split(".");
    const forged = Buffer.from(JSON.stringify({ sub: "admin-id" })).toString("base64url");
    expect(await verifySessionToken(`${header}.${forged}.${signature}`, SECRET)).toBeNull();
  });

  it("rejects an expired token", async () => {
    const token = await new SignJWT({})
      .setProtectedHeader({ alg: "HS256" })
      .setSubject("u1")
      .setExpirationTime(Math.floor(Date.now() / 1000) - 10)
      .sign(key);
    expect(await verifySessionToken(token, SECRET)).toBeNull();
  });

  it("rejects a token without a subject", async () => {
    const token = await new SignJWT({}).setProtectedHeader({ alg: "HS256" }).setExpirationTime("1h").sign(key);
    expect(await verifySessionToken(token, SECRET)).toBeNull();
  });

  it("rejects the none algorithm", async () => {
    const header = Buffer.from(JSON.stringify({ alg: "none" })).toString("base64url");
    const body = Buffer.from(JSON.stringify({ sub: "u1" })).toString("base64url");
    expect(await verifySessionToken(`${header}.${body}.`, SECRET)).toBeNull();
  });
});
