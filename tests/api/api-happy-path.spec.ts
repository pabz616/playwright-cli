import { test, expect } from "@playwright/test";
import { DemoblazeAPI, AuthCredentials } from "./api-helper";
import testData from "../../utils/testData";

// spec: tests/api/demoblaze-api-test-plan.md
// Happy Path Tests - Successful API operations

test.describe.serial("Demoblaze API - Happy Path Scenarios", () => {
  let api: DemoblazeAPI;
  let testUser: AuthCredentials;

  test.beforeAll(async ({ playwright }) => {
    const context = await playwright.request.newContext();
    api = new DemoblazeAPI(context);
    testUser = {
      username: `testuser_${testData.ALPHA_NUM_STR}@test.com`,
      password: "TestPassword123!",
    };
  });

  test("Authentication - Successful user registration", async () => {
    const response = await api.signup(testUser);

    expect(response.success).toBe(true);
    expect(response.message).toContain("Successfully registered");
    expect(response.data).toHaveProperty("user_id");
  });

  test("Authentication - Successful user login", async () => {
    // Login with valid credentials
    const response = await api.login(testUser);

    expect(response.success).toBe(true);
    expect(response.message).toContain("Login successful");
    expect(response.data).toHaveProperty("token");
    expect(response.data).toHaveProperty("user_id");

    // Set auth token for subsequent requests
    api.setAuthToken(response.data.token, response.data.user_id);
  });

  test("Product Retrieval - Get all products", async () => {
    // Fetch all products from the catalog
    const response = await api.getProducts();

    expect(response.success).toBe(true);
    expect(Array.isArray(response.data)).toBe(true);
    expect(response.data.length).toBeGreaterThan(0);

    // Verify product structure
    response.data.forEach((product) => {
      expect(product).toHaveProperty("id");
      expect(product).toHaveProperty("title");
      expect(product).toHaveProperty("price");
      expect(product).toHaveProperty("category");
      expect(typeof product.price).toBe("number");
      expect(product.price).toBeGreaterThan(0);
    });
  });

  test("Product Retrieval - Get specific product details", async () => {
    // Get all products to identify a valid product ID
    const allProducts = await api.getProducts();
    const productId = allProducts.data[0].id;

    // Fetch specific product details
    const response = await api.getProductById(productId);

    expect(response.success).toBe(true);
    expect(response.data).toHaveProperty("id", productId);
    expect(response.data).toHaveProperty("title");
    expect(response.data).toHaveProperty("description");
    expect(response.data).toHaveProperty("price");
    expect(response.data).toHaveProperty("image");
  });

  test("Product Browsing - Filter products by category (Phones)", async () => {
    // Get products filtered by Phones category
    const response = await api.getProductsByCategory("phones");

    expect(response.success).toBe(true);
    expect(Array.isArray(response.data)).toBe(true);
    expect(response.data.length).toBeGreaterThan(0);

    // Verify all returned products are in correct category
    response.data.forEach((product) => {
      expect(product.category.toLowerCase()).toBe("phones");
    });
  });

  test("Product Browsing - Filter products by category (Laptops)", async () => {
    // Get products filtered by Laptops category
    const response = await api.getProductsByCategory("laptops");

    expect(response.success).toBe(true);
    expect(Array.isArray(response.data)).toBe(true);
    expect(response.data.length).toBeGreaterThan(0);

    response.data.forEach((product) => {
      expect(product.category.toLowerCase()).toBe("laptops");
    });
  });

  test("Shopping Cart - Add single product to cart", async () => {
    // Get a valid product ID
    const products = await api.getProducts();
    const productId = products.data[0].id;

    // Add product to cart
    const response = await api.addToCart(productId, 1);

    expect(response.success).toBe(true);
    expect(response.message).toContain("Added to cart");
    expect(response.data).toHaveProperty("cart_id");
  });

  test("Shopping Cart - Add multiple products to cart", async () => {
    const products = await api.getProducts();

    let response = await api.addToCart(products.data[0].id, 1);
    expect(response.success).toBe(true);
    response = await api.addToCart(products.data[1].id, 2);
    expect(response.success).toBe(true);

    // 4. Verify cart contains multiple items
    const cartResponse = await api.viewCart();
    expect(cartResponse.data.length).toBeGreaterThanOrEqual(2);
  });

  test("Shopping Cart - View cart contents", async () => {
    // View current cart
    const response = await api.viewCart();

    expect(response.success).toBe(true);
    expect(Array.isArray(response.data)).toBe(true);

    // Verify cart item structure
    if (response.data.length > 0) {
      response.data.forEach((item) => {
        expect(item).toHaveProperty("id");
        expect(item).toHaveProperty("product_id");
        expect(item).toHaveProperty("quantity");
        expect(item).toHaveProperty("title");
        expect(item).toHaveProperty("price");
        expect(typeof item.quantity).toBe("number");
        expect(item.quantity).toBeGreaterThan(0);
      });
    }
  });

  test("Shopping Cart - Remove product from cart", async () => {
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
    expect(response.success).toBe(true);

    // Verify item was removed
    const updatedCart = await api.viewCart();
    expect(updatedCart.data.length).toBe(initialCount - 1);
  });

  test("Order - Place successful order", async () => {
    // Add products to cart
    const products = await api.getProducts();
    await api.addToCart(products.data[0].id, 1);
    await api.addToCart(products.data[1].id, 1);

    // Get cart items
    const cartResponse = await api.viewCart();
    expect(cartResponse.data.length).toBeGreaterThanOrEqual(2);

    // Place order
    const orderResponse = await api.placeOrder(cartResponse.data);

    expect(orderResponse.success).toBe(true);
    expect(orderResponse.message).toContain("Order placed successfully");
    expect(orderResponse.data).toHaveProperty("order_id");
    expect(orderResponse.data).toHaveProperty("total");
    expect(orderResponse.data.status).toBe("pending");
  });

  test("Order - Retrieve user orders", async () => {
    // Get user orders
    const response = await api.getOrders();

    expect(response.success).toBe(true);
    expect(Array.isArray(response.data)).toBe(true);

    // Verify order structure
    if (response.data.length > 0) {
      response.data.forEach((order) => {
        expect(order).toHaveProperty("id");
        expect(order).toHaveProperty("user_id");
        expect(order).toHaveProperty("items");
        expect(order).toHaveProperty("total");
        expect(order).toHaveProperty("status");
        expect(order).toHaveProperty("created_at");
      });
    }
  });

  test("User Profile - Get user profile", async () => {
    const response = await api.getProfile();

    expect(response.success).toBe(true);
    expect(response.data).toHaveProperty("user_id");
    expect(response.data).toHaveProperty("username");
    expect(response.data).toHaveProperty("email");
  });

  test("User Profile - Update user profile", async () => {
    // Update profile information
    const updatedData = {
      email: `${testData.NAME}@example.com`,
      phone: testData.PHONE,
    };

    const response = await api.updateProfile(updatedData);

    expect(response.success).toBe(true);
    expect(response.message).toContain("Profile updated");

    // Verify update by fetching profile again
    const profileResponse = await api.getProfile();
    expect(profileResponse.data.email).toBe(updatedData.email);
  });
});
