import { test } from "@playwright/test";
import testData from "../../utils/testData";
import Carousel from "../pages/HomePage_Carousel";

let onHomePageCarousel: Carousel;

test.beforeEach(async ({ page }) => {
  await page.goto(testData.BASE_URL);
  onHomePageCarousel = new Carousel(page);
});

test.beforeEach(async ({ page }) => {
  await page.goto(testData.BASE_URL);
});
test.describe("Demoblaze Product Store Carousel", () => {
  test("Carousel Navigation", async ({ page }) => {
    await onHomePageCarousel.verifyCarouselUI();
  });

});
