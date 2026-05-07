import { test, expect } from "@playwright/test";

const BASE_URL = "https://www.demoblaze.com/";

test.describe("Static pages", () => {
  test("contact form", async ({ page }) => {
    await page.goto(BASE_URL);
    await page.locator("a.nav-link", { hasText: "Contact" }).click();

    await expect(page.locator("#exampleModal")).toBeVisible();
    await expect(page.locator("#recipient-email")).toBeVisible();
    await expect(page.locator("#recipient-name")).toBeVisible();
    await expect(page.locator("#message-text")).toBeVisible();

    await page.fill("#recipient-email", "demo@test.com");
    await page.fill("#recipient-name", "Demo Tester");
    await page.fill("#message-text", "This is a demo contact message.");

    const [dialog] = await Promise.all([
      page.waitForEvent("dialog"),
      page.locator("button", { hasText: "Send message" }).click(),
    ]);

    expect(dialog.message()).toMatch(/Thanks|Thank you|successful/i);
    await dialog.accept();
  });
});
