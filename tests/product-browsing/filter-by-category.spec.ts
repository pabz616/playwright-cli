import { test } from "@playwright/test";
import testData from "../../utils/testData";
import HomePage_ProductBrowsing from "../pages/HomePage_ProductBrowsing";

let onHomePageProductBrowsing: HomePage_ProductBrowsing;

test.beforeEach(async ({ page }) => {
  await page.goto(testData.BASE_URL);
  onHomePageProductBrowsing = new HomePage_ProductBrowsing(page);
});

test.describe("Product browsing", () => {
  test("filter by category", async ({ page }) => {
    await onHomePageProductBrowsing.filterByCategory("Phones");
    await onHomePageProductBrowsing.filterByCategory("Laptops");
    await onHomePageProductBrowsing.filterByCategory("Monitors");
  });
});
