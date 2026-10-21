"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
const api_helper_1 = require("./api-helper");
const testData_1 = __importDefault(require("../../utils/testData"));
// spec: tests/api/demoblaze-api-test-plan.md
// Reliability Tests - Network failures, retries, and data consistency
test_1.test.describe("Demoblaze API - Reliability Tests", () => {
    let api;
    let authToken;
    let userId;
    test_1.test.beforeAll(async ({ playwright }) => {
        const context = await playwright.request.newContext();
        api = new api_helper_1.DemoblazeAPI(context);
        // Setup: Register and login
        const credentials = {
            username: `reliabilitytest_${testData_1.default.ALPHA_NUM_STR}@test.com`,
            password: "ReliabilityTest123!",
        };
        await api.signup(credentials);
        const loginResponse = await api.login(credentials);
        authToken = loginResponse.data.token;
        userId = loginResponse.data.user_id;
        api.setAuthToken(authToken, userId);
    });
    (0, test_1.test)("Reliability - API availability check (health endpoint)", async () => {
        // 1. Multiple calls to verify API is consistently available
        const calls = 5;
        const results = [];
        for (let i = 0; i < calls; i++) {
            const response = await api.getProducts();
            results.push(response.success);
        }
        // 2. All calls should succeed
        (0, test_1.expect)(results.every((r) => r === true)).toBe(true);
        console.log(`API availability: ${calls}/${calls} requests successful`);
    });
    (0, test_1.test)("Reliability - Handle network timeout gracefully", async () => {
        // 1. This test assumes the API handles timeouts gracefully
        // Attempting a long-running operation
        try {
            // Create a promise that simulates a timeout scenario
            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Request timeout")), 30000));
            const products = api.getProducts();
            const result = await Promise.race([products, timeoutPromise]);
            // 2. Should either succeed or fail gracefully
            (0, test_1.expect)(result).toBeDefined();
        }
        catch (error) {
            // Timeout error should be descriptive
            (0, test_1.expect)(error.message).toContain("timeout");
        }
    });
    (0, test_1.test)("Reliability - Data consistency after add to cart", async () => {
        // 1. Add product to cart
        const products = await api.getProducts();
        const productId = products.data[0].id;
        await api.addToCart(productId, 2);
        // 2. Verify cart is consistent across multiple reads
        const cart1 = await api.viewCart();
        const cart2 = await api.viewCart();
        // 3. Both reads should have same data
        (0, test_1.expect)(cart1.data.length).toBe(cart2.data.length);
        cart1.data.forEach((item, index) => {
            (0, test_1.expect)(item.id).toBe(cart2.data[index].id);
            (0, test_1.expect)(item.quantity).toBe(cart2.data[index].quantity);
        });
    });
    (0, test_1.test)("Reliability - Cart state persistence", async () => {
        // 1. Add items to cart
        const products = await api.getProducts();
        const product1 = products.data[0];
        const product2 = products.data[1];
        await api.addToCart(product1.id, 1);
        await api.addToCart(product2.id, 2);
        // 2. Wait a moment
        await new Promise((resolve) => setTimeout(resolve, 1000));
        // 3. Verify cart items are still there
        const cartResponse = await api.viewCart();
        (0, test_1.expect)(cartResponse.data.length).toBeGreaterThanOrEqual(2);
        // 4. Verify quantities are correct
        const item1 = cartResponse.data.find((i) => i.product_id === product1.id);
        const item2 = cartResponse.data.find((i) => i.product_id === product2.id);
        (0, test_1.expect)(item1).toBeDefined();
        (0, test_1.expect)(item2).toBeDefined();
        if (item2) {
            (0, test_1.expect)(item2.quantity).toBe(2);
        }
    });
    (0, test_1.test)("Reliability - Handle duplicate requests", async () => {
        // 1. Send identical requests rapidly
        const credentials = {
            username: `duptest_${testData_1.default.ALPHA_NUM_STR}@test.com`,
            password: "DupTest123!",
        };
        // 2. Send multiple identical signup requests
        const responses = [];
        try {
            responses.push(await api.signup(credentials));
            responses.push(await api.signup(credentials));
            responses.push(await api.signup(credentials));
        }
        catch {
            // Some may fail, which is acceptable
        }
        // 3. At least first should succeed, others should fail gracefully
        (0, test_1.expect)(responses[0].success).toBe(true);
        (0, test_1.expect)(responses[1].success).toBe(false);
        (0, test_1.expect)(responses[1].code).toBe("USER_EXISTS");
    });
    (0, test_1.test)("Reliability - Product data consistency", async () => {
        // 1. Get all products twice
        const products1 = await api.getProducts();
        await new Promise((resolve) => setTimeout(resolve, 500));
        const products2 = await api.getProducts();
        // 2. Both responses should have same number of products
        (0, test_1.expect)(products1.data.length).toBe(products2.data.length);
        // 3. Product data should be consistent
        products1.data.forEach((product, index) => {
            (0, test_1.expect)(product.id).toBe(products2.data[index].id);
            (0, test_1.expect)(product.title).toBe(products2.data[index].title);
            (0, test_1.expect)(product.price).toBe(products2.data[index].price);
        });
    });
    (0, test_1.test)("Reliability - Category filter consistency", async () => {
        // 1. Get phones category multiple times
        const responses = [];
        for (let i = 0; i < 3; i++) {
            responses.push(await api.getProductsByCategory("phones"));
            await new Promise((resolve) => setTimeout(resolve, 200));
        }
        // 2. All should return same products
        const firstProducts = responses[0].data.map((p) => p.id).sort();
        responses.forEach((response, index) => {
            if (index > 0) {
                const products = response.data.map((p) => p.id).sort();
                (0, test_1.expect)(products).toEqual(firstProducts);
            }
        });
    });
    (0, test_1.test)("Reliability - Error recovery after failed operation", async () => {
        // 1. Attempt invalid operation
        const invalidResponse = await api.getProductById(999999);
        (0, test_1.expect)(invalidResponse.success).toBe(false);
        // 2. Next valid operation should work without issues
        const validResponse = await api.getProducts();
        (0, test_1.expect)(validResponse.success).toBe(true);
        (0, test_1.expect)(validResponse.data.length).toBeGreaterThan(0);
    });
    (0, test_1.test)("Reliability - Remove and re-add to cart", async () => {
        // 1. Add product to cart
        const products = await api.getProducts();
        const productId = products.data[0].id;
        await api.addToCart(productId, 1);
        // 2. Get cart and find the item
        let cartResponse = await api.viewCart();
        const item = cartResponse.data.find((i) => i.product_id === productId);
        (0, test_1.expect)(item).toBeDefined();
        const itemId = item.id;
        // 3. Remove item
        const removeResponse = await api.removeFromCart(itemId);
        (0, test_1.expect)(removeResponse.success).toBe(true);
        // 4. Verify removed
        cartResponse = await api.viewCart();
        const removedItem = cartResponse.data.find((i) => i.product_id === productId);
        (0, test_1.expect)(removedItem).toBeUndefined();
        // 5. Re-add should work
        const reAddResponse = await api.addToCart(productId, 1);
        (0, test_1.expect)(reAddResponse.success).toBe(true);
        // 6. Verify it's back
        cartResponse = await api.viewCart();
        const readdedItem = cartResponse.data.find((i) => i.product_id === productId);
        (0, test_1.expect)(readdedItem).toBeDefined();
    });
    (0, test_1.test)("Reliability - Multiple sequential orders", async () => {
        // 1. Create and place multiple orders
        const orderIds = [];
        for (let i = 0; i < 2; i++) {
            // Add products
            const products = await api.getProducts();
            const randomProduct = products.data[Math.floor(Math.random() * products.data.length)];
            await api.addToCart(randomProduct.id, 1);
            // Get cart and place order
            const cartResponse = await api.viewCart();
            const orderResponse = await api.placeOrder(cartResponse.data);
            if (orderResponse.success) {
                orderIds.push(orderResponse.data.order_id);
                await new Promise((resolve) => setTimeout(resolve, 500));
            }
        }
        // 2. Verify orders were placed
        (0, test_1.expect)(orderIds.length).toBeGreaterThan(0);
        // 3. Retrieve orders and verify consistency
        const ordersResponse = await api.getOrders();
        (0, test_1.expect)(ordersResponse.data.length).toBeGreaterThanOrEqual(orderIds.length);
    });
    (0, test_1.test)("Reliability - Concurrent read operations", async () => {
        // 1. Execute multiple concurrent read operations
        const promises = [
            api.getProducts(),
            api.getProductsByCategory("phones"),
            api.viewCart(),
            api.getProfile(),
        ];
        const results = await Promise.all(promises);
        // 2. All should succeed
        results.forEach((result) => {
            (0, test_1.expect)(result.success).toBe(true);
        });
    });
    (0, test_1.test)("Reliability - Session persistence across operations", async () => {
        // 1. Perform multiple operations with same session
        const products = await api.getProducts();
        const product1 = products.data[0];
        const product2 = products.data[1];
        // 2. Add first product
        await api.addToCart(product1.id, 1);
        let cart = await api.viewCart();
        const firstCartSize = cart.data.length;
        // 3. Get profile (different operation)
        const profile = await api.getProfile();
        (0, test_1.expect)(profile.success).toBe(true);
        // 4. Add second product
        await api.addToCart(product2.id, 1);
        cart = await api.viewCart();
        // 5. Verify both items still in cart
        (0, test_1.expect)(cart.data.length).toBeGreaterThan(firstCartSize);
    });
    (0, test_1.test)("Reliability - Handle large responses gracefully", async () => {
        // 1. Get all products (potentially large response)
        const response = await api.getProducts();
        (0, test_1.expect)(response.success).toBe(true);
        (0, test_1.expect)(Array.isArray(response.data)).toBe(true);
        // 2. Verify all items are properly parsed
        response.data.forEach((product) => {
            (0, test_1.expect)(typeof product.id).toBe("number");
            (0, test_1.expect)(typeof product.title).toBe("string");
            (0, test_1.expect)(typeof product.price).toBe("number");
        });
    });
});
