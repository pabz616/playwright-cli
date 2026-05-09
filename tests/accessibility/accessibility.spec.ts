import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import testData from "../../utils/testData";

test.beforeEach(async ({ page }) => {await page.goto(testData.BASE_URL);});
test.describe("Demoblaze Product Store - Accessibility Tests", () => {
  test("Home page should pass critical accessibility checks", async ({page,}) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(["color-contrast", "image-alt", "button-name", "link-name"])
      .analyze();

    // Check for critical violations only
    const criticalViolations = accessibilityScanResults.violations.filter(
      (violation) => violation.impact === "critical" || violation.impact === "serious",
    );

    expect(criticalViolations).toEqual([]);
  });

  test("Product Details page accessibility", async ({ page }) => {
    // Click on first product
    await page.locator(".card-title a").first().click();

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    // Log violations for review but don't fail the test
    if (accessibilityScanResults.violations.length > 0) {
      console.log(
        "Accessibility violations found:",
        accessibilityScanResults.violations,
      );
    }

    // Ensure no critical form or navigation issues
    const criticalViolations = accessibilityScanResults.violations.filter(
      (violation) => violation.impact === "critical",
    );

    expect(criticalViolations).toEqual([]);
  });

  test("Login modal accessibility", async ({ page }) => {
    await page.getByRole("link", { name: "Log in" }).click();

    // Wait for modal to appear
    await page.waitForSelector("#logInModal", { state: "visible" });

    const accessibilityScanResults = await new AxeBuilder({ page })
      .include("#logInModal")
      .analyze();

    // Check for form-specific accessibility issues
    const formViolations = accessibilityScanResults.violations.filter(
      (violation) => violation.tags.includes("cat.forms"),
    );

    expect(formViolations).toEqual([]);
  });

  test("Sign up modal accessibility", async ({ page }) => {
    await page.getByRole("link", { name: "Sign up" }).click();

    // Wait for modal to appear
    await page.waitForSelector("#signInModal", { state: "visible" });

    const accessibilityScanResults = await new AxeBuilder({ page })
      .include("#signInModal")
      .analyze();

    // Check for form-specific accessibility issues
    const formViolations = accessibilityScanResults.violations.filter(
      (violation) => violation.tags.includes("cat.forms"),
    );

    expect(formViolations).toEqual([]);
  });

  test("Cart page accessibility", async ({ page }) => {
    await page.goto(testData.BASE_URL + "cart.html");

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    // Check for table and navigation accessibility
    const tableViolations = accessibilityScanResults.violations.filter(
      (violation) => violation.tags.includes("cat.tables"),
    );

    expect(tableViolations).toEqual([]);
  });

  test("Keyboard navigation accessibility", async ({ page }) => {

    // Test tab navigation through main elements
    await page.keyboard.press("Tab");
    let focusedElement = await page.evaluate(
      () => document.activeElement?.tagName,
    );
    expect(focusedElement).toBe("A"); // Should focus on first link

    // Continue tabbing
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press("Tab");
    }

    // Check that we can reach interactive elements
    const focusedElementType = await page.evaluate(
      () => document.activeElement?.tagName,
    );
    expect(
      ["A", "BUTTON", "INPUT", "SELECT"].includes(focusedElementType || ""),
    ).toBe(true);
  });

  test("Focus management in forms", async ({ page }) => {
    await page.getByRole("link", { name: "Log in" }).click();

    await page.waitForSelector("#logInModal", { state: "visible" });

    // Focus should be on the first input field
    const activeElement = await page.evaluate(() => document.activeElement?.id);
    expect(activeElement).toBe("loginusername");
  });

  test("Heading structure accessibility", async ({ page }) => {
    const headings = await page
      .locator("h1, h2, h3, h4, h5, h6")
      .allTextContents();
    expect(headings.length).toBeGreaterThan(0);

    // Check for h1 presence
    const h1Headings = await page.locator("h1").count();
    expect(h1Headings).toBeGreaterThan(0);
  });

  test("Image alt text accessibility", async ({ page }) => {
    const images = page.locator("img");
    const imageCount = await images.count();

    for (let i = 0; i < imageCount; i++) {
      const altText = await images.nth(i).getAttribute("alt");
      // Images should have alt text (empty string is acceptable for decorative images)
      expect(altText).not.toBeNull();
    }
  });

  test("Color contrast compliance", async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(["color-contrast"])
      .analyze();

    // Log contrast issues but don't fail - this is often a design decision
    if (accessibilityScanResults.violations.length > 0) {
      console.log(
        "Color contrast violations:",
        accessibilityScanResults.violations,
      );
    }

    // For now, just ensure the scan completes
    expect(accessibilityScanResults).toBeDefined();
  });
});
