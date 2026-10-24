import { describe, expect, it } from "vitest";
import { pageItems } from "../pagination";

describe("pageItems", () => {
  it("lists every page when there are few", () => {
    expect(pageItems(1, 1)).toEqual([1]);
    expect(pageItems(2, 3)).toEqual([1, 2, 3]);
  });

  it("collapses distant pages into gaps", () => {
    expect(pageItems(5, 10)).toEqual([1, "gap", 4, 5, 6, "gap", 10]);
  });

  it("does not add a gap next to the first or last page", () => {
    expect(pageItems(1, 10)).toEqual([1, 2, "gap", 10]);
    expect(pageItems(3, 10)).toEqual([1, 2, 3, 4, "gap", 10]);
    expect(pageItems(10, 10)).toEqual([1, "gap", 9, 10]);
  });
});
