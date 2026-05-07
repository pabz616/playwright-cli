import { test, expect } from "@playwright/test";

const BASE_URL = "https://www.demoblaze.com/";

test.describe("User authentication", () => {
  test("sign up", async ({ page }) => {
    await page.goto(BASE_URL);
    await page.locator("#signin2").click();

    await expect(page.locator("#signInModal")).toBeVisible();
    await expect(page.locator("#sign-username")).toBeVisible();
    await expect(page.locator("#sign-password")).toBeVisible();

    const username = `demo_user_${Date.now()}`;
    await page.fill("#sign-username", username);
    await page.fill("#sign-password", "Password123!");

    const [dialog] = await Promise.all([
      page.waitForEvent("dialog"),
      page.locator("button", { hasText: "Sign up" }).click(),
    ]);

    expect(dialog.message()).toContain("Sign up successful");
    await dialog.accept();
  });
});
