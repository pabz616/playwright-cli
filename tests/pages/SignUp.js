"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
const locators_1 = __importDefault(require("../pageElements/locators"));
const testData_1 = __importDefault(require("../../utils/testData"));
const username = testData_1.default.USN;
const password = testData_1.default.PWD;
class SignUp {
    page;
    signUpLink;
    signInModal;
    constructor(page) {
        this.page = page;
        this.signUpLink = page.locator(locators_1.default.SIGN_UP);
        this.signInModal = page.locator(locators_1.default.SIGN_IN_MODAL);
    }
    async completeAndSubmitForm() {
        await this.signUpLink.click();
        await (0, test_1.expect)(this.signInModal).toBeVisible();
        await this.page.fill(locators_1.default.SIGN_USERNAME, username);
        await this.page.fill(locators_1.default.SIGN_PASSWORD, password);
        const [dialog] = await Promise.all([
            this.page.waitForEvent("dialog"),
            this.page.locator(locators_1.default.SIGN_UP_BUTTON).click(),
        ]);
        (0, test_1.expect)(dialog.message()).toContain("This user already exist.");
        await dialog.accept();
        await this.page.keyboard.press("Escape");
        await (0, test_1.expect)(this.signInModal).toBeHidden();
    }
    async verifySignUpValidation() {
        // SIGN UP LINK ON THE HOME PAGE
        await (0, test_1.expect)(this.signUpLink).toBeVisible();
        this.signUpLink.click();
        // ON-CLICK, DISPLAY SIGN UP MODAL
        await (0, test_1.expect)(this.signInModal).toBeVisible();
        await this.page.locator(locators_1.default.SIGN_UP_BUTTON).click();
        // VALIDATE FORM FIELDS
        await (0, test_1.expect)(this.page.locator(locators_1.default.SIGN_USERNAME)).toBeVisible();
        await (0, test_1.expect)(this.page.locator(locators_1.default.SIGN_USERNAME)).toBeEditable();
        await (0, test_1.expect)(this.page.locator(locators_1.default.SIGN_USERNAME)).toBeEmpty();
        //
        await (0, test_1.expect)(this.page.locator(locators_1.default.SIGN_PASSWORD)).toBeVisible();
        await (0, test_1.expect)(this.page.locator(locators_1.default.SIGN_PASSWORD)).toBeEditable();
        await (0, test_1.expect)(this.page.locator(locators_1.default.SIGN_PASSWORD)).toBeEmpty();
    }
}
exports.default = SignUp;
