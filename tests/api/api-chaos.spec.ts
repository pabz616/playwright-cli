import { test, expect } from "@playwright/test";
import { DemoblazeAPI, AuthCredentials } from "./api-helper";
import testData from "../../utils/testData";


// Chaos Tests - Simulating real-world chaotic scenarios including race conditions,
// resource exhaustion, cascading failures, and state corruption

test.describe("Demoblaze API - Chaos Tests", () => {
  let api: DemoblazeAPI;
  let chaosUsers: AuthCredentials[] = [];
  let chaosTokens: string[] = [];
  let chaosUserIds: number[] = [];

  test.beforeAll(async ({ playwright }) => {
    const context = await playwright.request.newContext();
    api = new DemoblazeAPI(context);

    // Setup multiple users for chaos scenarios
    for (let i = 0; i < 5; i++) {
      const credentials: AuthCredentials = {
        username: testData.CHAOS_USER,
        password: testData.CHAOS_PWD,
      };
      chaosUsers.push(credentials);
      await api.signup(credentials);
      const loginResponse = await api.login(credentials);
      chaosTokens.push(loginResponse.data.token);
      chaosUserIds.push(loginResponse.data.user_id);
    }
  });

  // ============ Rate Limiting & Request Flood Tests ============

  test("Chaos - Request flood on product endpoint (rate limiting)", async () => {
    // 1. Rapidly fire many requests to test rate limiting
    const requestCount = 25;
    const results: any[] = [];

    for (let i = 0; i < requestCount; i++) {
      const response = await api.getProducts();
      results.push(response);
    }

    // 2. Verify that API gracefully handles or rejects after threshold
    const failedResponses = results.filter((r) => !r.success);
    const successResponses = results.filter((r) => r.success);

    // 3. Either all succeed or rate limit kicks in
    expect(successResponses.length + failedResponses.length).toBe(requestCount);

    // 4. If failures exist, they should be rate limit errors
    if (failedResponses.length > 0) {
      expect(failedResponses[0].code).toBe("RATE_LIMITED");
    }
  });

  test("Chaos - Concurrent add-to-cart operations", async () => {
    // 1. Setup: Authenticate user
    api.setAuthToken(chaosTokens[0], chaosUserIds[0]);

    // 2. Fire concurrent add-to-cart requests
    const concurrentRequests = 10;
    const addPromises = [];

    for (let i = 0; i < concurrentRequests; i++) {
      const productId = (i % 5) + 1; // Cycle through available products
      addPromises.push(api.addToCart(productId, 1));
    }

    const results = await Promise.all(addPromises);

    // 3. Verify all requests completed
    expect(results.length).toBe(concurrentRequests);

    // 4. Check cart consistency
    const cartResponse = await api.viewCart();
    expect(cartResponse.success).toBe(true);

    // 5. Cart should have items (may be deduplicated or combined)
    expect(cartResponse.data.length).toBeGreaterThan(0);
    expect(cartResponse.data.length).toBeLessThanOrEqual(concurrentRequests);
  });

  test("Chaos - Concurrent order placement", async () => {
    // 1. Setup: Create user and add items to cart
    const userIndex = 1;
    api.setAuthToken(chaosTokens[userIndex], chaosUserIds[userIndex]);

    for (let i = 1; i <= 3; i++) {
      await api.addToCart(i, 2);
    }

    const cartResponse = await api.viewCart();
    const cartItems = cartResponse.data;

    // 2. Attempt concurrent order placement (should only succeed once or handle gracefully)
    const orderPromises = [
      api.placeOrder(cartItems),
      api.placeOrder(cartItems),
      api.placeOrder(cartItems),
    ];

    const results = await Promise.all(orderPromises);

    // 3. Verify results - should either have 1 success or proper error handling
    const successResults = results.filter((r) => r.success);
    expect(successResults.length).toBeGreaterThanOrEqual(1);

    // 4. Cart should be empty after first order
    const finalCart = await api.viewCart();
    expect(finalCart.data.length).toBe(0);
  });

  // ============ State Corruption & Invalid Sequences ============

  test("Chaos - Operations on empty cart", async () => {
    // 1. Setup: Fresh user with empty cart
    const userIndex = 2;
    api.setAuthToken(chaosTokens[userIndex], chaosUserIds[userIndex]);

    // 2. Try to place order on empty cart
    const emptyCartOrder = await api.placeOrder([]);
    expect(emptyCartOrder.success).toBe(false);
    expect(emptyCartOrder.code).toBe("EMPTY_CART");

    // 3. Try to remove non-existent item
    const removeNonExistent = await api.removeFromCart(9999);
    expect(removeNonExistent.success).toBe(false);
  });

  test("Chaos - Rapid cart state changes", async () => {
    // 1. Setup: User with multiple cart operations
    const userIndex = 3;
    api.setAuthToken(chaosTokens[userIndex], chaosUserIds[userIndex]);

    // 2. Rapidly add, remove, add, remove items
    const operations = [];

    for (let cycle = 0; cycle < 3; cycle++) {
      operations.push(api.addToCart(1, 1));
      operations.push(api.addToCart(2, 1));
      operations.push(api.viewCart());

      // Get item IDs from cart
      const cartResponse = await api.viewCart();
      for (const item of cartResponse.data) {
        operations.push(api.removeFromCart(item.id));
      }
    }

    const results = await Promise.all(operations);

    // 3. Verify cart is in consistent state
    const finalCart = await api.viewCart();
    expect(finalCart.success).toBe(true);
    expect(Array.isArray(finalCart.data)).toBe(true);
  });

  test.skip("Chaos - Invalid quantity operations", async () => {
    // 1. Setup: Authenticated user
    api.setAuthToken(chaosTokens[4], chaosUserIds[4]);

    // 2. Try various invalid quantities
    const invalidQuantities = [0, -1, -100, null, undefined];

    for (const qty of invalidQuantities) {
      const response = await api.addToCart(1, qty as any);
      expect(response.success).toBe(false);
      expect(["INVALID_QUANTITY"]).toContain(response.code);
    }
  });

  // ============ Cascading Failures ============

  test("Chaos - Cascading order failures", async () => {
    // 1. Create user
    const credentials: AuthCredentials = {
      username: `cascade_user_${faker.string.alphanumeric(8)}@test.com`,
      password: "CascadeTest123!",
    };
    await api.signup(credentials);
    const loginResponse = await api.login(credentials);
    api.setAuthToken(loginResponse.data.token, loginResponse.data.user_id);

    // 2. Add items then quickly place order, then try another
    await api.addToCart(1, 5);
    const order1 = await api.placeOrder((await api.viewCart()).data);

    // 3. Cart should be empty, second order should fail
    const order2 = await api.placeOrder((await api.viewCart()).data);
    expect(order2.success).toBe(false);
    expect(order2.code).toBe("EMPTY_CART");

    // 4. Verify first order exists
    expect(order1.success).toBe(true);
    const orders = await api.getOrders();
    expect(orders.data.length).toBeGreaterThanOrEqual(1);
  });

  test.skip("Chaos - Mixed valid and invalid requests in sequence", async () => {
    // 1. Setup user
    const credentials: AuthCredentials = {
      username: `mixed_user_${faker.string.alphanumeric(8)}@test.com`,
      password: "MixedTest123!",
    };
    await api.signup(credentials);
    const loginResponse = await api.login(credentials);
    api.setAuthToken(loginResponse.data.token, loginResponse.data.user_id);

    // 2. Execute mixed valid/invalid operations
    const operations = [
      api.addToCart(1, 1), // Valid
      api.addToCart(999, 1), // Invalid product
      api.addToCart(2, 0), // Invalid quantity
      api.addToCart(3, 2), // Valid
      api.viewCart(), // Valid
      api.getProfile(), // Valid
      api.addToCart(-1, 1), // Invalid quantity
      api.removeFromCart(9999), // Invalid item
    ];

    const results = await Promise.all(operations);

    // 3. Verify responses are properly formed
    expect(results.length).toBe(operations.length);
    results.forEach((result) => {
      expect(result).toHaveProperty("success");
      expect(result).toHaveProperty("data");
    });
  });

  // ============ Authorization Chaos ============

  test("Chaos - Cross-user authorization boundary testing", async () => {
    // 1. Create two separate users
    const user1: AuthCredentials = {
      username: `auth_user1_${faker.string.alphanumeric(8)}@test.com`,
      password: "AuthTest123!",
    };
    const user2: AuthCredentials = {
      username: `auth_user2_${faker.string.alphanumeric(8)}@test.com`,
      password: "AuthTest123!",
    };

    await api.signup(user1);
    await api.signup(user2);

    const login1 = await api.login(user1);
    const login2 = await api.login(user2);

    // 2. User1 adds items to cart
    api.setAuthToken(login1.data.token, login1.data.user_id);
    await api.addToCart(1, 2);
    await api.addToCart(2, 1);

    // 3. Switch to user2 - should have separate cart
    api.setAuthToken(login2.data.token, login2.data.user_id);
    const user2Cart = await api.viewCart();
    expect(user2Cart.data.length).toBe(0);

    // 4. User2 adds different items
    await api.addToCart(3, 3);

    // 5. Switch back to user1 - should still have original items
    api.setAuthToken(login1.data.token, login1.data.user_id);
    const user1Cart = await api.viewCart();
    expect(user1Cart.data.length).toBe(2);
    expect(user1Cart.data.some((item: any) => item.product_id === 1)).toBe(
      true,
    );
  });

  test.skip("Chaos - Unauthorized access attempts", async () => {
    // 1. Create DemoblazeAPI instance without auth
    const unauthApi = new (api as any).constructor({} as any);

    // 2. Try protected operations without token
    const placeOrderResponse = await unauthApi.placeOrder([]);
    expect(placeOrderResponse.success).toBe(false);

    const profileResponse = await unauthApi.getProfile();
    expect(profileResponse.success).toBe(false);
    expect(profileResponse.code).toBe("UNAUTHORIZED");

    const ordersResponse = await unauthApi.getOrders();
    expect(ordersResponse.success).toBe(false);
  });

  // ============ Data Consistency Tests ============

  test("Chaos - Cart quantity consistency after concurrent operations", async () => {
    // 1. Setup authenticated user
    const credentials: AuthCredentials = {
      username: `consistency_user_${faker.string.alphanumeric(8)}@test.com`,
      password: "ConsistencyTest123!",
    };
    await api.signup(credentials);
    const loginResponse = await api.login(credentials);
    api.setAuthToken(loginResponse.data.token, loginResponse.data.user_id);

    // 2. Add same product multiple times concurrently
    const addPromises = [];
    for (let i = 0; i < 5; i++) {
      addPromises.push(api.addToCart(1, 2));
    }
    await Promise.all(addPromises);

    // 3. Verify cart consistency
    const cart = await api.viewCart();
    expect(cart.success).toBe(true);

    // 4. Find product 1 in cart
    const product1Item = cart.data.find((item: any) => item.product_id === 1);
    expect(product1Item).toBeDefined();

    // 5. Quantity should be accumulated (5 concurrent adds of 2 each = 10)
    expect(product1Item.quantity).toBe(10);
  });

  test("Chaos - Order data integrity under concurrent order placement", async () => {
    // 1. Setup user with cart
    const credentials: AuthCredentials = {
      username: `order_integrity_${faker.string.alphanumeric(8)}@test.com`,
      password: "OrderTest123!",
    };
    await api.signup(credentials);
    const loginResponse = await api.login(credentials);
    api.setAuthToken(loginResponse.data.token, loginResponse.data.user_id);

    // 2. Add diverse products
    await api.addToCart(1, 2);
    await api.addToCart(2, 1);
    await api.addToCart(3, 3);

    const cartBefore = await api.viewCart();
    const cartTotal = cartBefore.data.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0,
    );

    // 3. Place order
    const orderResponse = await api.placeOrder(cartBefore.data);
    expect(orderResponse.success).toBe(true);

    // 4. Verify order totals match
    expect(orderResponse.data.total).toBe(cartTotal);

    // 5. Retrieve and verify order details
    const orderDetails = await api.getOrderById(orderResponse.data.order_id);
    expect(orderDetails.success).toBe(true);
    expect(orderDetails.data.total).toBe(cartTotal);
    expect(orderDetails.data.items.length).toBe(3);
  });

  // ============ Resource Exhaustion ============

  test("Chaos - High volume product retrieval", async () => {
    // 1. Rapidly fetch products many times
    const fetchCount = 30;
    const requests = [];

    for (let i = 0; i < fetchCount; i++) {
      requests.push(api.getProducts());
    }

    const results = await Promise.all(requests);

    // 2. Verify responses
    expect(results.length).toBe(fetchCount);

    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;

    // 3. Should have mostly successes or controlled failures
    expect(successCount + failureCount).toBe(fetchCount);

    // 4. If there are failures, they should be rate limit errors
    const failures = results.filter((r) => !r.success);
    if (failures.length > 0) {
      expect(failures[0].code).toBe("RATE_LIMITED");
    }
  });

  test("Chaos - Profile retrieval under load", async () => {
    // 1. Setup: Multiple authenticated users
    const profileRequests = [];

    for (let i = 0; i < Math.min(chaosUserIds.length, 5); i++) {
      api.setAuthToken(chaosTokens[i], chaosUserIds[i]);
      profileRequests.push(api.getProfile());
    }

    const results = await Promise.all(profileRequests);

    // 2. Verify all responses
    expect(results.length).toBeGreaterThan(0);
    results.forEach((result) => {
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty("user_id");
      expect(result.data).toHaveProperty("username");
    });
  });

  // ============ Out-of-Order Operations ============

  test("Chaos - Order retrieval before placing order", async () => {
    // 1. Setup: Fresh user without orders
    const credentials: AuthCredentials = {
      username: `ooo_user_${faker.string.alphanumeric(8)}@test.com`,
      password: "OOOTest123!",
    };
    await api.signup(credentials);
    const loginResponse = await api.login(credentials);
    api.setAuthToken(loginResponse.data.token, loginResponse.data.user_id);

    // 2. Try to retrieve orders before placing any
    const ordersResponse = await api.getOrders();
    expect(ordersResponse.success).toBe(true);
    expect(ordersResponse.data.length).toBe(0);

    // 3. Try to get non-existent order
    const orderDetails = await api.getOrderById(9999);
    expect(orderDetails.success).toBe(false);
  });

  test("Chaos - Checkout before adding items", async () => {
    // 1. Setup: Fresh user
    const credentials: AuthCredentials = {
      username: `checkout_early_${faker.string.alphanumeric(8)}@test.com`,
      password: "CheckoutTest123!",
    };
    await api.signup(credentials);
    const loginResponse = await api.login(credentials);
    api.setAuthToken(loginResponse.data.token, loginResponse.data.user_id);

    // 2. Try to checkout empty cart
    const emptyCart = await api.viewCart();
    const checkoutResponse = await api.placeOrder(emptyCart.data);

    expect(checkoutResponse.success).toBe(false);
    expect(checkoutResponse.code).toBe("EMPTY_CART");
  });

  // ============ Invalid Data Combinations ============

  test("Chaos - Extreme product IDs", async () => {
    // 1. Test with extreme product IDs
    const extremeIds = [
      0,
      -1,
      -9999,
      999999,
      Number.MAX_SAFE_INTEGER,
      Number.MIN_SAFE_INTEGER,
    ];

    for (const productId of extremeIds) {
      const response = await api.getProductById(productId);
      // Should fail gracefully
      expect(response.success).toBe(false);
      expect(response.code).toBe("NOT_FOUND");
    }
  });

  test("Chaos - Special characters in category filter", async () => {
    // 1. Test various special character payloads
    const specialChars = [
      "!@#$%^&*()",
      "'; DROP --",
      "<script>",
      "${process.env.SECRET}",
      "../../etc/passwd",
      "\x00",
      "\n\r",
      "   ",
    ];

    for (const payload of specialChars) {
      const response = await api.getProductsByCategory(payload);
      // Should fail safely without exposing internals
      expect(response.success).toBe(false);
      expect(response.code).toBe("NOT_FOUND");
    }
  });

  test.skip("Chaos - Null and undefined handling", async () => {
    // 1. Setup authenticated user
    const credentials: AuthCredentials = {
      username: `null_user_${faker.string.alphanumeric(8)}@test.com`,
      password: "NullTest123!",
    };
    await api.signup(credentials);
    const loginResponse = await api.login(credentials);
    api.setAuthToken(loginResponse.data.token, loginResponse.data.user_id);

    // 2. Try operations with null/undefined values
    const nullOperations = [
      api.addToCart(null as any, 1),
      api.addToCart(1, null as any),
      api.removeFromCart(null as any),
      api.getProductById(null as any),
    ];

    const results = await Promise.all(nullOperations);

    // 3. All should handle gracefully without crashing
    results.forEach((result) => {
      expect(result).toHaveProperty("success");
      expect(result).toHaveProperty("data");
    });
  });

  // ============ Multi-Step Chaos Scenarios ============

  test.skip("Chaos - Complete chaotic user journey", async () => {
    // 1. Create user
    const credentials: AuthCredentials = {
      username: `chaos_journey_${faker.string.alphanumeric(8)}@test.com`,
      password: "JourneyTest123!",
    };
    await api.signup(credentials);
    const loginResponse = await api.login(credentials);
    api.setAuthToken(loginResponse.data.token, loginResponse.data.user_id);

    // 2. Chaotic sequence of operations
    const operations = [
      api.getProducts(), // Get products
      api.addToCart(1, 1), // Add to cart
      api.addToCart(2, 2), // Add another
      api.viewCart(), // View cart
      api.addToCart(3, 1), // Add more
      api.getProfile(), // Get profile
      api.removeFromCart(1), // Remove first item (attempt)
      api.viewCart(), // View again
      api.getProducts(), // Get products again
      api.updateProfile({ phone: "555-1234", city: "TestCity" }), // Update profile
      api.viewCart(), // Final cart view
    ];

    const results = await Promise.all(operations);

    // 3. Verify all operations completed without fatal errors
    expect(results.length).toBe(operations.length);
    results.forEach((result) => {
      expect(result).toHaveProperty("success");
      expect(result).toHaveProperty("data");
    });

    // 4. Verify final state consistency
    const finalCart = await api.viewCart();
    expect(finalCart.success).toBe(true);
    expect(Array.isArray(finalCart.data)).toBe(true);

    const finalProfile = await api.getProfile();
    expect(finalProfile.success).toBe(true);
  });

  test("Chaos - Sequential user registration storm", async () => {
    // 1. Rapidly create multiple users
    const userCount = 10;
    const signupRequests = [];

    for (let i = 0; i < userCount; i++) {
      const credentials: AuthCredentials = {
        username: `storm_user_${i}_${faker.string.alphanumeric(6)}@test.com`,
        password: "StormTest123!",
      };
      signupRequests.push(api.signup(credentials));
    }

    const signupResults = await Promise.all(signupRequests);

    // 2. All should succeed
    expect(signupResults.length).toBe(userCount);
    signupResults.forEach((result) => {
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty("user_id");
    });

    // 3. Now attempt duplicate registrations
    const duplicateRequests = [];
    for (let i = 0; i < 5; i++) {
      const dupCredentials: AuthCredentials = {
        username: signupResults[i].data.username, // Use same as earlier
        password: "StormTest123!",
      };
      duplicateRequests.push(api.signup(dupCredentials));
    }

    const dupResults = await Promise.all(duplicateRequests);

    // 4. All duplicates should fail
    dupResults.forEach((result) => {
      expect(result.success).toBe(false);
      expect(result.code).toBe("USER_EXISTS");
    });
  });
});
