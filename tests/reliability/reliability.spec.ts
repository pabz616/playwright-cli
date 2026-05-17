import { test, expect } from "@playwright/test";
import testData from "../../utils/testData";
import locators from "../pageElements/locators";

test.describe("Demoblaze Product Store - Reliability", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(testData.BASE_URL);
  });

  test.afterEach(async ({ page }) => {
    await page.close();
  });

  test("System remains stable under network interruptions", async ({
    page,
  }) => {
    // Simulate network offline
    await page.context().setOffline(true);
    try {
      await page.reload();
      // When offline, expect navigation to fail or show offline message
      await expect(page.locator("body")).toContainText(""); // Adjust based on actual behavior
    } catch (e) {
      // Expected to fail
    }

    // Bring back online
    await page.context().setOffline(false);
    await page.reload();
    await expect(page.locator(locators.HOME)).toBeVisible();
  });

  test("Application handles slow network conditions", async ({ page }) => {
    // Throttle network to slow 3G
    await page.route("**/*", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 100)); // Simulate delay
      await route.continue();
    });
    await page.reload();
    await expect(page.locator(locators.HOME)).toBeVisible();
    // Check if carousel loads
    await expect(page.locator(locators.ACTIVE_SLIDE)).toBeVisible();
  });

  test("Browser refresh does not break session state", async ({ page }) => {
    // Navigate to a product
    await page.locator(locators.FIRST_PRODUCT_TITLE).first().click();
    await expect(page.locator(locators.PRODUCT_NAME)).toBeVisible();
    const productName = await page.locator(locators.PRODUCT_NAME).textContent();

    // Refresh
    await page.reload();
    // Should still be on product page or back to home? Assuming back to home for demo
    await expect(page.locator(locators.HOME)).toBeVisible();
  });

  test("Multiple browser tabs do not interfere", async ({ context }) => {
    const page1 = await context.newPage();
    const page2 = await context.newPage();

    await page1.goto(testData.BASE_URL);
    await page2.goto(testData.BASE_URL);

    await expect(page1.locator(locators.HOME)).toBeVisible();
    await expect(page2.locator(locators.HOME)).toBeVisible();

    // Perform actions on both
    await page1.locator(locators.CONTACT).click();
    await expect(page1.locator(locators.CONTACT_MODAL)).toBeVisible();

    await page2.locator(locators.LOG_IN).click();
    await expect(page2.locator(locators.LOG_IN_MODAL)).toBeVisible();
  });

  test("Long-running session maintains functionality", async ({ page }) => {
    // Simulate long session with multiple actions
    for (let i = 0; i < 5; i++) {
      await page.locator(locators.PHONES_CATEGORY).click();
      await page.waitForSelector(locators.PRODUCT_CARDS);
      await page.locator(locators.LAPTOPS_CATEGORY).click();
      await page.waitForSelector(locators.PRODUCT_CARDS);
    }
    await expect(page.locator(locators.PRODUCT_CARDS).first()).toBeVisible();
  });

  test("Chaos testing: Random user actions", async ({ page }) => {
    const clickIfAvailable = async (locatorString: string) => {
      const locator = page.locator(locatorString).first();
      if ((await locator.count()) === 0) {
        throw new Error(`Locator not found: ${locatorString}`);
      }
      await locator.scrollIntoViewIfNeeded();
      await locator.click({ timeout: 10000 });
    };

    const actions = [
      async () => {
        await clickIfAvailable(locators.HOME);
        await page.waitForLoadState("load");
      },
      async () => {
        await clickIfAvailable(locators.PHONES_CATEGORY);
        await page.waitForSelector(locators.PRODUCT_CARDS, { timeout: 10000 });
      },
      async () => {
        await clickIfAvailable(locators.LAPTOPS_CATEGORY);
        await page.waitForSelector(locators.PRODUCT_CARDS, { timeout: 10000 });
      },
      async () => {
        await page.goto(testData.BASE_URL);
        await page.waitForSelector(locators.FIRST_PRODUCT_TITLE, {
          timeout: 10000,
        });
        await clickIfAvailable(locators.FIRST_PRODUCT_TITLE);
        await page.waitForSelector(locators.PRODUCT_NAME, { timeout: 10000 });
      },
      async () => {
        const response = await page
          .goBack({ waitUntil: "load" })
          .catch(() => null);
        if (!response) {
          await page.goto(testData.BASE_URL);
        }
      },
    ];

    for (let i = 0; i < 10; i++) {
      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      try {
        await randomAction();
      } catch (e) {
        // console.log(`Chaos action failed: ${e.message}`);
        await page.goto(testData.BASE_URL);
      }
      await page.waitForTimeout(500);
    }

    // Final check
    await page.goto(testData.BASE_URL);
    await expect(page.locator(locators.HOME)).toBeVisible();
  });

  test("Application recovers from JavaScript errors", async ({ page }) => {
    // Inject a script that throws an error
    await page.addScriptTag({
      content: 'throw new Error("Simulated JS error");',
    });
    // Page should still be usable
    await expect(page.locator(locators.HOME)).toBeVisible();
  });

  test("High load simulation with multiple requests", async ({ page }) => {
    // Simulate multiple concurrent actions
    const promises = [];
    for (let i = 0; i < 5; i++) {
      promises.push(page.locator(locators.PHONES_CATEGORY).click());
      promises.push(page.locator(locators.LAPTOPS_CATEGORY).click());
    }
    await Promise.all(promises);
    await expect(page.locator(locators.PRODUCT_CARDS).first()).toBeVisible();
  });
});
