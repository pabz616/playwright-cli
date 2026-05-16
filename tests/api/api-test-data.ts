/**
 * API Test Data and Utilities
 * Provides test data generators and helper utilities for Demoblaze API testing
 */
const { testData } = require("../../utils/testData");

export const API_TEST_DATA = {
  // Valid test credentials
  VALID_USER: {
    username: testData.USN,
    password: testData.PWD,
    email: testData.EMAIL,
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
export function generateValidUser() {
  return {
    username: `user_${testData.ALPHA_NUM_STR}@test.com`,
    password: `Pass${testData.ALPHA_NUM_STR}!@`,
    email: testData.EMAIL,
  };
}

/**
 * Generate invalid credentials for testing
 */
export function generateInvalidCredentials() {
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
export function generateRandomCart(productCount: number = 3) {
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
export function generateBillingInfo() {
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
export function generateLoadTestData(concurrentRequests: number) {
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
export function assertApiResponseStructure(
  response: any,
  expectSuccess: boolean = true,
) {
  expect(response).toHaveProperty("success");

  if (expectSuccess) {
    expect(response.success).toBe(true);
    expect(response).toHaveProperty("data");
  } else {
    expect(response.success).toBe(false);
    expect(response).toHaveProperty("error");
    expect(response).toHaveProperty("code");
  }
}

/**
 * Retry failed API calls
 */
export async function retryApiCall<T>(
  apiCall: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000,
): Promise<T> {
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error as Error;
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
export async function measureResponseTime(
  apiCall: () => Promise<any>,
): Promise<{
  response: any;
  duration: number;
}> {
  const startTime = Date.now();
  const response = await apiCall();
  const duration = Date.now() - startTime;

  return { response, duration };
}

/**
 * Generate concurrent API requests
 */
export function generateConcurrentRequests(
  apiCall: () => Promise<any>,
  count: number,
) {
  const requests = [];
  for (let i = 0; i < count; i++) {
    requests.push(apiCall());
  }
  return Promise.all(requests);
}

export default {
  API_TEST_DATA,
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
