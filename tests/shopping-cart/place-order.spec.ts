import { test, expect } from "@playwright/test";

const BASE_URL = "https://www.demoblaze.com/";
const CART_URL = "https://www.demoblaze.com/cart.html";

test.describe("Shopping cart", () => {
  test("place order", async ({ page }) => {
    await page.goto(BASE_URL);
    await page.locator("#tbodyid .card .card-title a").first().click();

    const [addDialog] = await Promise.all([
      page.waitForEvent("dialog"),
      page.locator("a.btn-success", { hasText: "Add to cart" }).click(),
    ]);
    await addDialog.accept();

    await page.goto(CART_URL);
    await page.locator("button", { hasText: "Place Order" }).click();

    await expect(page.locator("#orderModal")).toBeVisible();
    await expect(page.locator("#name")).toBeVisible();
    await expect(page.locator("#country")).toBeVisible();
    await expect(page.locator("#city")).toBeVisible();
    await expect(page.locator("#card")).toBeVisible();
    await expect(page.locator("#month")).toBeVisible();
    await expect(page.locator("#year")).toBeVisible();

    await page.fill("#name", "Demo Tester");
    await page.fill("#country", "USA");
    await page.fill("#city", "New York");
    await page.fill("#card", "4111111111111111");
    await page.fill("#month", "12");
    await page.fill("#year", "2026");

    await page.locator("button", { hasText: "Purchase" }).click();
    await expect(page.locator(".sweet-alert h2")).toHaveText(
      /Thank you for your purchase!/i,
    );
  });
});
