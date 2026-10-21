"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategorySelector = getCategorySelector;
exports.isValidCategory = isValidCategory;
exports.buildWelcomeText = buildWelcomeText;
exports.isValidSignUpInput = isValidSignUpInput;
exports.normalizeContactMessage = normalizeContactMessage;
const testData_1 = __importDefault(require("../../utils/testData"));
function getCategorySelector(category) {
    switch (category) {
        case 'Phones':
            return testData_1.default.PRODUCT_CATEGORY1;
        case 'Laptops':
            return testData_1.default.PRODUCT_CATEGORY2;
        case 'Monitors':
            return testData_1.default.PRODUCT_CATEGORY3;
        default:
            throw new Error(`Unknown category: ${category}`);
    }
}
function isValidCategory(category) {
    return category === 'Phones' || category === 'Laptops' || category === 'Monitors';
}
function buildWelcomeText(username) {
    return `Welcome ${username}`;
}
function isValidSignUpInput(username, password) {
    return username.trim().length > 0 && password.length >= 8;
}
function normalizeContactMessage(message) {
    return message.trim();
}
