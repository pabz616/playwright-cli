import { test, expect } from "@playwright/test";

const BASE_URL = "https://www.demoblaze.com/";

async function verifyCategory(page, categoryName: string) {
  await page.locator("a#itemc", { hasText: categoryName }).click();
  const cards = page.locator("#tbodyid .card");
  expect(await cards.count()).toBeGreaterThan(0);
  await expect(page.locator("#tbodyid .card img")).toBeVisible();
  await expect(page.locator("#tbodyid .card .card-title a")).toBeVisible();
  await expect(page.locator("#tbodyid .card .card-text")).toBeVisible();

  const priceLocator = page.locator("#tbodyid .card .card-text");
  await expect(priceLocator.first()).toContainText("$");
}

test.describe("Product browsing", () => {
  test("filter by category", async ({ page }) => {
    await page.goto(BASE_URL);

    await verifyCategory(page, "Phones");
    await verifyCategory(page, "Laptops");
    await verifyCategory(page, "Monitors");
  });
});
