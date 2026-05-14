import { test, expect } from "@playwright/test";
import testData from "../../../utils/testData";
import LoginForm from "../../pages/Login";

let onLoginForm: LoginForm;

test.beforeEach(async ({ page }) => {
  await page.goto(testData.BASE_URL);
  onLoginForm = new LoginForm(page);
});

test.describe("Demoblaze Product Store - User authentication", () => {
  test("log in validation", async ({ page }) => {
    await onLoginForm.verifyLogInValidation();
  });
  test("Valid Login", async ({ page }) => {
    await onLoginForm.submitValidLogin(testData.USN, testData.PWD);
  });
  test("Blank Login", async ({ page }) => {
    await onLoginForm.submitLogInForm("", "");
    page.on("dialog", async (dialog) => {
      expect(dialog.message()).toBe("Please fill out Username and Password.");
      await dialog.accept();});
  });
  test("Blank Username", async ({ page }) => {
    await onLoginForm.submitLogInForm("", "test");
    page.on("dialog", async (dialog) => {
      expect(dialog.message()).toBe("Please fill out Username and Password.");
      await dialog.accept();});
  });
  test("Blank Password", async ({ page }) => {
    await onLoginForm.submitLogInForm("test", "");
    page.on("dialog", async (dialog) => {
      expect(dialog.message()).toBe("Wrong password.");
      await dialog.accept();});
  });
  test("Invalid Credentials", async ({ page }) => {
    await onLoginForm.submitLogInForm("tester", "tester");
    page.on("dialog", async (dialog) => {
      expect(dialog.message()).toBe("Invalid password.");
      await dialog.accept();});
  });
  test("Exposed Admin Credentials", async ({ page }) => {
    await onLoginForm.submitLogInForm("admin", "admin");
    page.on("dialog", async (dialog) => {
      expect(dialog.message()).toBe("Invalid password.");
      await dialog.accept();});
  });


});