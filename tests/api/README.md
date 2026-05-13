# Demoblaze API Test Suite

Complete API testing suite for Demoblaze e-commerce platform covering happy path, negative scenarios, performance, reliability, and security testing.

## 📋 Overview

This test suite provides comprehensive API testing for the Demoblaze e-commerce platform using Playwright's APIRequestContext. It covers all major API endpoints and testing scenarios as outlined in the test plan.

### Test Coverage

- **Happy Path Tests** (14 tests) - Successful API operations
- **Negative Scenario Tests** (19 tests) - Error handling and validation
- **Performance Tests** (11 tests) - Response time and load handling
- **Reliability Tests** (13 tests) - Network failures, retries, and data consistency
- **Security Tests** (20 tests) - Injection attacks, authorization, and data protection

**Total: 77 API Tests**

## 🚀 Getting Started

### Prerequisites

```bash
npm install @playwright/test @faker-js/faker
```

### Running Tests

```bash
# Run all API tests
npx playwright test tests/api/

# Run specific test file
npx playwright test tests/api/api-happy-path.spec.ts

# Run with specific tag
npx playwright test --grep "Happy Path"

# Run in headed mode (see browser interactions)
npx playwright test tests/api/ --headed

# Run with specific project
npx playwright test tests/api/ --project=chromium
```

### Debugging Tests

```bash
# Debug mode with Inspector
npx playwright test tests/api/api-happy-path.spec.ts --debug

# Show test traces
npx playwright test tests/api/ --trace=on

# Generate HTML report
npx playwright test tests/api/
npx playwright show-report
```

## 📁 File Structure

```
tests/api/
├── demoblaze-api-test-plan.md      # Comprehensive test plan documentation
├── api-helper.ts                   # DemoblazeAPI helper class with all endpoints
├── api-test-data.ts                # Test data generators and utilities
├── api-happy-path.spec.ts          # Happy path scenarios (14 tests)
├── api-negative-scenarios.spec.ts  # Error handling & validation (19 tests)
├── api-performance.spec.ts         # Performance & load tests (11 tests)
├── api-reliability.spec.ts         # Reliability & resilience tests (13 tests)
└── api-security.spec.ts            # Security & vulnerability tests (20 tests)
```

## 🔌 API Endpoints Tested

### Authentication
- `POST /api/login` - User login
- `POST /api/signup` - User registration

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:productid` - Get specific product
- `GET /api/filter/:category` - Filter products by category

### Shopping Cart
- `POST /api/addtocart` - Add item to cart
- `POST /api/deletefromcart` - Remove item from cart
- `GET /api/viewcart` - View cart items

### Orders
- `POST /api/placeorder` - Place order
- `GET /api/orders/:userid` - Get user orders
- `GET /api/orders/:orderid` - Get specific order

### User Profile
- `GET /api/user/:userid` - Get user profile
- `POST /api/updateprofile` - Update profile

## 🧪 Test Categories

### 1. Happy Path Tests (`api-happy-path.spec.ts`)
Tests successful, expected API operations:
- User registration and login
- Product retrieval and filtering
- Adding/removing items from cart
- Placing orders
- User profile operations

**Tests:** 14  
**Expected:** All pass ✅

### 2. Negative Scenario Tests (`api-negative-scenarios.spec.ts`)
Tests error handling and validation:
- Invalid credentials
- Non-existent resources
- Missing required fields
- Duplicate user registration
- Invalid quantities
- SQL injection attempts
- XSS payload injection
- Rate limiting

**Tests:** 19  
**Expected:** All fail with proper error handling ❌→✅

### 3. Performance Tests (`api-performance.spec.ts`)
Tests response times and load handling:
- Individual endpoint performance (< 2000ms SLA)
- Bulk operations
- Concurrent requests
- Large cart operations
- Response payload sizes
- P95 response time metrics

**Tests:** 11  
**Thresholds:**
- Products list: 2000ms
- Single product: 1500ms
- Login: 1000ms
- Add to cart: 800ms
- Place order: 2500ms

### 4. Reliability Tests (`api-reliability.spec.ts`)
Tests resilience and data consistency:
- API availability
- Network timeout handling
- Data consistency after operations
- Cart state persistence
- Duplicate request handling
- Error recovery
- Concurrent operations
- Session persistence

**Tests:** 13  
**Expected:** All operations consistent and recoverable ✅

### 5. Security Tests (`api-security.spec.ts`)
Tests vulnerability and attack resistance:
- SQL injection attempts
- XSS payload injection
- Command injection
- Path traversal
- Authentication bypass
- Privilege escalation
- Rate limiting for brute force
- Sensitive data exposure
- CSRF token validation
- HTTPS enforcement
- NoSQL injection
- LDAP injection
- XML/XXE injection

**Tests:** 20  
**Expected:** All attacks blocked safely ✅

## 🛠️ DemoblazeAPI Helper Class

The `DemoblazeAPI` class provides convenient methods for all API operations:

```typescript
import { DemoblazeAPI } from './api-helper';

// Initialize with Playwright APIRequestContext
const api = new DemoblazeAPI(apiRequestContext);

