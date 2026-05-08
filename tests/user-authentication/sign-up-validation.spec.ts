import { test } from "@playwright/test";
import testData from "../../utils/testData";
import HomePage_UserAuthentication from "../pages/HomePage_UserAuthentication";

let onHomePageUserAuthentication: HomePage_UserAuthentication;

test.beforeEach(async ({ page }) => {
  await page.goto(testData.BASE_URL);
  await page.waitForSelector("#signin2");
  onHomePageUserAuthentication = new HomePage_UserAuthentication(page);
});

test.describe("User authentication", () => {
  test("sign up validation", async ({ page }) => {
    await onHomePageUserAuthentication.signUpValidation();
  });
});
