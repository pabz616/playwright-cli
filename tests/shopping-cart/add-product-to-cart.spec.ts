import { test, expect } from "@playwright/test";

const BASE_URL = "https://www.demoblaze.com/";

test.describe("Shopping cart", () => {
  test("add product to cart", async ({ page }) => {
    await page.goto(BASE_URL);
    await page.locator("#tbodyid .card .card-title a").first().click();

    const [dialog] = await Promise.all([
      page.waitForEvent("dialog"),
      page.locator("a.btn-success", { hasText: "Add to cart" }).click(),
    ]);

    expect(dialog.message()).toContain("Product added");
    await dialog.accept();
  });
});
