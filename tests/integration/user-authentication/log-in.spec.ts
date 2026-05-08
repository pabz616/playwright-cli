import { test } from "@playwright/test";
import testData from "../../../utils/testData";
import UserAuthentication from "../../pages/UserAuthentication";

let onUserAuthenticationPage: UserAuthentication;

test.beforeEach(async ({ page }) => {
  await page.goto(testData.BASE_URL);
  onUserAuthenticationPage = new UserAuthentication(page);
});

test.describe("Demoblaze Product Store - User authentication", () => {
  test("log in validation", async ({ page }) => {
    await onUserAuthenticationPage.logInValidation();
  });

  test("Valid Login", async ({ page }) => {
    await onUserAuthenticationPage.logIn();
  });
});
