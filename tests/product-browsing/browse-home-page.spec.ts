import { test, expect } from "@playwright/test";

const BASE_URL = "https://www.demoblaze.com/";

test.describe("Product browsing", () => {
  test("browse home page", async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page).toHaveTitle(/STORE/);

    await expect(page.locator("a.nav-link", { hasText: "Home" })).toBeVisible();
    await expect(
      page.locator("a.nav-link", { hasText: "Contact" }),
    ).toBeVisible();
    await expect(
      page.locator("a.nav-link", { hasText: "About us" }),
    ).toBeVisible();
    await expect(page.locator("a.nav-link", { hasText: "Cart" })).toBeVisible();
    await expect(
      page.locator("a.nav-link", { hasText: "Log in" }),
    ).toBeVisible();
    await expect(
      page.locator("a.nav-link", { hasText: "Sign up" }),
    ).toBeVisible();

    const carouselItems = page.locator(".carousel-inner .carousel-item");
    expect(await carouselItems.count()).toBeGreaterThan(0);
    await expect(carouselItems.first()).toBeVisible();

    await expect(page.locator("a#itemc", { hasText: "Phones" })).toBeVisible();
    await expect(page.locator("a#itemc", { hasText: "Laptops" })).toBeVisible();
    await expect(
      page.locator("a#itemc", { hasText: "Monitors" }),
    ).toBeVisible();

    const productCards = page.locator("#tbodyid .card");
    expect(await productCards.count()).toBeGreaterThan(0);
    await expect(productCards.first().locator("img")).toBeVisible();
    await expect(productCards.first().locator(".card-title a")).toBeVisible();
    await expect(productCards.first().locator(".card-text")).toBeVisible();
  });
});
