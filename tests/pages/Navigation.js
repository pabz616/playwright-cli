"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
const locators_1 = __importDefault(require("../pageElements/locators"));
class NavigationHeader {
    home_link;
    contact_link;
    aboutUs_link;
    cart_link;
    logIn_link;
    SIGN_UP_link;
    constructor(page) {
        this.home_link = page.locator(locators_1.default.HOME);
        this.contact_link = page.locator(locators_1.default.CONTACT);
        this.aboutUs_link = page.locator(locators_1.default.ABOUT_US);
        this.cart_link = page.locator(locators_1.default.CART);
        this.logIn_link = page.locator(locators_1.default.LOG_IN);
        this.SIGN_UP_link = page.locator(locators_1.default.SIGN_UP);
    }
    async verifyNavigationLinks() {
        await (0, test_1.expect)(this.home_link).toBeVisible();
        await (0, test_1.expect)(this.home_link).toBeEnabled();
        //
        await (0, test_1.expect)(this.contact_link).toBeVisible();
        await (0, test_1.expect)(this.contact_link).toBeEnabled();
        //
        await (0, test_1.expect)(this.aboutUs_link).toBeVisible();
        await (0, test_1.expect)(this.aboutUs_link).toBeEnabled();
        //
        await (0, test_1.expect)(this.cart_link).toBeVisible();
        await (0, test_1.expect)(this.cart_link).toBeEnabled();
        //
        await (0, test_1.expect)(this.logIn_link).toBeVisible();
        await (0, test_1.expect)(this.logIn_link).toBeEnabled();
        //
        await (0, test_1.expect)(this.SIGN_UP_link).toBeVisible();
        await (0, test_1.expect)(this.SIGN_UP_link).toBeEnabled();
    }
    async navigateToHome() { await this.home_link.click(); }
    async navigateToContact() { await this.contact_link.click(); }
    async navigateToAboutUs() { await this.aboutUs_link.click(); }
    async navigateToCart() { await this.cart_link.click(); }
    async navigateToLogIn() { await this.logIn_link.click(); }
    async navigateToSignUp() { await this.SIGN_UP_link.click(); }
}
exports.default = NavigationHeader;
