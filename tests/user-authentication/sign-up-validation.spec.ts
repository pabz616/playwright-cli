import { test, expect } from "@playwright/test";

const BASE_URL = "https://www.demoblaze.com/";

test.describe("User authentication", () => {
  test("sign up validation", async ({ page }) => {
    await page.goto(BASE_URL);
    await page.locator("#signin2").click();
    await expect(page.locator("#signInModal")).toBeVisible();

    const emptyDialogPromise = page.waitForEvent("dialog");
    await page.locator("button", { hasText: "Sign up" }).click();
    const emptyDialog = await emptyDialogPromise;
    expect(emptyDialog.message()).toMatch(/Please fill|empty|username/i);
    await emptyDialog.accept();

    const username = `demo_user_${Date.now()}`;
    await page.fill("#sign-username", username);
    await page.fill("#sign-password", "Password123!");
    const successDialogPromise = page.waitForEvent("dialog");
    await page.locator("button", { hasText: "Sign up" }).click();
    const successDialog = await successDialogPromise;
    await successDialog.accept();

    await page.locator("#signin2").click();
    await page.fill("#sign-username", username);
    await page.fill("#sign-password", "Password123!");
    const duplicateDialogPromise = page.waitForEvent("dialog");
    await page.locator("button", { hasText: "Sign up" }).click();
    const duplicateDialog = await duplicateDialogPromise;
    expect(duplicateDialog.message()).toMatch(/exist|already/i);
    await duplicateDialog.accept();
  });
});
