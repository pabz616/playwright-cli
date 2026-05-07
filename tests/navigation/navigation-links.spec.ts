import { test, expect } from "@playwright/test";

const BASE_URL = "https://www.demoblaze.com/";

test.describe("Navigation", () => {
  test("navigation links", async ({ page }) => {
    await page.goto(BASE_URL);

    await page.locator("a.nav-link", { hasText: "Cart" }).click();
    await expect(page).toHaveURL(/cart\.html$/);

    await page.goto(BASE_URL);
    await page.locator("a.nav-link", { hasText: "Home" }).click();
    await expect(page).toHaveURL(/index\.html$|demoblaze\.com\/$/);

    await page.locator("#nava").click();
    await expect(page).toHaveURL(/index\.html$|demoblaze\.com\/$/);
  });
});
