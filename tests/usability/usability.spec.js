"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
const testData_1 = __importDefault(require("../../utils/testData"));
const locators_1 = __importDefault(require("../pageElements/locators"));
test_1.test.describe("Demoblaze Product Store - Usability", () => {
    test_1.test.beforeEach(async ({ page }) => {
        await page.goto(testData_1.default.BASE_URL);
    });
    (0, test_1.test)("Homepage navigation is visible, meaningful, and easy to scan", async ({ page, }) => {
        await (0, test_1.expect)(page.locator(locators_1.default.HOME)).toBeVisible();
        await (0, test_1.expect)(page.locator(locators_1.default.CONTACT)).toBeVisible();
        await (0, test_1.expect)(page.locator(locators_1.default.ABOUT_US)).toBeVisible();
        await (0, test_1.expect)(page.locator(locators_1.default.CART)).toBeVisible();
        await (0, test_1.expect)(page.locator(locators_1.default.LOG_IN)).toBeVisible();
        await (0, test_1.expect)(page.locator(locators_1.default.SIGN_UP)).toBeVisible();
        const carouselIndicators = page.locator(locators_1.default.INDICATORS);
        (0, test_1.expect)(await carouselIndicators.count()).toBeGreaterThan(0);
        await (0, test_1.expect)(page.locator(locators_1.default.ACTIVE_SLIDE)).toBeVisible();
        await (0, test_1.expect)(page.locator(locators_1.default.PREV_BUTTON)).toBeVisible();
        await (0, test_1.expect)(page.locator(locators_1.default.NEXT_BUTTON)).toBeVisible();
    });
    (0, test_1.test)("Product listings clearly display key product information", async ({ page, }) => {
        const firstCard = page.locator(locators_1.default.PRODUCT_CARDS).first();
        await (0, test_1.expect)(firstCard).toBeVisible();
        await (0, test_1.expect)(firstCard.locator(locators_1.default.PRODUCT_IMAGE)).toBeVisible();
        await (0, test_1.expect)(firstCard.locator(locators_1.default.PRODUCT_TITLE)).toBeVisible();
        await (0, test_1.expect)(firstCard.locator(locators_1.default.PRODUCT_PRICE)).toBeVisible();
        const titleText = await firstCard
            .locator(locators_1.default.PRODUCT_TITLE)
            .innerText();
        const priceText = await firstCard
            .locator(locators_1.default.PRODUCT_PRICE)
            .innerText();
        (0, test_1.expect)(titleText.trim().length).toBeGreaterThan(0);
        (0, test_1.expect)(priceText.trim().length).toBeGreaterThan(0);
        // expect(priceText).toContain("$");
    });
    (0, test_1.test)("Key actions and dialogs are easy to discover and launch", async ({ page, }) => {
        await page.click(locators_1.default.CONTACT);
        await (0, test_1.expect)(page.locator(locators_1.default.CONTACT_MODAL)).toBeVisible();
        await page.click(locators_1.default.CONTACT_CLOSE_BUTTON);
        await (0, test_1.expect)(page.locator(locators_1.default.CONTACT_MODAL)).not.toBeVisible();
        await page.click(locators_1.default.LOG_IN);
        await (0, test_1.expect)(page.locator(locators_1.default.LOG_IN_MODAL)).toBeVisible();
        await page.click(locators_1.default.LOG_IN_CLOSE_BUTTON);
        await (0, test_1.expect)(page.locator(locators_1.default.LOG_IN_MODAL)).not.toBeVisible();
        await page.click(locators_1.default.SIGN_UP);
        await (0, test_1.expect)(page.locator(locators_1.default.SIGN_IN_MODAL)).toBeVisible();
    });
});
