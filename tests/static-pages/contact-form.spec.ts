import { test } from "@playwright/test";
import testData from "../../utils/testData";
import HomePage_StaticPages from "../pages/HomePage_StaticPages";

let onHomePageStaticPages: HomePage_StaticPages;

test.beforeEach(async ({ page }) => {
  await page.goto(testData.BASE_URL);
  onHomePageStaticPages = new HomePage_StaticPages(page);
});

test.describe("Static pages", () => {
  test("contact form", async ({ page }) => {
    await onHomePageStaticPages.contactForm();
  });
});
