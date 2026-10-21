"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
const testData_1 = __importDefault(require("../../../utils/testData"));
const ProductBrowsing_1 = __importDefault(require("../../pages/ProductBrowsing"));
let onHomePageProductBrowsing;
test_1.test.beforeEach(async ({ page }) => {
    await page.goto(testData_1.default.BASE_URL);
    onHomePageProductBrowsing = new ProductBrowsing_1.default(page);
});
test_1.test.afterEach(async ({ page }) => {
    await page.close();
});
test_1.test.describe("Demoblaze Product Store - Product browsing", () => {
    (0, test_1.test)("Browse Home Page", async ({ page }) => {
        await onHomePageProductBrowsing.verifyHomePage();
    });
});
