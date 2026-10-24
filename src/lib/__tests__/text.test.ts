import { describe, expect, it } from "vitest";
import { truncate } from "../text";

describe("truncate", () => {
  it("keeps short text unchanged", () => {
    expect(truncate("耳機", 5)).toBe("耳機");
    expect(truncate("12345", 5)).toBe("12345");
  });

  it("adds an ellipsis when cut", () => {
    expect(truncate("123456", 5)).toBe("12345…");
  });

  it("does not split surrogate pairs", () => {
    expect(truncate("ab😀cd", 3)).toBe("ab😀…");
  });
});
