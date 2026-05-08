import { test } from "@playwright/test";
import testData from "../../../utils/testData";
import HomePage_ProductBrowsing from "../../pages/ProductBrowsing";

let onHomePageProductBrowsing: HomePage_ProductBrowsing;

test.beforeEach(async ({ page }) => {
  await page.goto(testData.BASE_URL);
  onHomePageProductBrowsing = new HomePage_ProductBrowsing(page);
});

test.describe("Demoblaze Product Store - Product Filtering", () => {
  test("Filter by Phones", async ({ page }) => {
    await onHomePageProductBrowsing.filterByCategory("Phones");
  });
  test("Filter by Laptops", async ({ page }) => {
    await onHomePageProductBrowsing.filterByCategory("Laptops");
  });
    test("Filter by Monitors", async ({ page }) => {
    await onHomePageProductBrowsing.filterByCategory("Monitors");
  });

});
