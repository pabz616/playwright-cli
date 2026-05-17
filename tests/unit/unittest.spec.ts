import { test, expect } from "@playwright/test";
import testData from "../../utils/testData";

import {
  buildWelcomeText,
  getCategorySelector,
  isValidCategory,
  isValidSignUpInput,
  normalizeContactMessage,
} from "./unittest-helpers";

test.describe("Demoblaze Product Store Test Data Config", () => {
  test("Assert the expected base URL and credentials", () => {
    expect(testData.BASE_URL).toBe("https://www.demoblaze.com/");
  });
  test("Verify the credentials", () => {
    expect(testData.USN).toBe("test");
    expect(testData.PWD).toBe("test");
  });
  test("Confirm the creation of a demo user name in the expected format", () => {
    expect(testData.NAME).toMatch(/^Demo Tester: [A-Za-z0-9]{3}$/);
  });
  test("Confirms valid categories", () => {
    expect(getCategorySelector("Phones")).toContain(testData.PRODUCT_CATEGORY1);
    expect(getCategorySelector("Laptops")).toContain(
      testData.PRODUCT_CATEGORY2,
    );
    expect(getCategorySelector("Monitors")).toContain(
      testData.PRODUCT_CATEGORY3,
    );
  });
  test("Rejects unknown categories", () => {
    expect(() => getCategorySelector("Tablets" as any)).toThrow(
      "Unknown category",
    );
    expect(isValidCategory(testData.PRODUCT_CATEGORY1)).toBe(true);
    expect(isValidCategory(testData.PRODUCT_CATEGORY4)).toBe(false);
  });
  test("Confirm the expected welcome text after login", () => {
    expect(buildWelcomeText("tester")).toBe("Welcome tester");
  });
  test("Confirm home page navigation and main site links", () => {
    expect(testData.NAV_LINKS[0]).toBe("Home");
    expect(testData.NAV_LINKS[1]).toContain("Contact");
    expect(testData.NAV_LINKS[2]).toContain("About us");
    expect(testData.NAV_LINKS[3]).toContain("Cart");
    expect(testData.NAV_LINKS[4]).toContain("Log in");
    expect(testData.NAV_LINKS[5]).toBe("Sign up");
  });
  test("Confirm category selectors for the product filters", () => {
    expect(testData.PRODUCT_CATEGORY1).toBe("Phones");
    expect(testData.PRODUCT_CATEGORY2).toBe("Laptops");
    expect(testData.PRODUCT_CATEGORY3).toBe("Monitors");
  });
  test("Confirm sign-up input validation", () => {
    expect(isValidSignUpInput("demo", "Password123")).toBe(true);
    expect(isValidSignUpInput("", "Password123")).toBe(false);
    expect(isValidSignUpInput("demo", "short")).toBe(false);
  });
  test("Confirm purchase metadata", () => {
    expect(testData.ORDER_MSG).toBe("Thank you for your purchase!");
    expect(testData.YEAR).toBe("2026");
    expect(testData.MONTH.length).toBeGreaterThan(0);
    expect(testData.CARD).toMatch(/^[0-9-]+$/);
  });
  test("normalizes contact messages by trimming whitespace", () => {
    expect(normalizeContactMessage("  hello from demoblaze  ")).toBe(
      "hello from demoblaze",
    );
  });
});
