import { test, expect } from "@playwright/test";
import testData from "../../utils/testData";
import locators from "../pageElements/locators";

test.describe("Demoblaze Product Store - Usability", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(testData.BASE_URL);
  });

  test("Homepage navigation is visible, meaningful, and easy to scan", async ({
    page,
  }) => {
    await expect(page.locator(locators.HOME)).toBeVisible();
    await expect(page.locator(locators.CONTACT)).toBeVisible();
    await expect(page.locator(locators.ABOUT_US)).toBeVisible();
    await expect(page.locator(locators.CART)).toBeVisible();
    await expect(page.locator(locators.LOG_IN)).toBeVisible();
    await expect(page.locator(locators.SIGN_UP)).toBeVisible();

    const carouselIndicators = page.locator(locators.INDICATORS);
    expect(await carouselIndicators.count()).toBeGreaterThan(0);

    await expect(page.locator(locators.ACTIVE_SLIDE)).toBeVisible();
    await expect(page.locator(locators.PREV_BUTTON)).toBeVisible();
    await expect(page.locator(locators.NEXT_BUTTON)).toBeVisible();
  });

  test("Product listings clearly display key product information", async ({
    page,
  }) => {
    const firstCard = page.locator(locators.PRODUCT_CARDS).first();
    await expect(firstCard).toBeVisible();
    await expect(firstCard.locator(locators.PRODUCT_IMAGE)).toBeVisible();
    await expect(firstCard.locator(locators.PRODUCT_TITLE)).toBeVisible();
    await expect(firstCard.locator(locators.PRODUCT_PRICE)).toBeVisible();

    const titleText = await firstCard
      .locator(locators.PRODUCT_TITLE)
      .innerText();
    const priceText = await firstCard
      .locator(locators.PRODUCT_PRICE)
      .innerText();

    expect(titleText.trim().length).toBeGreaterThan(0);
    expect(priceText.trim().length).toBeGreaterThan(0);
    // expect(priceText).toContain("$");
  });

  test("Key actions and dialogs are easy to discover and launch", async ({
    page,
  }) => {
    await page.click(locators.CONTACT);
    await expect(page.locator(locators.CONTACT_MODAL)).toBeVisible();
    await page.click(locators.CONTACT_CLOSE_BUTTON);
    await expect(page.locator(locators.CONTACT_MODAL)).not.toBeVisible();

    await page.click(locators.LOG_IN);
    await expect(page.locator(locators.LOG_IN_MODAL)).toBeVisible();
    await page.click(locators.LOG_IN_CLOSE_BUTTON);
    await expect(page.locator(locators.LOG_IN_MODAL)).not.toBeVisible();

    await page.click(locators.SIGN_UP);
    await expect(page.locator(locators.SIGN_IN_MODAL)).toBeVisible();
  });
});