// Authentication
await api.signup({ username: 'test', password: 'Test123!' });
await api.login({ username: 'test', password: 'Test123!' });

// Products
await api.getProducts();
await api.getProductById(1);
await api.getProductsByCategory('phones');

// Shopping Cart
api.setAuthToken(token, userId);
await api.addToCart(productId, quantity);
await api.removeFromCart(itemId);
await api.viewCart();

// Orders
await api.placeOrder(cartItems);
await api.getOrders();
await api.getOrderById(orderId);

// User Profile
await api.getProfile();
await api.updateProfile({ email: 'newemail@example.com' });
```

## 📊 Test Data

The `api-test-data.ts` file provides:

- Valid test credentials
- Invalid credentials for negative testing
- SQL injection payloads
- XSS payloads
- Command injection payloads
- Path traversal payloads
- Product categories
- Billing information
- Performance thresholds

### Usage Examples

```typescript
import { generateValidUser, generateRandomCart } from './api-test-data';

// Generate random user
const user = generateValidUser();

// Generate random cart with 5 products
const cart = generateRandomCart(5);

// Generate billing information
const billing = generateBillingInfo();
```

## 🔐 Security Testing Details

The security test suite covers OWASP Top 10 vulnerabilities:

1. **Injection Attacks**
   - SQL Injection
   - NoSQL Injection
   - LDAP Injection
   - Command Injection
   - Path Traversal

2. **Broken Authentication**
   - Weak password validation
   - Token validation
   - Authentication bypass

3. **Sensitive Data Exposure**
   - Password hashing verification
   - Sensitive data in responses
   - HTTPS enforcement

4. **XML External Entities (XXE)**
   - XML payload injection
   - External entity attacks

5. **Broken Access Control**
   - Privilege escalation
   - Unauthorized user modification
   - Cross-user data access

6. **Rate Limiting & DOS**
   - Brute force protection
   - API rate limiting
   - Concurrent request handling

## ⚡ Performance Benchmarks

Service Level Agreements (SLAs):

| Endpoint | SLA | Target |
|----------|-----|--------|
| GET /api/products | 2000ms | < 2000ms ✅ |
| GET /api/products/:id | 1500ms | < 1500ms ✅ |
| POST /api/login | 1000ms | < 1000ms ✅ |
| POST /api/addtocart | 800ms | < 800ms ✅ |
| POST /api/placeorder | 2500ms | < 2500ms ✅ |
| GET /api/filter/:category | 1800ms | < 1800ms ✅ |

## 📈 Load Testing

The performance tests include:
- 10 concurrent product list requests
- 100+ item cart operations
- Sequential operation chains
- P95 response time metrics
- Payload size validation

## 🐛 Debugging Tips

1. **Check API Responses**: All tests log response details for debugging
2. **Network Monitoring**: Use Playwright's network inspection tools
3. **Error Messages**: Review error codes and messages for API issues
4. **Retry Logic**: Tests include retry mechanisms for flaky operations
5. **Performance Profiling**: Use the performance tests to identify bottlenecks

## ✅ Test Execution Checklist

Before running tests:
- [ ] Ensure Demoblaze API is accessible
- [ ] Verify API endpoints are responding
- [ ] Check network connectivity
- [ ] Review performance thresholds
- [ ] Prepare test data

After running tests:
- [ ] Review test report (HTML)
- [ ] Check for failing tests
- [ ] Analyze performance metrics
- [ ] Review security findings
- [ ] Document any issues found

## 📝 Continuous Integration

For CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run API Tests
  run: npx playwright test tests/api/ --reporter=html --reporter=json

- name: Upload Test Report
  if: always()
  uses: actions/upload-artifact@v2
  with:
    name: playwright-report
    path: playwright-report/
```

## 🔄 Test Maintenance

- Review and update tests quarterly
- Update performance thresholds based on SLA changes
- Add new security test cases for emerging vulnerabilities
- Monitor and refine rate limiting tests
- Update test data generators as needed

## 📚 References

- [Playwright API Testing Documentation](https://playwright.dev/docs/api-testing)
- [Demoblaze Test Plan](./demoblaze-api-test-plan.md)
- [OWASP Security Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [API Security Best Practices](https://owasp.org/www-project-api-security/)

## ⚙️ Configuration

API tests use the following configuration (from `playwright.config.ts`):
- Base URL: https://www.demoblaze.com
- Timeout: 30 seconds
- Retries: 2 (for flaky tests)
- Projects: chromium, firefox, webkit

## 🤝 Contributing

To add new API tests:

1. Create test file following naming convention: `api-[category].spec.ts`
2. Use the `DemoblazeAPI` helper class for API calls
3. Follow the existing test structure and naming patterns
4. Add proper test documentation and comments
5. Update this README with new test coverage
6. Ensure all tests pass before submitting

## 📞 Support

For issues or questions:
1. Check the test documentation in this README
2. Review test error messages and logs
3. Check the Demoblaze API documentation
4. Review similar passing tests for patterns
5. File an issue with test output and environment details
