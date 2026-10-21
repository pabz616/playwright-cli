"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
const Navigation_1 = __importDefault(require("../../pages/Navigation"));
const testData_1 = __importDefault(require("../../../utils/testData"));
let onHomePageNavigationHeader;
test_1.test.beforeEach(async ({ page }) => {
    await page.goto(testData_1.default.BASE_URL);
    onHomePageNavigationHeader = new Navigation_1.default(page);
});
test_1.test.afterEach(async ({ page }) => {
    await page.close();
});
test_1.test.describe("Demoblaze Product Store Homepage", () => {
    (0, test_1.test)("Verify homepage URL", async ({ page }) => {
        await (0, test_1.expect)(page).toHaveURL(testData_1.default.BASE_URL);
    });
    (0, test_1.test)("Confirm Navigation Links UI", async ({ page }) => {
        await onHomePageNavigationHeader.verifyNavigationLinks();
    });
    (0, test_1.test)("Confirm Navigation to Contact page", async ({ page }) => {
        await onHomePageNavigationHeader.navigateToContact();
        await (0, test_1.expect)(page.locator("#exampleModal")).toBeVisible();
    });
    (0, test_1.test)("Confirm Navigation to About Us page", async ({ page }) => {
        await onHomePageNavigationHeader.navigateToAboutUs();
        await (0, test_1.expect)(page.locator("#videoModal")).toBeVisible();
    });
    (0, test_1.test)("Navigate to Cart page", async ({ page }) => {
        await onHomePageNavigationHeader.navigateToCart();
        await (0, test_1.expect)(page).toHaveURL(/cart\.html$/);
    });
    (0, test_1.test)("Navigate to Log In page", async ({ page }) => {
        await onHomePageNavigationHeader.navigateToLogIn();
        await (0, test_1.expect)(page.locator("#logInModal")).toBeVisible();
    });
    (0, test_1.test)("Navigate to Sign Up page", async ({ page }) => {
        await onHomePageNavigationHeader.navigateToSignUp();
        await (0, test_1.expect)(page.locator("#signInModal")).toBeVisible();
    });
});
