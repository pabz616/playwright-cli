"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
const testData_1 = __importDefault(require("../../../utils/testData"));
const StaticPages_1 = __importDefault(require("../../pages/StaticPages"));
let onStaticPages;
test_1.test.beforeEach(async ({ page }) => {
    await page.goto(testData_1.default.BASE_URL);
    onStaticPages = new StaticPages_1.default(page);
});
test_1.test.afterEach(async ({ page }) => {
    await page.close();
});
test_1.test.describe("Demoblaze Product Stores - Static Pages", () => {
    (0, test_1.test)("View About Us", async ({ page }) => {
        await onStaticPages.aboutUs();
    });
    (0, test_1.test)("View Contact Form", async ({ page }) => {
        await onStaticPages.contactForm();
    });
});
