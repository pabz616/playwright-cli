import { test, expect } from "@playwright/test";
import {
  buildWelcomeText,
  getCategorySelector,
  isValidCategory,
  isValidSignUpInput,
  normalizeContactMessage,
} from "./demoblazeHelpers";
import testData from "../../utils/testData";

test.describe("Demoblaze helper utilities", () => {
  test("returns selectors for valid categories", () => {
    expect(getCategorySelector("Phones")).toContain(testData.CATEGORY1);
    expect(getCategorySelector("Laptops")).toContain(testData.CATEGORY2);
    expect(getCategorySelector("Monitors")).toContain(testData.CATEGORY3);
  });

  test("rejects unknown categories", () => {
    expect(() => getCategorySelector("Tablets" as any)).toThrow(
      "Unknown category",
    );
    expect(isValidCategory(testData.CATEGORY1)).toBe(true);
    expect(isValidCategory(testData.CATEGORY4)).toBe(false);
  });

  test("builds the expected welcome text", () => {
    expect(buildWelcomeText("tester")).toBe("Welcome tester");
  });

  test("validates sign-up inputs", () => {
    expect(isValidSignUpInput("demo", "Password123")).toBe(true);
    expect(isValidSignUpInput("", "Password123")).toBe(false);
    expect(isValidSignUpInput("demo", "short")).toBe(false);
  });

  test("normalizes contact messages by trimming whitespace", () => {
    expect(normalizeContactMessage("  hello from demoblaze  ")).toBe(
      "hello from demoblaze",
    );
  });
});
