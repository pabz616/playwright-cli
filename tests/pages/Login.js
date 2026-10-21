"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
const locators_1 = __importDefault(require("../pageElements/locators"));
class LoginForm {
    page;
    logInLink;
    logInModal;
    loginUsernameInput;
    loginPasswordInput;
    logInButton;
    nameOfUser;
    logOutButton;
    constructor(page) {
        this.page = page;
        this.logInLink = page.locator(locators_1.default.LOG_IN);
        this.logInModal = page.locator(locators_1.default.LOG_IN_MODAL);
        this.loginUsernameInput = page.locator(locators_1.default.LOGIN_USERNAME);
        this.loginPasswordInput = page.locator(locators_1.default.LOGIN_PASSWORD);
        this.logInButton = page.locator(locators_1.default.LOG_IN_BUTTON);
        this.nameOfUser = page.locator(locators_1.default.NAME_OF_USER);
        this.logOutButton = page.locator(locators_1.default.LOG_OUT_BUTTON);
    }
    async submitValidLogin(usn, pwd) {
        await this.logInLink.click();
        await this.loginUsernameInput.fill(usn);
        await this.loginPasswordInput.fill(pwd);
        await this.logInButton.click();
        await (0, test_1.expect)(this.nameOfUser).toBeVisible();
        await (0, test_1.expect)(this.nameOfUser).toHaveText(`Welcome ${usn}`);
        await (0, test_1.expect)(this.logOutButton).toBeVisible();
        //
        await this.logOutButton.click();
        await (0, test_1.expect)(this.logInLink).toBeVisible();
    }
    async submitLogInForm(usn, pwd) {
        await this.logInLink.click();
        await this.loginUsernameInput.fill(usn);
        await this.loginPasswordInput.fill(pwd);
        await this.logInButton.click();
    }
    async verifyLogInValidation() {
        await this.logInLink.click();
        await (0, test_1.expect)(this.logInModal).toBeVisible();
        await this.page.locator(locators_1.default.LOG_IN_BUTTON).click();
        await this.page.fill(locators_1.default.LOGIN_USERNAME, "not_a_user");
        await this.page.fill(locators_1.default.LOGIN_PASSWORD, "wrongpassword");
        await this.page.locator(locators_1.default.LOG_IN_BUTTON).click();
    }
}
exports.default = LoginForm;
