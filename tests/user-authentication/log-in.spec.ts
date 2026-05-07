import { test, expect } from "@playwright/test";

const BASE_URL = "https://www.demoblaze.com/";

test.describe("User authentication", () => {
  test("log in", async ({ page }) => {
    const username = `user_login_${Date.now()}`;

    await page.goto(BASE_URL);
    await page.locator("#signin2").click();
    await page.fill("#sign-username", username);
    await page.fill("#sign-password", "Password123!");
    const signUpDialogPromise = page.waitForEvent("dialog");
    await page.locator("button", { hasText: "Sign up" }).click();
    const signUpDialog = await signUpDialogPromise;
    await signUpDialog.accept();

    await page.locator("#login2").click();
    await expect(page.locator("#logInModal")).toBeVisible();
    await page.fill("#loginusername", username);
    await page.fill("#loginpassword", "Password123!");

    await page.locator("button", { hasText: "Log in" }).click();
    await expect(page.locator("#nameofuser")).toContainText(username);
  });
});
