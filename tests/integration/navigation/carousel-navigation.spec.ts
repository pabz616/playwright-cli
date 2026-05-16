import { test } from "@playwright/test";
const { testData } = require("../../../utils/testData");
import Carousel from "../../pages/Carousel";

let onHomePageCarousel: Carousel;

test.beforeEach(async ({ page }) => {
  await page.goto(testData.BASE_URL);
  onHomePageCarousel = new Carousel(page);
});

test.afterEach(async ({ page }) => {
  await page.close();
});

test.beforeEach(async ({ page }) => {
  await page.goto(testData.BASE_URL);
});
test.describe("Demoblaze Product Store Carousel", () => {
  test("Carousel Navigation", async ({ page }) => {
    await onHomePageCarousel.verifyCarouselUI();
  });
});
