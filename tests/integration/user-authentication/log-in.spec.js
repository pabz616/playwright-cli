"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
const testData_1 = __importDefault(require("../../../utils/testData"));
const Login_1 = __importDefault(require("../../pages/Login"));
let onLoginForm;
test_1.test.beforeEach(async ({ page }) => {
    await page.goto(testData_1.default.BASE_URL);
    onLoginForm = new Login_1.default(page);
});
test_1.test.afterEach(async ({ page }) => {
    await page.close();
});
test_1.test.describe("Demoblaze Product Store - User authentication", () => {
    (0, test_1.test)("log in validation", async ({ page }) => {
        await onLoginForm.verifyLogInValidation();
    });
    (0, test_1.test)("Valid Login", async ({ page }) => {
        await onLoginForm.submitValidLogin(testData_1.default.USN, testData_1.default.PWD);
    });
    (0, test_1.test)("Blank Login", async ({ page }) => {
        await onLoginForm.submitLogInForm("", "");
        page.on("dialog", async (dialog) => {
            (0, test_1.expect)(dialog.message()).toBe("Please fill out Username and Password.");
            await dialog.accept();
        });
    });
    (0, test_1.test)("Blank Username", async ({ page }) => {
        await onLoginForm.submitLogInForm("", "test");
        page.on("dialog", async (dialog) => {
            (0, test_1.expect)(dialog.message()).toBe("Please fill out Username and Password.");
            await dialog.accept();
        });
    });
    (0, test_1.test)("Blank Password", async ({ page }) => {
        await onLoginForm.submitLogInForm("test", "");
        page.on("dialog", async (dialog) => {
            (0, test_1.expect)(dialog.message()).toBe("Wrong password.");
            await dialog.accept();
        });
    });
    (0, test_1.test)("Invalid Credentials", async ({ page }) => {
        await onLoginForm.submitLogInForm("tester", "tester");
        page.on("dialog", async (dialog) => {
            (0, test_1.expect)(dialog.message()).toBe("Invalid password.");
            await dialog.accept();
        });
    });
    (0, test_1.test)("Exposed Admin Credentials", async ({ page }) => {
        await onLoginForm.submitLogInForm("admin", "admin");
        page.on("dialog", async (dialog) => {
            (0, test_1.expect)(dialog.message()).toBe("Invalid password.");
            await dialog.accept();
        });
    });
    (0, test_1.test)("XSS Injection", async ({ page }) => {
        await onLoginForm.submitLogInForm("<script>alert('XSS Test')</script>", "passphrase");
        page.on("dialog", async (dialog) => {
            (0, test_1.expect)(dialog.message()).toBe("User does not exist.");
            await dialog.accept();
        });
    });
    (0, test_1.test)("SQL Injection", async ({ page }) => {
        await onLoginForm.submitLogInForm("' OR '1'='1", "' OR '1'='1");
        page.on("dialog", async (dialog) => {
            (0, test_1.expect)(dialog.message()).toBe("User does not exist.");
            await dialog.accept();
        });
    });
});
