import { test, expect } from "@playwright/test";

const BASE_URL = "https://www.demoblaze.com/";

test.describe("Static pages", () => {
  test("about us", async ({ page }) => {
    await page.goto(BASE_URL);
    await page.locator("a.nav-link", { hasText: "About us" }).click();

    await expect(page.locator("#videoModal")).toBeVisible();
    await expect(page.locator("#videoModal .modal-body")).toBeVisible();
    await expect(page.locator("#videoModal .modal-body")).toContainText(
      /about/i,
    );
  });
});
