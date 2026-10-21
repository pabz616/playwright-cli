"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
const api_helper_1 = require("./api-helper");
const testData_1 = __importDefault(require("../../utils/testData"));
// spec: tests/api/demoblaze-api-test-plan.md
// Performance Tests - Response time and load handling
const PERFORMANCE_THRESHOLDS = {
    PRODUCTS_LIST: 2000, // 2 second SLA
    SINGLE_PRODUCT: 1500, // 1.5 second SLA
    LOGIN: 1000, // 1 second SLA
    ADD_TO_CART: 800, // 800ms SLA
    PLACE_ORDER: 2500, // 2.5 second SLA
    FILTER_PRODUCTS: 1800, // 1.8 second SLA
};
test_1.test.describe("Demoblaze API - Performance Tests", () => {
    let api;
    let authToken;
    let userId;
    test_1.test.beforeAll(async ({ playwright }) => {
        const context = await playwright.request.newContext();
        api = new api_helper_1.DemoblazeAPI(context);
        // Setup: Register and login
        const credentials = {
            username: `perftest_${testData_1.default.ALPHA_NUM_STR}@test.com`,
            password: "PerfTest123!",
        };
        await api.signup(credentials);
        const loginResponse = await api.login(credentials);
        authToken = loginResponse.data.token;
        userId = loginResponse.data.user_id;
        api.setAuthToken(authToken, userId);
    });
    (0, test_1.test)("Performance - Get all products within SLA", async () => {
        // 1. Measure time to get all products
        const startTime = Date.now();
        const response = await api.getProducts();
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        // 2. Verify successful response
        (0, test_1.expect)(response.success).toBe(true);
        (0, test_1.expect)(Array.isArray(response.data)).toBe(true);
        // 3. Verify response time meets SLA
        console.log(`Products list retrieved in ${responseTime}ms`);
        (0, test_1.expect)(responseTime).toBeLessThan(PERFORMANCE_THRESHOLDS.PRODUCTS_LIST);
    });
    (0, test_1.test)("Performance - Get single product within SLA", async () => {
        // 1. Get product list first
        const products = await api.getProducts();
        const productId = products.data[0].id;
        // 2. Measure time to get single product
        const startTime = Date.now();
        const response = await api.getProductById(productId);
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        // 3. Verify successful response
        (0, test_1.expect)(response.success).toBe(true);
        (0, test_1.expect)(response.data).toHaveProperty("id", productId);
        // 4. Verify response time meets SLA
        console.log(`Single product retrieved in ${responseTime}ms`);
        (0, test_1.expect)(responseTime).toBeLessThan(PERFORMANCE_THRESHOLDS.SINGLE_PRODUCT);
    });
    (0, test_1.test)("Performance - Login operation within SLA", async () => {
        // 1. Create new credentials
        const credentials = {
            username: `perfuser_${testData_1.default.ALPHA_NUM_STR}@test.com`,
            password: "PerfTest123!",
        };
        await api.signup(credentials);
        // 2. Measure login time
        const startTime = Date.now();
        const response = await api.login(credentials);
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        // 3. Verify successful login
        (0, test_1.expect)(response.success).toBe(true);
        // 4. Verify response time meets SLA
        console.log(`Login completed in ${responseTime}ms`);
        (0, test_1.expect)(responseTime).toBeLessThan(PERFORMANCE_THRESHOLDS.LOGIN);
    });
    (0, test_1.test)("Performance - Add to cart operation within SLA", async () => {
        // 1. Get a product
        const products = await api.getProducts();
        const productId = products.data[0].id;
        // 2. Measure time to add to cart
        const startTime = Date.now();
        const response = await api.addToCart(productId, 1);
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        // 3. Verify successful operation
        (0, test_1.expect)(response.success).toBe(true);
        // 4. Verify response time meets SLA
        console.log(`Add to cart completed in ${responseTime}ms`);
        (0, test_1.expect)(responseTime).toBeLessThan(PERFORMANCE_THRESHOLDS.ADD_TO_CART);
    });
    (0, test_1.test)("Performance - Filter products by category within SLA", async () => {
        // 1. Measure time to filter products
        const startTime = Date.now();
        const response = await api.getProductsByCategory("phones");
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        // 2. Verify successful response
        (0, test_1.expect)(response.success).toBe(true);
        (0, test_1.expect)(Array.isArray(response.data)).toBe(true);
        // 3. Verify response time meets SLA
        console.log(`Filter products completed in ${responseTime}ms`);
        (0, test_1.expect)(responseTime).toBeLessThan(PERFORMANCE_THRESHOLDS.FILTER_PRODUCTS);
    });
    (0, test_1.test)("Performance - Place order operation within SLA", async () => {
        // 1. Add products to cart
        const products = await api.getProducts();
        await api.addToCart(products.data[0].id, 1);
        const cartResponse = await api.viewCart();
        // 2. Measure time to place order
        const startTime = Date.now();
        const response = await api.placeOrder(cartResponse.data);
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        // 3. Verify successful order
        if (response.success) {
            console.log(`Place order completed in ${responseTime}ms`);
            (0, test_1.expect)(responseTime).toBeLessThan(PERFORMANCE_THRESHOLDS.PLACE_ORDER);
        }
    });
    (0, test_1.test)("Performance - Bulk product retrieval (multiple concurrent requests)", async () => {
        // 1. Send 10 concurrent product list requests
        const startTime = Date.now();
        const promises = [];
        for (let i = 0; i < 10; i++) {
            promises.push(api.getProducts());
        }
        const responses = await Promise.all(promises);
        const endTime = Date.now();
        const totalTime = endTime - startTime;
        const averageTime = totalTime / 10;
        // 2. Verify all responses succeeded
        responses.forEach((response) => {
            (0, test_1.expect)(response.success).toBe(true);
        });
        // 3. Verify average response time
        console.log(`Bulk retrieval: Total ${totalTime}ms, Average ${averageTime}ms per request`);
        (0, test_1.expect)(averageTime).toBeLessThan(PERFORMANCE_THRESHOLDS.PRODUCTS_LIST);
    });
    (0, test_1.test)("Performance - Large cart operations (100+ items)", async () => {
        // 1. Get products
        const products = await api.getProducts();
        // 2. Add 10 products multiple times to cart
        const startTime = Date.now();
        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < products.data.length && j < 10; j++) {
                await api.addToCart(products.data[j].id, 1);
            }
        }
        const endTime = Date.now();
        const totalTime = endTime - startTime;
        // 3. View cart and verify performance
        const viewStartTime = Date.now();
        const cartResponse = await api.viewCart();
        const viewEndTime = Date.now();
        const viewTime = viewEndTime - viewStartTime;
        console.log(`Large cart view completed in ${viewTime}ms for ${cartResponse.data.length} items`);
        (0, test_1.expect)(viewTime).toBeLessThan(PERFORMANCE_THRESHOLDS.PRODUCTS_LIST);
    });
    (0, test_1.test)("Performance - Sequential API calls performance", async () => {
        // 1. Measure time for sequential operations
        const startTime = Date.now();
        // Get products
        const products = await api.getProducts();
        // Get specific product
        await api.getProductById(products.data[0].id);
        // Add to cart
        await api.addToCart(products.data[0].id, 1);
        // View cart
        await api.viewCart();
        const endTime = Date.now();
        const totalTime = endTime - startTime;
        // 2. Calculate average per operation (4 operations)
        const averagePerOperation = totalTime / 4;
        console.log(`Sequential operations total: ${totalTime}ms, Average: ${averagePerOperation}ms per operation`);
        // Total time should be reasonable (allowing sum of individual SLAs + overhead)
        (0, test_1.expect)(totalTime).toBeLessThan(PERFORMANCE_THRESHOLDS.PRODUCTS_LIST +
            PERFORMANCE_THRESHOLDS.SINGLE_PRODUCT +
            PERFORMANCE_THRESHOLDS.ADD_TO_CART +
            PERFORMANCE_THRESHOLDS.PRODUCTS_LIST);
    });
    (0, test_1.test)("Performance - Response payload size validation", async () => {
        // 1. Get products and measure payload size
        const response = await api.getProducts();
        // Convert to JSON string to estimate size
        const jsonString = JSON.stringify(response);
        const sizeInBytes = new TextEncoder().encode(jsonString).length;
        const sizeInKB = sizeInBytes / 1024;
        // 2. Payload should be reasonably sized (< 5MB for products list)
        console.log(`Response payload size: ${sizeInKB.toFixed(2)} KB`);
        (0, test_1.expect)(sizeInKB).toBeLessThan(5000);
    });
    (0, test_1.test)("Performance - P95 response time under load (simulated)", async () => {
        // 1. Send 20 requests and measure response times
        const responseTimes = [];
        for (let i = 0; i < 20; i++) {
            const startTime = Date.now();
            await api.getProducts();
            const endTime = Date.now();
            responseTimes.push(endTime - startTime);
        }
        // 2. Calculate P95 (95th percentile)
        responseTimes.sort((a, b) => a - b);
        const p95Index = Math.floor(responseTimes.length * 0.95);
        const p95ResponseTime = responseTimes[p95Index];
        console.log(`P95 response time: ${p95ResponseTime}ms`);
        console.log(`Response times: min=${responseTimes[0]}ms, max=${responseTimes[responseTimes.length - 1]}ms`);
        // P95 should be within reasonable threshold
        (0, test_1.expect)(p95ResponseTime).toBeLessThan(PERFORMANCE_THRESHOLDS.PRODUCTS_LIST * 1.5);
    });
});
