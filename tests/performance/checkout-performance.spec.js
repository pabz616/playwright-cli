"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
const testData_1 = __importDefault(require("../../utils/testData"));
const locators_1 = __importDefault(require("../pageElements/locators"));
const orderFormData = {
    name: "Performance Tester",
    country: testData_1.default.COUNTRY,
    city: testData_1.default.CITY,
    card: testData_1.default.CARD,
    month: testData_1.default.MONTH,
    year: testData_1.default.YEAR,
};
async function openStoreAndAddProduct(page) {
    await page.goto(testData_1.default.BASE_URL, { waitUntil: "load" });
    await page.locator(locators_1.default.FIRST_PRODUCT_TITLE).first().click();
    const [dialog] = await Promise.all([
        page.waitForEvent("dialog"),
        page.locator(locators_1.default.ADD_TO_CART_BUTTON).click(),
    ]);
    (0, test_1.expect)(dialog.message()).toContain("Product added");
    await dialog.accept();
}
async function completeCheckout(page) {
    await page.locator(locators_1.default.CART).click();
    await (0, test_1.expect)(page).toHaveURL(/cart\.html/);
    await page.locator(locators_1.default.PLACE_ORDER_BUTTON).click();
    await (0, test_1.expect)(page.locator(locators_1.default.ORDER_MODAL)).toBeVisible({ timeout: 50000, });
    await page.fill(locators_1.default.NAME_INPUT, orderFormData.name);
    await page.fill(locators_1.default.COUNTRY_INPUT, orderFormData.country);
    await page.fill(locators_1.default.CITY_INPUT, orderFormData.city);
    await page.fill(locators_1.default.CARD_INPUT, orderFormData.card);
    await page.fill(locators_1.default.MONTH_INPUT, orderFormData.month);
    await page.fill(locators_1.default.YEAR_INPUT, orderFormData.year);
    await page.locator(locators_1.default.PURCHASE_BUTTON).click();
    await (0, test_1.expect)(page.locator(locators_1.default.SUCCESS_ALERT)).toContainText(/Thank you for your purchase!/i);
    await page
        .locator(".sweet-alert button")
        .click({ timeout: 50000 })
        .catch(() => null);
}
async function getNavigationMetrics(page) {
    return await page.evaluate(() => {
        const timing = performance.getEntriesByType("navigation")[0];
        if (!timing) {
            return null;
        }
        return {
            fetchStart: timing.fetchStart,
            responseEnd: timing.responseEnd,
            domContentLoadedEventEnd: timing.domContentLoadedEventEnd,
            loadEventEnd: timing.loadEventEnd,
            totalDuration: timing.loadEventEnd - timing.fetchStart,
            domInteractive: timing.domInteractive - timing.fetchStart,
            responseTime: timing.responseEnd - timing.fetchStart,
        };
    });
}
async function runCheckoutSession(browser, delayMs = 0) {
    const context = await browser.newContext();
    if (delayMs > 0) {
        await context.route("**/*", async (route) => {
            await new Promise((resolve) => setTimeout(resolve, delayMs));
            await route.continue();
        });
    }
    const page = await context.newPage();
    const start = Date.now();
    await openStoreAndAddProduct(page);
    await completeCheckout(page);
    const duration = Date.now() - start;
    await context.close();
    return duration;
}
test_1.test.describe.configure({ mode: "parallel" });
test_1.test.describe("Demoblaze Product Store - Checkout Performance", () => {
    (0, test_1.test)("Checkout load test: repeated order throughput", async ({ browser }) => {
        const orderCount = 4;
        const orderDurations = [];
        for (let i = 0; i < orderCount; i++) {
            const duration = await runCheckoutSession(browser);
            orderDurations.push(duration);
            test_1.test.info().attach(`order-${i + 1}-duration`, {
                body: `${duration}`,
                contentType: "text/plain",
            });
        }
        const average = orderDurations.reduce((sum, value) => sum + value, 0) /
            orderDurations.length;
        (0, test_1.expect)(orderDurations.length).toBe(orderCount);
        (0, test_1.expect)(average).toBeLessThanOrEqual(45000);
    });
    (0, test_1.test)("Checkout spike test: sudden burst of parallel orders", async ({ browser, }) => {
        const concurrentOrders = 3;
        const tasks = Array.from({ length: concurrentOrders }, () => runCheckoutSession(browser));
        const durations = await Promise.all(tasks);
        for (const duration of durations) {
            (0, test_1.expect)(duration).toBeLessThanOrEqual(60000);
        }
    });
    test_1.test.skip("Checkout stress test: repeated end-to-end orders", async ({ 
    //TODO BUG - Input times out after concurrent orders. Need to investigate and fix a.s.a.p.
    browser, }) => {
        const iterations = 20;
        const metrics = [];
        for (let i = 0; i < iterations; i++) {
            metrics.push(await runCheckoutSession(browser));
        }
        const slowOrders = metrics.filter((duration) => duration > 50000);
        (0, test_1.expect)(slowOrders.length).toBeLessThanOrEqual(2);
    });
    test_1.test.skip("Checkout performance under simulated slow network", async ({ 
    //TODO BUG - Input times out when network is throttled. Need to investigate and fix a.s.a.p.
    browser, }) => {
        const duration = await runCheckoutSession(browser, 120);
        (0, test_1.expect)(duration).toBeLessThanOrEqual(100000);
    });
    (0, test_1.test)("Checkout timing metrics capture during order completion", async ({ page, }) => {
        await page.goto(testData_1.default.BASE_URL, { waitUntil: "load" });
        const startMetrics = await getNavigationMetrics(page);
        (0, test_1.expect)(startMetrics).not.toBeNull();
        await openStoreAndAddProduct(page);
        const cartNavigation = page.waitForURL(/cart\.html/);
        await page.locator(locators_1.default.CART).click();
        await cartNavigation;
        const cartMetrics = await getNavigationMetrics(page);
        (0, test_1.expect)(cartMetrics?.totalDuration).toBeGreaterThan(0);
        await completeCheckout(page);
        test_1.test.info().attach("checkout-start-metrics", {
            body: JSON.stringify(startMetrics, null, 2),
            contentType: "application/json",
        });
        test_1.test.info().attach("checkout-cart-metrics", {
            body: JSON.stringify(cartMetrics, null, 2),
            contentType: "application/json",
        });
    });
});
