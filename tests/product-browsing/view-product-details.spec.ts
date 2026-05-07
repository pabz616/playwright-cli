import { test } from "@playwright/test";
import testData from "../../utils/testData";
import HomePage_ProductBrowsing from "../pages/HomePage_ProductBrowsing";

let onHomePageProductBrowsing: HomePage_ProductBrowsing;

test.beforeEach(async ({ page }) => {
  await page.goto(testData.BASE_URL);
  onHomePageProductBrowsing = new HomePage_ProductBrowsing(page);
});

test.describe("Product browsing", () => {
  test("view product details", async ({ page }) => {
    await onHomePageProductBrowsing.viewProductDetails();
  });
});
