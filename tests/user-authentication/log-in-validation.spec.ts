import { test, expect } from "@playwright/test";

const BASE_URL = "https://www.demoblaze.com/";

test.describe("User authentication", () => {
  test("log in validation", async ({ page }) => {
    await page.goto(BASE_URL);
    await page.locator("#login2").click();
    await expect(page.locator("#logInModal")).toBeVisible();

    const emptyDialogPromise = page.waitForEvent("dialog");
    await page.locator("button", { hasText: "Log in" }).click();
    const emptyDialog = await emptyDialogPromise;
    expect(emptyDialog.message()).toMatch(/Please fill|empty|username/i);
    await emptyDialog.accept();

    await page.fill("#loginusername", "not_a_user");
    await page.fill("#loginpassword", "wrongpassword");
    const invalidDialogPromise = page.waitForEvent("dialog");
    await page.locator("button", { hasText: "Log in" }).click();
    const invalidDialog = await invalidDialogPromise;
    expect(invalidDialog.message()).toMatch(/user|exist|password|incorrect/i);
    await invalidDialog.accept();
  });
});
