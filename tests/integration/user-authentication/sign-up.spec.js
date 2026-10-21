"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
const testData_1 = __importDefault(require("../../../utils/testData"));
const SignUp_1 = __importDefault(require("../../pages/SignUp"));
let onSignUpForm;
test_1.test.beforeEach(async ({ page }) => {
    await page.goto(testData_1.default.BASE_URL);
    await page.waitForSelector("#signin2");
    onSignUpForm = new SignUp_1.default(page);
});
test_1.test.afterEach(async ({ page }) => {
    await page.close();
});
test_1.test.describe("Demoblaze Product Store - User Account Creation", () => {
    (0, test_1.test)("Sign up validation", async ({ page }) => {
        await onSignUpForm.verifySignUpValidation();
    });
    (0, test_1.test)("Sign up", async ({ page }) => {
        await onSignUpForm.completeAndSubmitForm();
    });
});
