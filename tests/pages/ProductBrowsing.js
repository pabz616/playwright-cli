"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
const locators_1 = __importDefault(require("../pageElements/locators"));
const testData_1 = __importDefault(require("../../utils/testData"));
class HomePage_ProductBrowsing {
    page;
    phonesCategory;
    laptopsCategory;
    monitorsCategory;
    productCards;
    firstProductTitle;
    constructor(page) {
        this.page = page;
        this.phonesCategory = page.locator(locators_1.default.PHONES_CATEGORY);
        this.laptopsCategory = page.locator(locators_1.default.LAPTOPS_CATEGORY);
        this.monitorsCategory = page.locator(locators_1.default.MONITORS_CATEGORY);
        this.productCards = page.locator(locators_1.default.PRODUCT_CARDS);
        this.firstProductTitle = page.locator(locators_1.default.FIRST_PRODUCT_TITLE).first();
    }
    async verifyHomePage() {
        await (0, test_1.expect)(this.page).toHaveTitle(/STORE/);
        await (0, test_1.expect)(this.page.locator(locators_1.default.HOME)).toBeVisible();
        await (0, test_1.expect)(this.page.locator(locators_1.default.CONTACT)).toBeVisible();
        await (0, test_1.expect)(this.page.locator(locators_1.default.ABOUT_US)).toBeVisible();
        await (0, test_1.expect)(this.page.locator(locators_1.default.CART)).toBeVisible();
        await (0, test_1.expect)(this.page.locator(locators_1.default.LOG_IN)).toBeVisible();
        await (0, test_1.expect)(this.page.locator(locators_1.default.SIGN_UP)).toBeVisible();
        const carouselItems = this.page.locator(locators_1.default.ACTIVE_SLIDE);
        (0, test_1.expect)(await carouselItems.count()).toBeGreaterThan(0);
        await (0, test_1.expect)(carouselItems.first()).toBeVisible();
        await (0, test_1.expect)(this.phonesCategory).toBeVisible();
        await (0, test_1.expect)(this.laptopsCategory).toBeVisible();
        await (0, test_1.expect)(this.monitorsCategory).toBeVisible();
        await this.page.waitForSelector(locators_1.default.PRODUCT_CARDS);
        // expect(await this.productCards.count()).toBeGreaterThan(0);
        await (0, test_1.expect)(this.productCards.first().locator(locators_1.default.PRODUCT_IMAGE)).toBeVisible();
        await (0, test_1.expect)(this.productCards.first().locator(locators_1.default.PRODUCT_TITLE)).toBeVisible();
        await (0, test_1.expect)(this.productCards.first().locator(locators_1.default.PRODUCT_PRICE)).toBeVisible();
    }
    async filterByCategory(categoryName) {
        let categoryLocator;
        if (categoryName === "Phones") {
            categoryLocator = this.phonesCategory;
        }
        else if (categoryName === "Laptops") {
            categoryLocator = this.laptopsCategory;
        }
        else if (categoryName === "Monitors") {
            categoryLocator = this.monitorsCategory;
        }
        else {
            throw new Error("Unknown category");
        }
        await categoryLocator.click();
        await this.page.waitForSelector(locators_1.default.PRODUCT_CARDS);
        // expect(await this.productCards.count()).toBeGreaterThan(0);
        await (0, test_1.expect)(this.productCards.first().locator(locators_1.default.PRODUCT_IMAGE)).toBeVisible();
        await (0, test_1.expect)(this.productCards.first().locator(locators_1.default.PRODUCT_TITLE)).toBeVisible();
        await (0, test_1.expect)(this.productCards.first().locator(locators_1.default.PRODUCT_PRICE)).toBeVisible();
        // await expect(this.productCards.first().locator(locators.PRODUCT_PRICE),).toContainText("$");
    }
    async viewProductDetails() {
        const productTitle = await this.firstProductTitle.textContent();
        const prod_id = "prod.html?idp_=1";
        await this.firstProductTitle.click();
        await (0, test_1.expect)(this.page).toHaveURL(testData_1.default.BASE_URL + prod_id);
        await (0, test_1.expect)(this.page.locator(locators_1.default.PRODUCT_NAME)).toBeVisible();
        await (0, test_1.expect)(this.page.locator(locators_1.default.PRODUCT_NAME)).toContainText(productTitle?.trim() || "");
        await (0, test_1.expect)(this.page.locator(locators_1.default.PRODUCT_PRICE_CONTAINER)).toBeVisible();
        await (0, test_1.expect)(this.page.locator(locators_1.default.PRODUCT_DESCRIPTION)).toBeVisible();
        await (0, test_1.expect)(this.page.locator(locators_1.default.ADD_TO_CART_BUTTON)).toBeVisible();
    }
}
exports.default = HomePage_ProductBrowsing;
