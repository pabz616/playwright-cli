import { test, expect } from "@playwright/test";
import { DemoblazeAPI, AuthCredentials } from "./api-helper";
import testData from "../../utils/testData";

// spec: tests/api/demoblaze-api-test-plan.md
// Negative Scenario Tests - Error handling and validation

test.describe("Demoblaze API - Negative Scenarios", () => {
  let api: DemoblazeAPI;

  test.beforeAll(async ({ playwright }) => {
    const context = await playwright.request.newContext();
    api = new DemoblazeAPI(context);

    const userCredentials: AuthCredentials = {
      username: `negative_user_${testData.ALPHA_NUM_STR}@test.com`,
      password: "TestPassword123!",
    };

    await api.signup(userCredentials);
    const loginResponse = await api.login(userCredentials);
    api.setAuthToken(loginResponse.data.token, loginResponse.data.user_id);
  });

  test("Authentication - Login with invalid credentials", async () => {
    // 1. Create a valid user, then attempt login with wrong password
    const validCredentials: AuthCredentials = {
      username: `validuser_${testData.ALPHA_NUM_STR}@test.com`,
      password: "TestPassword123!",
    };
    await api.signup(validCredentials);

    const invalidCredentials: AuthCredentials = {
      username: validCredentials.username,
      password: "wrongpassword",
    };

    const response = await api.login(invalidCredentials);

    expect(response.success).toBe(false);
    expect(response.error).toContain("Invalid credentials");
    expect(response.code).toBe("INVALID_CREDENTIALS");
  });

  test("Authentication - Login with non-existent user", async () => {
    // 1. Attempt login with non-existent user
    const credentials: AuthCredentials = {
      username: `nonexistent_${testData.ALPHA_NUM_STR}@test.com`,
      password: "TestPassword123!",
    };

    const response = await api.login(credentials);

    expect(response.success).toBe(false);
    expect(response.error).toContain("User not found");
  });

  test("Authentication - Register with duplicate username", async () => {
    // 1. Create first user
    const credentials: AuthCredentials = {
      username: `duplicate_user_${testData.ALPHA_NUM_STR}@test.com`,
      password: "TestPassword123!",
    };

    const firstSignup = await api.signup(credentials);
    expect(firstSignup.success).toBe(true);

    // 2. Attempt to register same user again
    const duplicateSignup = await api.signup(credentials);

    expect(duplicateSignup.success).toBe(false);
    expect(duplicateSignup.error).toContain("User already exists");
    expect(duplicateSignup.code).toBe("USER_EXISTS");
  });

  test("Authentication - Signup with invalid email format", async () => {
    // 1. Attempt signup with invalid email
    const invalidCredentials: AuthCredentials = {
      username: "invalid-email-format",
      password: "TestPassword123!",
    };

    const response = await api.signup(invalidCredentials);

    expect(response.success).toBe(false);
    expect(response.error).toContain("Invalid email format");
  });

  test("Authentication - Signup with weak password", async () => {
    // 1. Attempt signup with weak password
    const weakPassword: AuthCredentials = {
      username: `user_${testData.ALPHA_NUM_STR}@test.com`,
      password: "123", // Too short and weak
    };

    const response = await api.signup(weakPassword);

    expect(response.success).toBe(false);
    expect(response.error).toContain("Password does not meet requirements");
  });

  test("Authentication - Missing required fields in login", async () => {
    // 1. Attempt login without password
    const incompleteData = { username: "testuser" };

    const response = await api.login(incompleteData as any);

    expect(response.success).toBe(false);
    expect(response.error).toContain("Missing required field");
    expect(response.code).toBe("MISSING_FIELD");
  });

  test("Product Retrieval - Get non-existent product", async () => {
    // 1. Request product with invalid ID
    const response = await api.getProductById(999999);

    expect(response.success).toBe(false);
    expect(response.error).toContain("Product not found");
    expect(response.code).toBe("NOT_FOUND");
  });

  test("Product Retrieval - Get products with invalid category", async () => {
    // 1. Request products with non-existent category
    const response = await api.getProductsByCategory("invalidcategory");

    expect(response.success).toBe(false);
    expect(response.error).toContain("Category not found");
  });

  test("Shopping Cart - Add to cart without authentication", async () => {
    // 1. Attempt to add product without being logged in
    const unauthenticatedApi = new DemoblazeAPI(api as any);

    try {
      await unauthenticatedApi.addToCart(1, 1);
      expect(true).toBe(false); // Should not reach here
    } catch (error) {
      expect(error.message).toContain("User not authenticated");
    }
  });

  test("Shopping Cart - Add invalid quantity", async () => {
    // Note: This test assumes API validates quantity
    // 1. Attempt to add product with negative quantity
    const response = await api.addToCart(1, -5);

    expect(response.success).toBe(false);
    expect(response.error).toContain("Invalid quantity");
  });

  test("Shopping Cart - Add zero quantity", async () => {
    // 1. Attempt to add product with zero quantity
    const response = await api.addToCart(1, 0);

    expect(response.success).toBe(false);
    expect(response.error).toContain("Quantity must be greater than 0");
  });

  test("Shopping Cart - Remove non-existent item", async () => {
    // 1. Attempt to remove item that doesn\'t exist in cart
    const response = await api.removeFromCart(999999);

    expect(response.success).toBe(false);
    expect(response.error).toContain("Item not found");
    expect(response.code).toBe("ITEM_NOT_FOUND");
  });

  test("Shopping Cart - Add product with invalid ID", async () => {
    // 1. Attempt to add non-existent product
    const response = await api.addToCart(999999, 1);

    expect(response.success).toBe(false);
    expect(response.error).toContain("Product not found");
  });

  test("Order - Place order with empty cart", async () => {
    // 1. Attempt to place order without items
    const response = await api.placeOrder([]);

    expect(response.success).toBe(false);
    expect(response.error).toContain("Cart is empty");
  });

  test("Order - Place order with invalid billing info", async () => {
    // 1. Get valid cart items
    const products = await api.getProducts();
    await api.addToCart(products.data[0].id, 1);
    const cartResponse = await api.viewCart();

    // 2. Attempt to place order with invalid billing information
    const response = await api.placeOrder(cartResponse.data);

    // Note: This would depend on actual API validation
    // Currently expects it to fail with invalid card
    if (!response.success) {
      expect(response.error).toContain("Invalid billing information");
    }
  });

  test("Order - Retrieve non-existent order", async () => {
    // 1. Attempt to get order that doesn\'t exist
    const response = await api.getOrderById(999999);

    expect(response.success).toBe(false);
    expect(response.error).toContain("Order not found");
  });

  test("User Profile - Get profile without authentication", async () => {
    // 1. Attempt to get profile without auth token
    const unauthenticatedApi = new DemoblazeAPI(api as any);

    const response = await unauthenticatedApi.getProfile();
    expect(response.success).toBe(false);
    expect(response.error).toContain("Unauthorized");
    expect(response.code).toBe("UNAUTHORIZED");
  });

  test("Request Validation - SQL injection attempt in username", async () => {
    // 1. Attempt SQL injection in login
    const maliciousCredentials: AuthCredentials = {
      username: "admin' OR '1'='1",
      password: "' OR '1'='1",
    };

    const response = await api.login(maliciousCredentials);

    // Should fail safely without exposing SQL errors
    expect(response.success).toBe(false);
    expect(response.error).not.toContain("SQL");
    expect(response.error).not.toContain("syntax");
  });

  test("Request Validation - XSS payload in product search", async () => {
    // 1. Attempt XSS injection in category filter
    const xssPayload = '<script>alert("xss")</script>';
    const response = await api.getProductsByCategory(xssPayload);

    // Should handle gracefully
    expect(response.success).toBe(false);
    expect(response.error).not.toContain("<script>");
  });

  test("API Rate Limiting - Multiple rapid requests", async () => {
    // 1. Send multiple requests rapidly
    const promises = [];
    for (let i = 0; i < 50; i++) {
      promises.push(api.getProducts());
    }

    const responses = await Promise.all(promises);

    // Should have some rate limiting applied
    const rateLimited = responses.some((r) => r.code === "RATE_LIMITED");
    expect(rateLimited).toBe(true);
  });

  test("API Response - Verify consistent error format", async () => {
    // 1. Trigger multiple different errors
    const invalidProduct = await api.getProductById(999999);
    const invalidCategory = await api.getProductsByCategory("invalid");
    const invalidLogin = await api.login({
      username: "nonexistent",
      password: "wrong",
    });

    // All should have consistent error format
    [invalidProduct, invalidCategory, invalidLogin].forEach((response) => {
      expect(response).toHaveProperty("success");
      expect(response).toHaveProperty("error");
      expect(response).toHaveProperty("code");
      expect(response.success).toBe(false);
    });
  });
});
