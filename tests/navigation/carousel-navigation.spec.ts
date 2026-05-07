import { test, expect } from "@playwright/test";

const BASE_URL = "https://www.demoblaze.com/";

test.describe("Navigation", () => {
  test("carousel navigation", async ({ page }) => {
    await page.goto(BASE_URL);

    const activeSlide = page.locator(".carousel-inner .carousel-item.active");
    await expect(activeSlide).toBeVisible();

    await page.locator("a.carousel-control-next").click();
    await expect(
      page.locator(".carousel-inner .carousel-item.active"),
    ).toBeVisible();

    await page.locator("a.carousel-control-prev").click();
    await expect(
      page.locator(".carousel-inner .carousel-item.active"),
    ).toBeVisible();

    const indicators = page.locator(
      ".carousel-indicators button, .carousel-indicators li",
    );
    if ((await indicators.count()) > 1) {
      await indicators.nth(1).click();
      await expect(
        page.locator(".carousel-inner .carousel-item.active"),
      ).toBeVisible();
    }
  });
});
