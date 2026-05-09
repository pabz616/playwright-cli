import { test, expect, type Browser, type Page } from "@playwright/test";
import testData from "../../utils/testData";
import locators from "../pageElements/locators";

const orderFormData = {
  name: "Performance Tester",
  country: "USA",
  city: "Seattle",
  card: "4111111111111111",
  month: "12",
  year: "2026",
};

async function openStoreAndAddProduct(page: Page) {
  await page.goto(testData.BASE_URL, { waitUntil: "load" });
  await page.locator(locators.FIRST_PRODUCT_TITLE).first().click();
  const [dialog] = await Promise.all([
    page.waitForEvent("dialog"),
    page.locator(locators.ADD_TO_CART_BUTTON).click(),
  ]);
  expect(dialog.message()).toContain("Product added");
  await dialog.accept();
}

async function completeCheckout(page: Page) {
  await page.locator(locators.CART).click();
  await expect(page).toHaveURL(/cart\.html/);
  await page.locator(locators.PLACE_ORDER_BUTTON).click();
  await expect(page.locator(locators.ORDER_MODAL)).toBeVisible({
    timeout: 15000,
  });

  await page.fill(locators.NAME_INPUT, orderFormData.name);
  await page.fill(locators.COUNTRY_INPUT, orderFormData.country);
  await page.fill(locators.CITY_INPUT, orderFormData.city);
  await page.fill(locators.CARD_INPUT, orderFormData.card);
  await page.fill(locators.MONTH_INPUT, orderFormData.month);
  await page.fill(locators.YEAR_INPUT, orderFormData.year);

  await page.locator(locators.PURCHASE_BUTTON).click();
  await expect(page.locator(locators.SUCCESS_ALERT)).toContainText(
    /Thank you for your purchase!/i,
  );
  await page
    .locator(".sweet-alert button")
    .click({ timeout: 10000 })
    .catch(() => null);
}

async function getNavigationMetrics(page: Page) {
  return await page.evaluate(() => {
    const timing = performance.getEntriesByType("navigation")[0] as
      | PerformanceNavigationTiming
      | undefined;
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

async function runCheckoutSession(browser: Browser, delayMs = 0) {
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

test.describe.configure({ mode: "parallel" });

test.describe("Demoblaze Product Store - Checkout Performance", () => {
  test("Checkout load test: repeated order throughput", async ({ browser }) => {
    const orderCount = 4;
    const orderDurations: number[] = [];

    for (let i = 0; i < orderCount; i++) {
      const duration = await runCheckoutSession(browser);
      orderDurations.push(duration);
      test.info().attach(`order-${i + 1}-duration`, {
        body: `${duration}`,
        contentType: "text/plain",
      });
    }

    const average =
      orderDurations.reduce((sum, value) => sum + value, 0) /
      orderDurations.length;
    expect(orderDurations.length).toBe(orderCount);
    expect(average).toBeLessThanOrEqual(45000);
  });

  test("Checkout spike test: sudden burst of parallel orders", async ({
    browser,
  }) => {
    const concurrentOrders = 3;
    const tasks = Array.from({ length: concurrentOrders }, () =>
      runCheckoutSession(browser),
    );
    const durations = await Promise.all(tasks);

    for (const duration of durations) {
      expect(duration).toBeLessThanOrEqual(60000);
    }
  });

  test("Checkout stress test: repeated end-to-end orders", async ({
    browser,
  }) => {
    const iterations = 6;
    const metrics: number[] = [];

    for (let i = 0; i < iterations; i++) {
      metrics.push(await runCheckoutSession(browser));
    }

    const slowOrders = metrics.filter((duration) => duration > 50000);
    expect(slowOrders.length).toBeLessThanOrEqual(2);
  });

  test("Checkout performance under simulated slow network", async ({
    browser,
  }) => {
    const duration = await runCheckoutSession(browser, 120);
    expect(duration).toBeLessThanOrEqual(90000);
  });

  test("Checkout timing metrics capture during order completion", async ({
    page,
  }) => {
    await page.goto(testData.BASE_URL, { waitUntil: "load" });
    const startMetrics = await getNavigationMetrics(page);
    expect(startMetrics).not.toBeNull();
    await openStoreAndAddProduct(page);

    const cartNavigation = page.waitForURL(/cart\.html/);
    await page.locator(locators.CART).click();
    await cartNavigation;
    const cartMetrics = await getNavigationMetrics(page);
    expect(cartMetrics?.totalDuration).toBeGreaterThan(0);

    await completeCheckout(page);
    test.info().attach("checkout-start-metrics", {
      body: JSON.stringify(startMetrics, null, 2),
      contentType: "application/json",
    });
    test.info().attach("checkout-cart-metrics", {
      body: JSON.stringify(cartMetrics, null, 2),
      contentType: "application/json",
    });
  });
});
