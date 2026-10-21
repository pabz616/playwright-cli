"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
const testData_1 = __importDefault(require("../../utils/testData"));
const ShoppingCart_1 = __importDefault(require("../pages/ShoppingCart"));
const ProductBrowsing_1 = __importDefault(require("../pages/ProductBrowsing"));
const Login_1 = __importDefault(require("../pages/Login"));
let onShoppingCart;
let onLoginForm;
let onHomePageProductBrowsing;
const devicesToTest = ['iPhone 13', 'Tablet', 'Pixel 5'];
test_1.test.beforeEach(async () => {
    const browser = await test_1.webkit.launch();
    for (const deviceName of devicesToTest) {
        const device = test_1.devices[deviceName];
        const context = await browser.newContext({ ...device, });
        const page = await context.newPage();
        await page.goto(testData_1.default.BASE_URL);
        onShoppingCart = new ShoppingCart_1.default(page);
        onLoginForm = new Login_1.default(page);
        onHomePageProductBrowsing = new ProductBrowsing_1.default(page);
    }
});
test_1.test.describe("Demoblaze Product Store - Checkout Workflow", () => {
    (0, test_1.test)("Guest Checkout - Place single order", async ({ page }) => {
        await onShoppingCart.addProductToCart();
        await onShoppingCart.confirmCartUIElements();
        await onShoppingCart.placeOrder();
    });
    test_1.test.skip("Logged In Checkout - Place single order", async ({ page }) => {
        //TODO - Bug! The header wraps when logged in on mobile, causing the "Name of User" element to be hidden and the test to fail. 
        await onLoginForm.submitValidLogin(testData_1.default.USN, testData_1.default.PWD);
        await onShoppingCart.addProductToCart();
        await onShoppingCart.confirmCartUIElements();
        await onShoppingCart.placeOrder();
        await onShoppingCart.confirmOrderDetails(testData_1.default.NAME, testData_1.default.COUNTRY);
    });
    (0, test_1.test)("Random Product Checkout - Add a randomly selected product", async ({ page, }) => {
        const randomProduct = await onShoppingCart.addRandomProductToCart();
        await onShoppingCart.viewCart();
        await onShoppingCart.confirmItemsInCart();
        await onShoppingCart.confirmCartUIElements();
        await onShoppingCart.placeOrder();
        await onShoppingCart.verifyOrderConfirmation();
        await (0, test_1.expect)(randomProduct).toBeTruthy();
    });
    (0, test_1.test)("Checkout with all identical products", async ({ page }) => {
        const productName = await onShoppingCart.addSameProductMultipleTimes(0, 3);
        const productsAdded = page.locator("#tbodyid tr");
        await onShoppingCart.viewCart();
        (0, test_1.expect)(productName).toBeTruthy();
        await (0, test_1.expect)(productsAdded).toHaveCount(1);
        await onShoppingCart.confirmCartUIElements();
        await onShoppingCart.placeOrder();
    });
    (0, test_1.test)("Checkout with one phone, one laptop, and one monitor", async ({ page, }) => {
        const productsAdded = page.locator("#tbodyid tr");
        await onShoppingCart.addProductToCartByIndex(0);
        await onShoppingCart.returnHome();
        await onHomePageProductBrowsing.filterByCategory("Laptops");
        await onShoppingCart.addProductToCartByIndex(0);
        await onShoppingCart.returnHome();
        await onHomePageProductBrowsing.filterByCategory("Monitors");
        await onShoppingCart.addProductToCartByIndex(0);
        await onShoppingCart.viewCart();
        await (0, test_1.expect)(productsAdded).toHaveCount(1);
        await onShoppingCart.confirmCartUIElements();
        await onShoppingCart.placeOrder();
    });
});
