import { test } from "@playwright/test";
const { testData } = require("../../../utils/testData");
import HomePage_ProductBrowsing from "../../pages/ProductBrowsing";

let onHomePageProductBrowsing: HomePage_ProductBrowsing;

test.beforeEach(async ({ page }) => {
  await page.goto(testData.BASE_URL);
  onHomePageProductBrowsing = new HomePage_ProductBrowsing(page);
});

test.describe("Demoblaze Product Store - Product browsing", () => {
  test("Browse Home Page", async ({ page }) => {
    await onHomePageProductBrowsing.verifyHomePage();
  });
});
