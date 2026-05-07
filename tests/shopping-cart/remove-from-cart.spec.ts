import { test, expect } from "@playwright/test";

const BASE_URL = "https://www.demoblaze.com/";
const CART_URL = "https://www.demoblaze.com/cart.html";

test.describe("Shopping cart", () => {
  test("remove product from cart", async ({ page }) => {
    await page.goto(BASE_URL);
    await page.locator("#tbodyid .card .card-title a").first().click();

    const [addDialog] = await Promise.all([
      page.waitForEvent("dialog"),
      page.locator("a.btn-success", { hasText: "Add to cart" }).click(),
    ]);
    await addDialog.accept();

    await page.goto(CART_URL);
    const rowsBefore = await page.locator("#tbodyid tr").count();
    await page.locator("#tbodyid tr a", { hasText: "Delete" }).first().click();
    await expect(page.locator("#tbodyid tr")).toHaveCountLessThan(rowsBefore);
  });
});
