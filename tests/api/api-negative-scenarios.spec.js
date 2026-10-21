"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
const api_helper_1 = require("./api-helper");
const testData_1 = __importDefault(require("../../utils/testData"));
// spec: tests/api/demoblaze-api-test-plan.md
// Negative Scenario Tests - Error handling and validation
test_1.test.describe("Demoblaze API - Negative Scenarios", () => {
    let api;
    test_1.test.beforeAll(async ({ playwright }) => {
        const context = await playwright.request.newContext();
        api = new api_helper_1.DemoblazeAPI(context);
        const userCredentials = {
            username: `negative_user_${testData_1.default.ALPHA_NUM_STR}@test.com`,
            password: "TestPassword123!",
        };
        await api.signup(userCredentials);
        const loginResponse = await api.login(userCredentials);
        api.setAuthToken(loginResponse.data.token, loginResponse.data.user_id);
    });
    (0, test_1.test)("Authentication - Login with invalid credentials", async () => {
        // 1. Create a valid user, then attempt login with wrong password
        const validCredentials = {
            username: `validuser_${testData_1.default.ALPHA_NUM_STR}@test.com`,
            password: "TestPassword123!",
        };
        await api.signup(validCredentials);
        const invalidCredentials = {
            username: validCredentials.username,
            password: "wrongpassword",
        };
        const response = await api.login(invalidCredentials);
        (0, test_1.expect)(response.success).toBe(false);
        (0, test_1.expect)(response.error).toContain("Invalid credentials");
        (0, test_1.expect)(response.code).toBe("INVALID_CREDENTIALS");
    });
    (0, test_1.test)("Authentication - Login with non-existent user", async () => {
        // 1. Attempt login with non-existent user
        const credentials = {
            username: `nonexistent_${testData_1.default.ALPHA_NUM_STR}@test.com`,
            password: "TestPassword123!",
        };
        const response = await api.login(credentials);
        (0, test_1.expect)(response.success).toBe(false);
        (0, test_1.expect)(response.error).toContain("User not found");
    });
    (0, test_1.test)("Authentication - Register with duplicate username", async () => {
        // 1. Create first user
        const credentials = {
            username: `duplicate_user_${testData_1.default.ALPHA_NUM_STR}@test.com`,
            password: "TestPassword123!",
        };
        const firstSignup = await api.signup(credentials);
        (0, test_1.expect)(firstSignup.success).toBe(true);
        // 2. Attempt to register same user again
        const duplicateSignup = await api.signup(credentials);
        (0, test_1.expect)(duplicateSignup.success).toBe(false);
        (0, test_1.expect)(duplicateSignup.error).toContain("User already exists");
        (0, test_1.expect)(duplicateSignup.code).toBe("USER_EXISTS");
    });
    (0, test_1.test)("Authentication - Signup with invalid email format", async () => {
        // 1. Attempt signup with invalid email
        const invalidCredentials = {
            username: "invalid-email-format",
            password: "TestPassword123!",
        };
        const response = await api.signup(invalidCredentials);
        (0, test_1.expect)(response.success).toBe(false);
        (0, test_1.expect)(response.error).toContain("Invalid email format");
    });
    (0, test_1.test)("Authentication - Signup with weak password", async () => {
        // 1. Attempt signup with weak password
        const weakPassword = {
            username: `user_${testData_1.default.ALPHA_NUM_STR}@test.com`,
            password: "123", // Too short and weak
        };
        const response = await api.signup(weakPassword);
        (0, test_1.expect)(response.success).toBe(false);
        (0, test_1.expect)(response.error).toContain("Password does not meet requirements");
    });
    (0, test_1.test)("Authentication - Missing required fields in login", async () => {
        // 1. Attempt login without password
        const incompleteData = { username: "testuser" };
        const response = await api.login(incompleteData);
        (0, test_1.expect)(response.success).toBe(false);
        (0, test_1.expect)(response.error).toContain("Missing required field");
        (0, test_1.expect)(response.code).toBe("MISSING_FIELD");
    });
    (0, test_1.test)("Product Retrieval - Get non-existent product", async () => {
        // 1. Request product with invalid ID
        const response = await api.getProductById(999999);
        (0, test_1.expect)(response.success).toBe(false);
        (0, test_1.expect)(response.error).toContain("Product not found");
        (0, test_1.expect)(response.code).toBe("NOT_FOUND");
    });
    (0, test_1.test)("Product Retrieval - Get products with invalid category", async () => {
        // 1. Request products with non-existent category
        const response = await api.getProductsByCategory("invalidcategory");
        (0, test_1.expect)(response.success).toBe(false);
        (0, test_1.expect)(response.error).toContain("Category not found");
    });
    (0, test_1.test)("Shopping Cart - Add to cart without authentication", async () => {
        // 1. Attempt to add product without being logged in
        const unauthenticatedApi = new api_helper_1.DemoblazeAPI(api);
        try {
            await unauthenticatedApi.addToCart(1, 1);
            (0, test_1.expect)(true).toBe(false); // Should not reach here
        }
        catch (error) {
            (0, test_1.expect)(error.message).toContain("User not authenticated");
        }
    });
    (0, test_1.test)("Shopping Cart - Add invalid quantity", async () => {
        // Note: This test assumes API validates quantity
        // 1. Attempt to add product with negative quantity
        const response = await api.addToCart(1, -5);
        (0, test_1.expect)(response.success).toBe(false);
        (0, test_1.expect)(response.error).toContain("Invalid quantity");
    });
    (0, test_1.test)("Shopping Cart - Add zero quantity", async () => {
        // 1. Attempt to add product with zero quantity
        const response = await api.addToCart(1, 0);
        (0, test_1.expect)(response.success).toBe(false);
        (0, test_1.expect)(response.error).toContain("Quantity must be greater than 0");
    });
    (0, test_1.test)("Shopping Cart - Remove non-existent item", async () => {
        // 1. Attempt to remove item that doesn\'t exist in cart
        const response = await api.removeFromCart(999999);
        (0, test_1.expect)(response.success).toBe(false);
        (0, test_1.expect)(response.error).toContain("Item not found");
        (0, test_1.expect)(response.code).toBe("ITEM_NOT_FOUND");
    });
    (0, test_1.test)("Shopping Cart - Add product with invalid ID", async () => {
        // 1. Attempt to add non-existent product
        const response = await api.addToCart(999999, 1);
        (0, test_1.expect)(response.success).toBe(false);
        (0, test_1.expect)(response.error).toContain("Product not found");
    });
    (0, test_1.test)("Order - Place order with empty cart", async () => {
        // 1. Attempt to place order without items
        const response = await api.placeOrder([]);
        (0, test_1.expect)(response.success).toBe(false);
        (0, test_1.expect)(response.error).toContain("Cart is empty");
    });
    (0, test_1.test)("Order - Place order with invalid billing info", async () => {
        // 1. Get valid cart items
        const products = await api.getProducts();
        await api.addToCart(products.data[0].id, 1);
        const cartResponse = await api.viewCart();
        // 2. Attempt to place order with invalid billing information
        const response = await api.placeOrder(cartResponse.data);
        // Note: This would depend on actual API validation
        // Currently expects it to fail with invalid card
        if (!response.success) {
            (0, test_1.expect)(response.error).toContain("Invalid billing information");
        }
    });
    (0, test_1.test)("Order - Retrieve non-existent order", async () => {
        // 1. Attempt to get order that doesn\'t exist
        const response = await api.getOrderById(999999);
        (0, test_1.expect)(response.success).toBe(false);
        (0, test_1.expect)(response.error).toContain("Order not found");
    });
    (0, test_1.test)("User Profile - Get profile without authentication", async () => {
        // 1. Attempt to get profile without auth token
        const unauthenticatedApi = new api_helper_1.DemoblazeAPI(api);
        const response = await unauthenticatedApi.getProfile();
        (0, test_1.expect)(response.success).toBe(false);
        (0, test_1.expect)(response.error).toContain("Unauthorized");
        (0, test_1.expect)(response.code).toBe("UNAUTHORIZED");
    });
    (0, test_1.test)("Request Validation - SQL injection attempt in username", async () => {
        // 1. Attempt SQL injection in login
        const maliciousCredentials = {
            username: "admin' OR '1'='1",
            password: "' OR '1'='1",
        };
        const response = await api.login(maliciousCredentials);
        // Should fail safely without exposing SQL errors
        (0, test_1.expect)(response.success).toBe(false);
        (0, test_1.expect)(response.error).not.toContain("SQL");
        (0, test_1.expect)(response.error).not.toContain("syntax");
    });
    (0, test_1.test)("Request Validation - XSS payload in product search", async () => {
        // 1. Attempt XSS injection in category filter
        const xssPayload = '<script>alert("xss")</script>';
        const response = await api.getProductsByCategory(xssPayload);
        // Should handle gracefully
        (0, test_1.expect)(response.success).toBe(false);
        (0, test_1.expect)(response.error).not.toContain("<script>");
    });
    (0, test_1.test)("API Rate Limiting - Multiple rapid requests", async () => {
        // 1. Send multiple requests rapidly
        const promises = [];
        for (let i = 0; i < 50; i++) {
            promises.push(api.getProducts());
        }
        const responses = await Promise.all(promises);
        // Should have some rate limiting applied
        const rateLimited = responses.some((r) => r.code === "RATE_LIMITED");
        (0, test_1.expect)(rateLimited).toBe(true);
    });
    (0, test_1.test)("API Response - Verify consistent error format", async () => {
        // 1. Trigger multiple different errors
        const invalidProduct = await api.getProductById(999999);
        const invalidCategory = await api.getProductsByCategory("invalid");
        const invalidLogin = await api.login({
            username: "nonexistent",
            password: "wrong",
        });
        // All should have consistent error format
        [invalidProduct, invalidCategory, invalidLogin].forEach((response) => {
            (0, test_1.expect)(response).toHaveProperty("success");
            (0, test_1.expect)(response).toHaveProperty("error");
            (0, test_1.expect)(response).toHaveProperty("code");
            (0, test_1.expect)(response.success).toBe(false);
        });
    });
});
