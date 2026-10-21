"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
const locators_1 = __importDefault(require("../pageElements/locators"));
const testData_1 = __importDefault(require("../../utils/testData"));
class ShoppingCart {
    page;
    firstProductTitle;
    productTitleLinks;
    addToCartButton;
    cartLink;
    cartTable;
    placeOrderButton;
    orderModal;
    deleteButton;
    homeLink;
    orderConfirmationModal;
    constructor(page) {
        this.page = page;
        this.firstProductTitle = page.locator(locators_1.default.FIRST_PRODUCT_TITLE).first();
        this.productTitleLinks = page.locator(locators_1.default.PRODUCT_TITLE);
        this.addToCartButton = page.locator(locators_1.default.ADD_TO_CART_BUTTON);
        this.cartLink = page.locator(locators_1.default.CART);
        this.cartTable = page.locator(locators_1.default.CART_TABLE);
        this.placeOrderButton = page.locator(locators_1.default.PLACE_ORDER_BUTTON);
        this.orderModal = page.locator(locators_1.default.ORDER_MODAL);
        this.deleteButton = page.locator("#tbodyid tr a", { hasText: "Delete" });
        this.homeLink = page.locator(locators_1.default.HOME);
        this.orderConfirmationModal = page.locator(locators_1.default.ORDER_CONFIRMATION_MODAL);
    }
    async confirmCartUIElements() {
        await this.cartLink.click();
        await this.placeOrderButton.click();
        await (0, test_1.expect)(this.orderModal).toBeVisible();
        await (0, test_1.expect)(this.page.locator(locators_1.default.NAME_INPUT)).toBeVisible();
        await (0, test_1.expect)(this.page.locator(locators_1.default.NAME_INPUT)).toBeEditable();
        await (0, test_1.expect)(this.page.locator(locators_1.default.COUNTRY_INPUT)).toBeVisible();
        await (0, test_1.expect)(this.page.locator(locators_1.default.COUNTRY_INPUT)).toBeEditable();
        await (0, test_1.expect)(this.page.locator(locators_1.default.CITY_INPUT)).toBeVisible();
        await (0, test_1.expect)(this.page.locator(locators_1.default.CITY_INPUT)).toBeEditable();
        await (0, test_1.expect)(this.page.locator(locators_1.default.CARD_INPUT)).toBeVisible();
        await (0, test_1.expect)(this.page.locator(locators_1.default.CARD_INPUT)).toBeEditable();
        await (0, test_1.expect)(this.page.locator(locators_1.default.MONTH_INPUT)).toBeVisible();
        await (0, test_1.expect)(this.page.locator(locators_1.default.MONTH_INPUT)).toBeEditable();
        await (0, test_1.expect)(this.page.locator(locators_1.default.YEAR_INPUT)).toBeVisible();
        await (0, test_1.expect)(this.page.locator(locators_1.default.YEAR_INPUT)).toBeEditable();
        // Close the modal after confirming elements
        await this.page.locator("#orderModal .btn-secondary").click();
    }
    async addProductToCart() {
        await this.firstProductTitle.click();
        const [dialog] = await Promise.all([
            this.page.waitForEvent("dialog"),
            this.addToCartButton.click(),
        ]);
        (0, test_1.expect)(dialog.message()).toContain("Product added");
        await dialog.accept();
    }
    async addProductToCartByIndex(index) {
        await this.page.waitForSelector(locators_1.default.PRODUCT_TITLE);
        const product = this.productTitleLinks.nth(index);
        const productName = (await product.textContent())?.trim() ?? "";
        await product.click();
        const [dialog] = await Promise.all([
            this.page.waitForEvent("dialog"),
            this.addToCartButton.click(),
        ]);
        (0, test_1.expect)(dialog.message()).toContain("Product added");
        await dialog.accept();
        return productName;
    }
    async addProductToCartFromCurrentProductDetails(times = 1) {
        await this.page.waitForSelector(locators_1.default.ADD_TO_CART_BUTTON);
        for (let i = 0; i < times; i += 1) {
            const [dialog] = await Promise.all([
                this.page.waitForEvent("dialog"),
                this.addToCartButton.click(),
            ]);
            (0, test_1.expect)(dialog.message()).toContain("Product added");
            await dialog.accept();
        }
    }
    async addRandomProductToCart() {
        await this.page.waitForSelector(locators_1.default.PRODUCT_TITLE);
        const count = await this.productTitleLinks.count();
        const randomIndex = Math.floor(Math.random() * count);
        return this.addProductToCartByIndex(randomIndex);
    }
    async addSameProductMultipleTimes(index, times) {
        const productName = await this.addProductToCartByIndex(index);
        if (times > 1) {
            await this.addProductToCartFromCurrentProductDetails(times - 1);
        }
        return productName;
    }
    async returnHome() {
        await this.homeLink.click();
        await this.page.waitForURL(/demoblaze\.com(\/|\/index\.html)?$/);
    }
    async confirmItemsInCart(expectedCount = 1) {
        await (0, test_1.expect)(this.page.locator("#tbodyid tr")).toHaveCount(1);
    }
    async getCartRowCount() {
        await this.cartLink.click();
        return this.page.locator(locators_1.default.CART_ROWS).count();
    }
    async viewCart() {
        await this.cartLink.click();
        await (0, test_1.expect)(this.page).toHaveURL(/cart\.html$/);
        await (0, test_1.expect)(this.cartTable).toBeVisible();
        await (0, test_1.expect)(this.page.locator(locators_1.default.CART_PIC_HEADER)).toBeVisible();
        await (0, test_1.expect)(this.page.locator(locators_1.default.CART_TITLE_HEADER)).toBeVisible();
        await (0, test_1.expect)(this.page.locator(locators_1.default.CART_PRICE_HEADER)).toBeVisible();
        await (0, test_1.expect)(this.page.locator(locators_1.default.CART_DELETE_HEADER)).toBeVisible();
        await (0, test_1.expect)(this.page.locator(locators_1.default.CART_TOTAL)).toHaveCount(1);
        await (0, test_1.expect)(this.placeOrderButton).toBeVisible();
    }
    async removeFromCart() {
        await this.cartLink.click();
        const rowsBefore = await this.page.locator(locators_1.default.CART_ROWS).count();
        await this.deleteButton.first().click();
        if (rowsBefore > 0) {
            await (0, test_1.expect)(this.page.locator(locators_1.default.CART_ROWS)).toHaveCount(Math.max(0, rowsBefore - 1));
        }
    }
    async placeOrder() {
        await this.cartLink.click();
        await this.placeOrderButton.click();
        await this.page.fill(locators_1.default.NAME_INPUT, testData_1.default.NAME);
        await this.page.fill(locators_1.default.COUNTRY_INPUT, testData_1.default.COUNTRY);
        await this.page.fill(locators_1.default.CITY_INPUT, testData_1.default.CITY);
        await this.page.fill(locators_1.default.CARD_INPUT, testData_1.default.CARD);
        await this.page.fill(locators_1.default.MONTH_INPUT, testData_1.default.MONTH);
        await this.page.fill(locators_1.default.YEAR_INPUT, testData_1.default.YEAR);
        await this.page.locator(locators_1.default.PURCHASE_BUTTON).click();
    }
    async confirmOrderDetails(expectedName, expectedCountry) {
        const confirmationText = await this.orderConfirmationModal.textContent();
        await (0, test_1.expect)(this.orderConfirmationModal).toBeVisible();
        await (0, test_1.expect)(this.page.locator(locators_1.default.SUCCESS_ALERT)).toHaveText(testData_1.default.ORDER_MSG);
        await (0, test_1.expect)(confirmationText).toContain(expectedName);
    }
    async verifyOrderConfirmation() {
        await (0, test_1.expect)(this.page.locator(".sweet-alert h2")).toHaveText(testData_1.default.ORDER_MSG);
    }
}
exports.default = ShoppingCart;
