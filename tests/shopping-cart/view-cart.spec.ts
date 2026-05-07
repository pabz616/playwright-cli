import { test, expect } from "@playwright/test";

const CART_URL = "https://www.demoblaze.com/cart.html";

test.describe("Shopping cart", () => {
  test("view cart", async ({ page }) => {
    await page.goto(CART_URL);

    await expect(page.locator(".table-responsive")).toBeVisible();
    await expect(
      page.locator("table thead th", { hasText: "Pic" }),
    ).toBeVisible();
    await expect(
      page.locator("table thead th", { hasText: "Title" }),
    ).toBeVisible();
    await expect(
      page.locator("table thead th", { hasText: "Price" }),
    ).toBeVisible();
    await expect(
      page.locator("table thead th", { hasText: "x" }),
    ).toBeVisible();
    await expect(page.locator("#totalp")).toBeVisible();
    await expect(
      page.locator("button", { hasText: "Place Order" }),
    ).toBeVisible();
  });
});
