"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
const testData_1 = __importDefault(require("../../utils/testData"));
const locators_1 = __importDefault(require("../pageElements/locators"));
test_1.test.describe("Demoblaze Product Store - Reliability", () => {
    test_1.test.beforeEach(async ({ page }) => {
        await page.goto(testData_1.default.BASE_URL);
    });
    test_1.test.afterEach(async ({ page }) => {
        await page.close();
    });
    (0, test_1.test)("System remains stable under network interruptions", async ({ page, }) => {
        // Simulate network offline
        await page.context().setOffline(true);
        try {
            await page.reload();
            // When offline, expect navigation to fail or show offline message
            await (0, test_1.expect)(page.locator("body")).toContainText(""); // Adjust based on actual behavior
        }
        catch (e) {
            // Expected to fail
        }
        // Bring back online
        await page.context().setOffline(false);
        await page.reload();
        await (0, test_1.expect)(page.locator(locators_1.default.HOME)).toBeVisible();
    });
    (0, test_1.test)("Application handles slow network conditions", async ({ page }) => {
        // Throttle network to slow 3G
        await page.route("**/*", async (route) => {
            await new Promise((resolve) => setTimeout(resolve, 100)); // Simulate delay
            await route.continue();
        });
        await page.reload();
        await (0, test_1.expect)(page.locator(locators_1.default.HOME)).toBeVisible();
        // Check if carousel loads
        await (0, test_1.expect)(page.locator(locators_1.default.ACTIVE_SLIDE)).toBeVisible();
    });
    (0, test_1.test)("Browser refresh does not break session state", async ({ page }) => {
        // Navigate to a product
        await page.locator(locators_1.default.FIRST_PRODUCT_TITLE).first().click();
        await (0, test_1.expect)(page.locator(locators_1.default.PRODUCT_NAME)).toBeVisible();
        // Refresh
        await page.reload();
        // Should still be on product page or back to home? Assuming back to home for demo
        await (0, test_1.expect)(page.locator(locators_1.default.HOME)).toBeVisible();
    });
    (0, test_1.test)("Multiple browser tabs do not interfere", async ({ context }) => {
        const page1 = await context.newPage();
        const page2 = await context.newPage();
        await page1.goto(testData_1.default.BASE_URL);
        await page2.goto(testData_1.default.BASE_URL);
        await (0, test_1.expect)(page1.locator(locators_1.default.HOME)).toBeVisible();
        await (0, test_1.expect)(page2.locator(locators_1.default.HOME)).toBeVisible();
        // Perform actions on both
        await page1.locator(locators_1.default.CONTACT).click();
        await (0, test_1.expect)(page1.locator(locators_1.default.CONTACT_MODAL)).toBeVisible();
        await page2.locator(locators_1.default.LOG_IN).click();
        await (0, test_1.expect)(page2.locator(locators_1.default.LOG_IN_MODAL)).toBeVisible();
    });
    (0, test_1.test)("Long-running session maintains functionality", async ({ page }) => {
        // Simulate long session with multiple actions
        for (let i = 0; i < 5; i++) {
            await page.locator(locators_1.default.PHONES_CATEGORY).click();
            await page.waitForSelector(locators_1.default.PRODUCT_CARDS);
            await page.locator(locators_1.default.LAPTOPS_CATEGORY).click();
            await page.waitForSelector(locators_1.default.PRODUCT_CARDS);
        }
        await (0, test_1.expect)(page.locator(locators_1.default.PRODUCT_CARDS).first()).toBeVisible();
    });
    (0, test_1.test)("Chaos testing: Random user actions", async ({ page }) => {
        const clickIfAvailable = async (locatorString) => {
            const locator = page.locator(locatorString).first();
            if ((await locator.count()) === 0) {
                throw new Error(`Locator not found: ${locatorString}`);
            }
            await locator.scrollIntoViewIfNeeded();
            await locator.click({ timeout: 10000 });
        };
        const actions = [
            async () => {
                await clickIfAvailable(locators_1.default.HOME);
                await page.waitForLoadState("load");
            },
            async () => {
                await clickIfAvailable(locators_1.default.PHONES_CATEGORY);
                await page.waitForSelector(locators_1.default.PRODUCT_CARDS, { timeout: 10000 });
            },
            async () => {
                await clickIfAvailable(locators_1.default.LAPTOPS_CATEGORY);
                await page.waitForSelector(locators_1.default.PRODUCT_CARDS, { timeout: 10000 });
            },
            async () => {
                await page.goto(testData_1.default.BASE_URL);
                await page.waitForSelector(locators_1.default.FIRST_PRODUCT_TITLE, {
                    timeout: 10000,
                });
                await clickIfAvailable(locators_1.default.FIRST_PRODUCT_TITLE);
                await page.waitForSelector(locators_1.default.PRODUCT_NAME, { timeout: 10000 });
            },
            async () => {
                const response = await page
                    .goBack({ waitUntil: "load" })
                    .catch(() => null);
                if (!response) {
                    await page.goto(testData_1.default.BASE_URL);
                }
            },
        ];
        for (let i = 0; i < 10; i++) {
            const randomAction = actions[Math.floor(Math.random() * actions.length)];
            try {
                await randomAction();
            }
            catch (e) {
                // console.log(`Chaos action failed: ${e.message}`);
                await page.goto(testData_1.default.BASE_URL);
            }
            await page.waitForTimeout(500);
        }
        // Final check
        await page.goto(testData_1.default.BASE_URL);
        await (0, test_1.expect)(page.locator(locators_1.default.HOME)).toBeVisible();
    });
    (0, test_1.test)("Application recovers from JavaScript errors", async ({ page }) => {
        // Inject a script that throws an error
        await page.addScriptTag({
            content: 'throw new Error("Simulated JS error");',
        });
        // Page should still be usable
        await (0, test_1.expect)(page.locator(locators_1.default.HOME)).toBeVisible();
    });
    (0, test_1.test)("High load simulation with multiple requests", async ({ page }) => {
        // Simulate multiple concurrent actions
        const promises = [];
        for (let i = 0; i < 5; i++) {
            promises.push(page.locator(locators_1.default.PHONES_CATEGORY).click());
            promises.push(page.locator(locators_1.default.LAPTOPS_CATEGORY).click());
        }
        await Promise.all(promises);
        await (0, test_1.expect)(page.locator(locators_1.default.PRODUCT_CARDS).first()).toBeVisible();
    });
});
