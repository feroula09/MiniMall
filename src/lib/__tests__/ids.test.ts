import { describe, expect, it } from "vitest";
import { isId } from "../ids";

describe("isId", () => {
  it("accepts cuid-like ids", () => {
    expect(isId("cmvn0djlw0001wj90s0h8u5ac")).toBe(true);
  });

  it.each([undefined, null, 1, "", "../../etc", "a b", "a/b", "x".repeat(65)])("rejects %j", (v) => {
    expect(isId(v)).toBe(false);
  });
});
