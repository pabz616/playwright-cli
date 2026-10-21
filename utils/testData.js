"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const faker_1 = require("@faker-js/faker");
exports.default = {
    BASE_URL: "https://www.demoblaze.com/",
    QAPLAYGROUND_NTWK: "https://playwright-playground.com/network/mocking",
    NAV_LINKS: ["Home", "Contact", "About us", "Cart", "Log in", "Sign up"],
    NAME: "Demo Tester: " + faker_1.faker.string.alphanumeric(3),
    EMAIL: faker_1.faker.internet.email(),
    PHONE: faker_1.faker.phone.number(),
    PRODUCT_CATEGORY1: "Phones",
    PRODUCT_CATEGORY2: "Laptops",
    PRODUCT_CATEGORY3: "Monitors",
    PRODUCT_CATEGORY4: "Tablets",
    COUNTRY: "USA",
    CITY: faker_1.faker.location.city(),
    CARD: faker_1.faker.finance.creditCardNumber(),
    MONTH: faker_1.faker.date.month({ context: true }),
    YEAR: "2026",
    ORDER_MSG: "Thank you for your purchase!",
    USN: "test",
    PWD: "test",
    ALPHA_NUM_STR: faker_1.faker.string.alphanumeric(10),
    CHAOS_USER: `chaos_user_${faker_1.faker.string.alphanumeric(8)}@test.com`,
    CHAOS_PWD: "ChaosTest123!",
};
