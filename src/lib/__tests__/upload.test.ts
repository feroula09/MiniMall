import { describe, expect, it } from "vitest";
import { isUploadName, pickedFile, uploadedImageName } from "../upload";

const NAME = "0f8fad5b-d9cb-469f-a165-70867728950e.png";

describe("uploadedImageName", () => {
  it("extracts the file name of an uploaded image", () => {
    expect(uploadedImageName(`/uploads/${NAME}`)).toBe(NAME);
  });

  it.each([
    null,
    undefined,
    "",
    "/seed/apple.svg",
    `/uploads/../${NAME}`,
    "/uploads/../../.env",
    `/uploads/sub/${NAME}`,
    "/uploads/0f8fad5b-d9cb-469f-a165-70867728950e.svg",
    `https://evil.example/uploads/${NAME}`,
  ])("ignores %j", (input) => {
    expect(uploadedImageName(input)).toBeNull();
  });
});

describe("isUploadName", () => {
  it.each([NAME, NAME.replace(".png", ".jpg"), NAME.replace(".png", ".webp")])("accepts %s", (name) => {
    expect(isUploadName(name)).toBe(true);
  });

  it.each([
    "../" + NAME,
    NAME.toUpperCase(),
    NAME + ".png",
    "------------------------------------.png",
    "0f8fad5b-d9cb-469f-a165-70867728950e.PNG",
  ])("rejects %s", (name) => {
    expect(isUploadName(name)).toBe(false);
  });
});

describe("pickedFile", () => {
  it("treats the empty file a browser sends without a selection as no file", () => {
    expect(pickedFile(new File([], ""))).toBeNull();
  });

  it("keeps a named file even when it is empty (so it can be rejected with a message)", () => {
    expect(pickedFile(new File([], "a.png"))).toBeInstanceOf(File);
  });

  it("ignores non-file values", () => {
    expect(pickedFile("text")).toBeNull();
    expect(pickedFile(null)).toBeNull();
  });
});
