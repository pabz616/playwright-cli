"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
const testData_1 = __importDefault(require("../../utils/testData"));
const unittest_helpers_1 = require("./unittest-helpers");
test_1.test.describe("Demoblaze Product Store Test Data Config", () => {
    (0, test_1.test)("Assert the expected base URL and credentials", () => {
        (0, test_1.expect)(testData_1.default.BASE_URL).toBe("https://www.demoblaze.com/");
    });
    (0, test_1.test)("Verify the credentials", () => {
        (0, test_1.expect)(testData_1.default.USN).toBe("test");
        (0, test_1.expect)(testData_1.default.PWD).toBe("test");
    });
    (0, test_1.test)("Confirm the creation of a demo user name in the expected format", () => {
        (0, test_1.expect)(testData_1.default.NAME).toMatch(/^Demo Tester: [A-Za-z0-9]{3}$/);
    });
    (0, test_1.test)("Confirms valid categories", () => {
        (0, test_1.expect)((0, unittest_helpers_1.getCategorySelector)("Phones")).toContain(testData_1.default.PRODUCT_CATEGORY1);
        (0, test_1.expect)((0, unittest_helpers_1.getCategorySelector)("Laptops")).toContain(testData_1.default.PRODUCT_CATEGORY2);
        (0, test_1.expect)((0, unittest_helpers_1.getCategorySelector)("Monitors")).toContain(testData_1.default.PRODUCT_CATEGORY3);
    });
    (0, test_1.test)("Rejects unknown categories", () => {
        (0, test_1.expect)(() => (0, unittest_helpers_1.getCategorySelector)("Tablets")).toThrow("Unknown category");
        (0, test_1.expect)((0, unittest_helpers_1.isValidCategory)(testData_1.default.PRODUCT_CATEGORY1)).toBe(true);
        (0, test_1.expect)((0, unittest_helpers_1.isValidCategory)(testData_1.default.PRODUCT_CATEGORY4)).toBe(false);
    });
    (0, test_1.test)("Confirm the expected welcome text after login", () => {
        (0, test_1.expect)((0, unittest_helpers_1.buildWelcomeText)("tester")).toBe("Welcome tester");
    });
    (0, test_1.test)("Confirm home page navigation and main site links", () => {
        (0, test_1.expect)(testData_1.default.NAV_LINKS[0]).toBe("Home");
        (0, test_1.expect)(testData_1.default.NAV_LINKS[1]).toContain("Contact");
        (0, test_1.expect)(testData_1.default.NAV_LINKS[2]).toContain("About us");
        (0, test_1.expect)(testData_1.default.NAV_LINKS[3]).toContain("Cart");
        (0, test_1.expect)(testData_1.default.NAV_LINKS[4]).toContain("Log in");
        (0, test_1.expect)(testData_1.default.NAV_LINKS[5]).toBe("Sign up");
    });
    (0, test_1.test)("Confirm category selectors for the product filters", () => {
        (0, test_1.expect)(testData_1.default.PRODUCT_CATEGORY1).toBe("Phones");
        (0, test_1.expect)(testData_1.default.PRODUCT_CATEGORY2).toBe("Laptops");
        (0, test_1.expect)(testData_1.default.PRODUCT_CATEGORY3).toBe("Monitors");
    });
    (0, test_1.test)("Confirm sign-up input validation", () => {
        (0, test_1.expect)((0, unittest_helpers_1.isValidSignUpInput)("demo", "Password123")).toBe(true);
        (0, test_1.expect)((0, unittest_helpers_1.isValidSignUpInput)("", "Password123")).toBe(false);
        (0, test_1.expect)((0, unittest_helpers_1.isValidSignUpInput)("demo", "short")).toBe(false);
    });
    (0, test_1.test)("Confirm purchase metadata", () => {
        (0, test_1.expect)(testData_1.default.ORDER_MSG).toBe("Thank you for your purchase!");
        (0, test_1.expect)(testData_1.default.YEAR).toBe("2026");
        (0, test_1.expect)(testData_1.default.MONTH.length).toBeGreaterThan(0);
        (0, test_1.expect)(testData_1.default.CARD).toMatch(/^[0-9-]+$/);
    });
    (0, test_1.test)("normalizes contact messages by trimming whitespace", () => {
        (0, test_1.expect)((0, unittest_helpers_1.normalizeContactMessage)("  hello from demoblaze  ")).toBe("hello from demoblaze");
    });
});
