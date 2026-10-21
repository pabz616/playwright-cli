"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
const testData_1 = __importDefault(require("../../../utils/testData"));
const ShoppingCart_1 = __importDefault(require("../../pages/ShoppingCart"));
let onShoppingCart;
test_1.test.beforeEach(async ({ page }) => {
    await page.goto(testData_1.default.BASE_URL);
    onShoppingCart = new ShoppingCart_1.default(page);
});
test_1.test.afterEach(async ({ page }) => {
    await page.close();
});
test_1.test.describe("Demoblaze Product Store - Shopping Cart Checkout", () => {
    (0, test_1.test)("Confirm cart order form fields and complete purchase", async ({ page, }) => {
        await onShoppingCart.addProductToCart();
        await onShoppingCart.viewCart();
        await onShoppingCart.confirmCartUIElements();
        await onShoppingCart.placeOrder();
        await onShoppingCart.verifyOrderConfirmation();
    });
});
