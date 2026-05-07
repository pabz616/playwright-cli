import { test, expect } from "@playwright/test";

const BASE_URL = "https://www.demoblaze.com/";

test.describe("Product browsing", () => {
  test("view product details", async ({ page }) => {
    await page.goto(BASE_URL);
    const firstProduct = page.locator("#tbodyid .card .card-title a").first();
    const productTitle = await firstProduct.textContent();
    await firstProduct.click();

    await expect(page).toHaveURL(/prod\.html\?idp=\d+/);
    await expect(page.locator(".name")).toBeVisible();
    await expect(page.locator(".name")).toContainText(
      productTitle?.trim() || "",
    );
    await expect(page.locator(".price-container")).toBeVisible();
    await expect(page.locator("#more-information")).toBeVisible();
    await expect(
      page.locator("a.btn-success", { hasText: "Add to cart" }),
    ).toBeVisible();
  });
});
