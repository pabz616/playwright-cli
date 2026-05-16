import { test } from "@playwright/test";
const { testData } = require("../../../utils/testData");
import HomePage_ProductBrowsing from "../../pages/ProductBrowsing";

let onHomePageProductBrowsing: HomePage_ProductBrowsing;

test.beforeEach(async ({ page }) => {
  await page.goto(testData.BASE_URL);
  onHomePageProductBrowsing = new HomePage_ProductBrowsing(page);
});

test.describe("Demoblaze Product Store - Product Filtering", () => {
  test("Filter by Phones", async ({ page }) => {
    await onHomePageProductBrowsing.filterByCategory(testData.CATEGORY1);
  });
  test("Filter by Laptops", async ({ page }) => {
    await onHomePageProductBrowsing.filterByCategory(testData.CATEGORY2);
  });
  test("Filter by Monitors", async ({ page }) => {
    await onHomePageProductBrowsing.filterByCategory(testData.CATEGORY3);
  });
});
