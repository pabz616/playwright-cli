"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
const api_helper_1 = require("./api-helper");
const testData_1 = __importDefault(require("../../utils/testData"));
// spec: tests/api/demoblaze-api-test-plan.md
// Happy Path Tests - Successful API operations
test_1.test.describe.serial("Demoblaze API - Happy Path Scenarios", () => {
    let api;
    let testUser;
    test_1.test.beforeAll(async ({ playwright }) => {
        const context = await playwright.request.newContext();
        api = new api_helper_1.DemoblazeAPI(context);
        testUser = {
            username: `testuser_${testData_1.default.ALPHA_NUM_STR}@test.com`,
            password: "TestPassword123!",
        };
    });
    (0, test_1.test)("Authentication - Successful user registration", async () => {
        const response = await api.signup(testUser);
        (0, test_1.expect)(response.success).toBe(true);
        (0, test_1.expect)(response.message).toContain("Successfully registered");
        (0, test_1.expect)(response.data).toHaveProperty("user_id");
    });
    (0, test_1.test)("Authentication - Successful user login", async () => {
        // Login with valid credentials
        const response = await api.login(testUser);
        (0, test_1.expect)(response.success).toBe(true);
        (0, test_1.expect)(response.message).toContain("Login successful");
        (0, test_1.expect)(response.data).toHaveProperty("token");
        (0, test_1.expect)(response.data).toHaveProperty("user_id");
        // Set auth token for subsequent requests
        api.setAuthToken(response.data.token, response.data.user_id);
    });
    (0, test_1.test)("Product Retrieval - Get all products", async () => {
        // Fetch all products from the catalog
        const response = await api.getProducts();
        (0, test_1.expect)(response.success).toBe(true);
        (0, test_1.expect)(Array.isArray(response.data)).toBe(true);
        (0, test_1.expect)(response.data.length).toBeGreaterThan(0);
        // Verify product structure
        response.data.forEach((product) => {
            (0, test_1.expect)(product).toHaveProperty("id");
            (0, test_1.expect)(product).toHaveProperty("title");
            (0, test_1.expect)(product).toHaveProperty("price");
            (0, test_1.expect)(product).toHaveProperty("category");
            (0, test_1.expect)(typeof product.price).toBe("number");
            (0, test_1.expect)(product.price).toBeGreaterThan(0);
        });
    });
    (0, test_1.test)("Product Retrieval - Get specific product details", async () => {
        // Get all products to identify a valid product ID
        const allProducts = await api.getProducts();
        const productId = allProducts.data[0].id;
        // Fetch specific product details
        const response = await api.getProductById(productId);
        (0, test_1.expect)(response.success).toBe(true);
        (0, test_1.expect)(response.data).toHaveProperty("id", productId);
        (0, test_1.expect)(response.data).toHaveProperty("title");
        (0, test_1.expect)(response.data).toHaveProperty("description");
        (0, test_1.expect)(response.data).toHaveProperty("price");
        (0, test_1.expect)(response.data).toHaveProperty("image");
    });
    (0, test_1.test)("Product Browsing - Filter products by category (Phones)", async () => {
        // Get products filtered by Phones category
        const response = await api.getProductsByCategory("phones");
        (0, test_1.expect)(response.success).toBe(true);
        (0, test_1.expect)(Array.isArray(response.data)).toBe(true);
        (0, test_1.expect)(response.data.length).toBeGreaterThan(0);
        // Verify all returned products are in correct category
        response.data.forEach((product) => {
            (0, test_1.expect)(product.category.toLowerCase()).toBe("phones");
        });
    });
    (0, test_1.test)("Product Browsing - Filter products by category (Laptops)", async () => {
        // Get products filtered by Laptops category
        const response = await api.getProductsByCategory("laptops");
        (0, test_1.expect)(response.success).toBe(true);
        (0, test_1.expect)(Array.isArray(response.data)).toBe(true);
        (0, test_1.expect)(response.data.length).toBeGreaterThan(0);
        response.data.forEach((product) => {
            (0, test_1.expect)(product.category.toLowerCase()).toBe("laptops");
        });
    });
    (0, test_1.test)("Shopping Cart - Add single product to cart", async () => {
        // Get a valid product ID
        const products = await api.getProducts();
        const productId = products.data[0].id;
        // Add product to cart
        const response = await api.addToCart(productId, 1);
        (0, test_1.expect)(response.success).toBe(true);
        (0, test_1.expect)(response.message).toContain("Added to cart");
        (0, test_1.expect)(response.data).toHaveProperty("cart_id");
    });
    (0, test_1.test)("Shopping Cart - Add multiple products to cart", async () => {
        const products = await api.getProducts();
        let response = await api.addToCart(products.data[0].id, 1);
        (0, test_1.expect)(response.success).toBe(true);
        response = await api.addToCart(products.data[1].id, 2);
        (0, test_1.expect)(response.success).toBe(true);
        // 4. Verify cart contains multiple items
        const cartResponse = await api.viewCart();
        (0, test_1.expect)(cartResponse.data.length).toBeGreaterThanOrEqual(2);
    });
    (0, test_1.test)("Shopping Cart - View cart contents", async () => {
        // View current cart
        const response = await api.viewCart();
        (0, test_1.expect)(response.success).toBe(true);
        (0, test_1.expect)(Array.isArray(response.data)).toBe(true);
        // Verify cart item structure
        if (response.data.length > 0) {
            response.data.forEach((item) => {
                (0, test_1.expect)(item).toHaveProperty("id");
                (0, test_1.expect)(item).toHaveProperty("product_id");
                (0, test_1.expect)(item).toHaveProperty("quantity");
                (0, test_1.expect)(item).toHaveProperty("title");
                (0, test_1.expect)(item).toHaveProperty("price");
                (0, test_1.expect)(typeof item.quantity).toBe("number");
                (0, test_1.expect)(item.quantity).toBeGreaterThan(0);
            });
        }
    });
    (0, test_1.test)("Shopping Cart - Remove product from cart", async () => {
        // View current cart to get item ID
        let cartResponse = await api.viewCart();
        if (cartResponse.data.length === 0) {
            // Add an item if cart is empty
            const products = await api.getProducts();
            await api.addToCart(products.data[0].id, 1);
            cartResponse = await api.viewCart();
        }
        const itemId = cartResponse.data[0].id;
        const initialCount = cartResponse.data.length;
        // Remove item from cart
        const response = await api.removeFromCart(itemId);
        (0, test_1.expect)(response.success).toBe(true);
        // Verify item was removed
        const updatedCart = await api.viewCart();
        (0, test_1.expect)(updatedCart.data.length).toBe(initialCount - 1);
    });
    (0, test_1.test)("Order - Place successful order", async () => {
        // Add products to cart
        const products = await api.getProducts();
        await api.addToCart(products.data[0].id, 1);
        await api.addToCart(products.data[1].id, 1);
        // Get cart items
        const cartResponse = await api.viewCart();
        (0, test_1.expect)(cartResponse.data.length).toBeGreaterThanOrEqual(2);
        // Place order
        const orderResponse = await api.placeOrder(cartResponse.data);
        (0, test_1.expect)(orderResponse.success).toBe(true);
        (0, test_1.expect)(orderResponse.message).toContain("Order placed successfully");
        (0, test_1.expect)(orderResponse.data).toHaveProperty("order_id");
        (0, test_1.expect)(orderResponse.data).toHaveProperty("total");
        (0, test_1.expect)(orderResponse.data.status).toBe("pending");
    });
    (0, test_1.test)("Order - Retrieve user orders", async () => {
        // Get user orders
        const response = await api.getOrders();
        (0, test_1.expect)(response.success).toBe(true);
        (0, test_1.expect)(Array.isArray(response.data)).toBe(true);
        // Verify order structure
        if (response.data.length > 0) {
            response.data.forEach((order) => {
                (0, test_1.expect)(order).toHaveProperty("id");
                (0, test_1.expect)(order).toHaveProperty("user_id");
                (0, test_1.expect)(order).toHaveProperty("items");
                (0, test_1.expect)(order).toHaveProperty("total");
                (0, test_1.expect)(order).toHaveProperty("status");
                (0, test_1.expect)(order).toHaveProperty("created_at");
            });
        }
    });
    (0, test_1.test)("User Profile - Get user profile", async () => {
        const response = await api.getProfile();
        (0, test_1.expect)(response.success).toBe(true);
        (0, test_1.expect)(response.data).toHaveProperty("user_id");
        (0, test_1.expect)(response.data).toHaveProperty("username");
        (0, test_1.expect)(response.data).toHaveProperty("email");
    });
    (0, test_1.test)("User Profile - Update user profile", async () => {
        // Update profile information
        const updatedData = {
            email: `${testData_1.default.NAME}@example.com`,
            phone: testData_1.default.PHONE,
        };
        const response = await api.updateProfile(updatedData);
        (0, test_1.expect)(response.success).toBe(true);
        (0, test_1.expect)(response.message).toContain("Profile updated");
        // Verify update by fetching profile again
        const profileResponse = await api.getProfile();
        (0, test_1.expect)(profileResponse.data.email).toBe(updatedData.email);
    });
});
