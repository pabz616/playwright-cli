"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.API_TEST_DATA = void 0;
exports.generateValidUser = generateValidUser;
exports.generateInvalidCredentials = generateInvalidCredentials;
exports.generateRandomCart = generateRandomCart;
exports.generateBillingInfo = generateBillingInfo;
exports.generateLoadTestData = generateLoadTestData;
exports.assertApiResponseStructure = assertApiResponseStructure;
exports.retryApiCall = retryApiCall;
exports.measureResponseTime = measureResponseTime;
exports.generateConcurrentRequests = generateConcurrentRequests;
/**
 * API Test Data and Utilities
 * Provides test data generators and helper utilities for Demoblaze API testing
 */
const testData_1 = __importDefault(require("../../utils/testData"));
exports.API_TEST_DATA = {
    // Valid test credentials
    VALID_USER: {
        username: testData_1.default.USN,
        password: testData_1.default.PWD,
        email: testData_1.default.EMAIL,
    },
    // Invalid credentials for negative testing
    INVALID_USERS: [
        {
            username: "",
            password: "",
            description: "Empty credentials",
        },
        {
            username: "onlyusername",
            password: "",
            description: "Missing password",
        },
        {
            username: "",
            password: "onlypassword",
            description: "Missing username",
        },
        {
            username: "a",
            password: "123",
            description: "Very short credentials",
        },
    ],
    // SQL Injection payloads
    SQL_INJECTION_PAYLOADS: [
        "' OR '1'='1",
        "admin' --",
        "'; DROP TABLE users; --",
        "' UNION SELECT * FROM users --",
        "1' AND '1'='1",
    ],
    // XSS payloads
    XSS_PAYLOADS: [
        '<script>alert("xss")</script>',
        "<img src=x onerror=\"alert('xss')\">",
        'javascript:alert("xss")',
        '<svg onload=alert("xss")>',
        "<iframe src=\"javascript:alert('xss')\"></iframe>",
    ],
    // Command injection payloads
    COMMAND_INJECTION_PAYLOADS: [
        "; rm -rf /",
        "| cat /etc/passwd",
        "` whoami `",
        "$(whoami)",
        "&&dir",
    ],
    // Path traversal payloads
    PATH_TRAVERSAL_PAYLOADS: [
        "../../etc/passwd",
        "..\\..\\windows\\system32",
        "/../../api/admin",
        "%2e%2e%2fadmin",
    ],
    // Product categories
    PRODUCT_CATEGORIES: ["phones", "laptops", "monitors"],
    // Billing information
    BILLING_INFO: {
        name: "Test User",
        country: "USA",
        city: "Test City",
        card: "4111111111111111", // Valid test card number
        month: "12",
        year: "2026",
    },
    // Performance thresholds
    PERFORMANCE_THRESHOLDS: {
        PRODUCTS_LIST: 2000, // 2 second SLA
        SINGLE_PRODUCT: 1500, // 1.5 second SLA
        LOGIN: 1000, // 1 second SLA
        ADD_TO_CART: 800, // 800ms SLA
        PLACE_ORDER: 2500, // 2.5 second SLA
        FILTER_PRODUCTS: 1800, // 1.8 second SLA
    },
};
/**
 * Generate random valid user credentials
 */
function generateValidUser() {
    return {
        username: `user_${testData_1.default.ALPHA_NUM_STR}@test.com`,
        password: `Pass${testData_1.default.ALPHA_NUM_STR}!@`,
        email: testData_1.default.EMAIL,
    };
}
/**
 * Generate invalid credentials for testing
 */
function generateInvalidCredentials() {
    const type = Math.floor(Math.random() * 4);
    switch (type) {
        case 0:
            return { username: "", password: "" };
        case 1:
            return { username: "user", password: "" };
        case 2:
            return { username: "", password: "pass" };
        default:
            return { username: "a", password: "123" };
    }
}
/**
 * Generate random product cart
 */
function generateRandomCart(productCount = 3) {
    return Array.from({ length: productCount }, (_, i) => ({
        id: i + 1,
        product_id: Math.floor(Math.random() * 100) + 1,
        quantity: Math.floor(Math.random() * 5) + 1,
        title: `Product ${i + 1}`,
        price: Math.random() * 1000,
    }));
}
/**
 * Generate random billing information
 */
function generateBillingInfo() {
    return {
        name: faker.person.fullName(),
        country: faker.location.country(),
        city: faker.location.city(),
        card: faker.finance.creditCardNumber("####-####-####-####"),
        month: String(Math.floor(Math.random() * 12) + 1).padStart(2, "0"),
        year: String(new Date().getFullYear() + Math.floor(Math.random() * 10)),
    };
}
/**
 * Generate load test data
 */
function generateLoadTestData(concurrentRequests) {
    return {
        requestCount: concurrentRequests,
        rampUpTime: 10000, // 10 seconds
        sustainTime: 30000, // 30 seconds
        expectedThroughput: concurrentRequests / 10, // requests per second
    };
}
/**
 * Assert API response structure
 */
function assertApiResponseStructure(response, expectSuccess = true) {
    expect(response).toHaveProperty("success");
    if (expectSuccess) {
        expect(response.success).toBe(true);
        expect(response).toHaveProperty("data");
    }
    else {
        expect(response.success).toBe(false);
        expect(response).toHaveProperty("error");
        expect(response).toHaveProperty("code");
    }
}
/**
 * Retry failed API calls
 */
async function retryApiCall(apiCall, maxRetries = 3, delayMs = 1000) {
    let lastError = null;
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await apiCall();
        }
        catch (error) {
            lastError = error;
            if (i < maxRetries - 1) {
                await new Promise((resolve) => setTimeout(resolve, delayMs));
            }
        }
    }
    throw lastError || new Error("API call failed after retries");
}
/**
 * Measure API response time
 */
async function measureResponseTime(apiCall) {
    const startTime = Date.now();
    const response = await apiCall();
    const duration = Date.now() - startTime;
    return { response, duration };
}
/**
 * Generate concurrent API requests
 */
function generateConcurrentRequests(apiCall, count) {
    const requests = [];
    for (let i = 0; i < count; i++) {
        requests.push(apiCall());
    }
    return Promise.all(requests);
}
exports.default = {
    API_TEST_DATA: exports.API_TEST_DATA,
    generateValidUser,
    generateInvalidCredentials,
    generateRandomCart,
    generateBillingInfo,
    generateLoadTestData,
    assertApiResponseStructure,
    retryApiCall,
    measureResponseTime,
    generateConcurrentRequests,
};
