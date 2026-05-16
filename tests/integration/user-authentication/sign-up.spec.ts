import { test } from "@playwright/test";
const { testData } = require("../../../utils/testData");
import SignUp from "../../pages/SignUp";

let onSignUpForm: SignUp;

test.beforeEach(async ({ page }) => {
  await page.goto(testData.BASE_URL);
  await page.waitForSelector("#signin2");
  onSignUpForm = new SignUp(page);
});

test.afterEach(async ({ page }) => {
  await page.close();
});

test.describe("Demoblaze Product Store - User Account Creation", () => {
  test("Sign up validation", async ({ page }) => {
    await onSignUpForm.verifySignUpValidation();
  });

  test("Sign up", async ({ page }) => {
    await onSignUpForm.completeAndSubmitForm();
  });
});
