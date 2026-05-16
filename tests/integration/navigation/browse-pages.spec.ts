import { test } from "@playwright/test";
const { testData } = require("../../../utils/testData");
import StaticPages from "../../pages/StaticPages";

let onStaticPages: StaticPages;

test.beforeEach(async ({ page }) => {
  await page.goto(testData.BASE_URL);
  onStaticPages = new StaticPages(page);
});

test.afterEach(async ({ page }) => {
  await page.close();
});

test.describe("Demoblaze Product Stores - Static Pages", () => {
  test("View About Us", async ({ page }) => {
    await onStaticPages.aboutUs();
  });

  test("View Contact Form", async ({ page }) => {
    await onStaticPages.contactForm();
  });
});
