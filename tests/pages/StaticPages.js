"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
const locators_1 = __importDefault(require("../pageElements/locators"));
class StaticPages {
    page;
    contactLink;
    aboutUsLink;
    contactModal;
    videoModal;
    constructor(page) {
        this.page = page;
        this.contactLink = page.locator(locators_1.default.CONTACT);
        this.aboutUsLink = page.locator(locators_1.default.ABOUT_US);
        this.contactModal = page.locator(locators_1.default.CONTACT_MODAL);
        this.videoModal = page.locator(locators_1.default.VIDEO_MODAL);
    }
    async contactForm() {
        await this.contactLink.click();
        await (0, test_1.expect)(this.contactModal).toBeVisible();
        await (0, test_1.expect)(this.page.locator(locators_1.default.RECIPIENT_EMAIL)).toBeVisible();
        await (0, test_1.expect)(this.page.locator(locators_1.default.RECIPIENT_NAME)).toBeVisible();
        await (0, test_1.expect)(this.page.locator(locators_1.default.MESSAGE_TEXT)).toBeVisible();
        await this.page.fill(locators_1.default.RECIPIENT_EMAIL, "demo@test.com");
        await this.page.fill(locators_1.default.RECIPIENT_NAME, "Demo Tester");
        await this.page.fill(locators_1.default.MESSAGE_TEXT, "This is a demo contact message.");
        await this.page.locator(locators_1.default.SEND_MESSAGE_BUTTON).click();
    }
    async aboutUs() {
        await this.aboutUsLink.click();
        await (0, test_1.expect)(this.videoModal).toBeVisible();
        await (0, test_1.expect)(this.page.locator(locators_1.default.VIDEO_MODAL_BODY)).toBeVisible();
    }
}
exports.default = StaticPages;
