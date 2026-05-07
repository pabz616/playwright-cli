# DemoBlaze E-Commerce Test Plan

## Application Overview

DemoBlaze is a demo e-commerce website that simulates a product store selling electronic devices such as phones, laptops, and monitors. The application features product browsing by categories, detailed product pages, shopping cart functionality, user authentication (sign up and log in), and static pages for contact and about information. It uses modals for user interactions and maintains cart state.

## Test Strategy

### Approach

- **Testing Types**: Functional testing, UI/UX testing, and integration testing focused on end-to-end user workflows.
- **Automation**: Use Playwright for browser automation to ensure cross-browser compatibility (Chromium, Firefox, WebKit).
- **Test Data**: Use synthetic test data for user credentials, product selections, and form inputs. Avoid real payment data.
- **Environment**: Test on staging/demo environment identical to production. Run tests in headless mode for CI/CD integration.
- **Coverage**: Aim for 100% coverage of critical user journeys. Include positive, negative, and edge case scenarios.
- **Reporting**: Generate HTML reports with screenshots on failures. Track test execution time and pass/fail rates.
- **Maintenance**: Review and update tests quarterly or after major application changes.

### Entry/Exit Criteria

- **Entry**: Application deployed to test environment, test data prepared, test scripts reviewed.
- **Exit**: All critical tests pass, no high-severity bugs open, test coverage meets targets.

### Tools and Frameworks

- Playwright for test automation
- Node.js for scripting
- Git for version control
- CI/CD pipeline for automated execution

## Proposed Timeline

Assuming a 2-week sprint cycle with 1 dedicated QA engineer:

- **Week 1**:
  - Day 1-2: Setup test environment and write seed tests
  - Day 3-4: Implement Product Browsing tests (Groups 1)
  - Day 5: Implement Shopping Cart tests (Group 2)

- **Week 2**:
  - Day 1-2: Implement User Authentication tests (Group 3)
  - Day 3: Implement Static Pages and Navigation tests (Groups 4-5)
  - Day 4: Implement Error Handling tests (Group 6)
  - Day 5: Review, refactor, and run full regression suite

- **Week 3** (if needed): Bug fixes, performance optimization, and documentation.

Total estimated effort: 10-15 person-days.

## Out of Scope

- Performance testing (load, stress, scalability)
- Security testing (vulnerability scanning, penetration testing)
- Accessibility testing (WCAG compliance)
- Mobile responsiveness testing (device-specific layouts)
- API testing (backend service validation)
- Database testing (data integrity, migrations)
- Third-party integrations (payment gateways, shipping APIs)
- Localization/internationalization testing
- Browser compatibility beyond Chromium, Firefox, WebKit
- Production deployment validation

## Risk Matrix

| Test Scenario Group    | Risk Description                           | Likelihood (Low/Med/High) | Impact (Low/Med/High) | Mitigation                                   |
| ---------------------- | ------------------------------------------ | ------------------------- | --------------------- | -------------------------------------------- |
| 1. Product Browsing    | Dynamic content loading failures           | Med                       | High                  | Add retry logic and wait strategies          |
| 2. Shopping Cart       | State management issues (cart persistence) | High                      | High                  | Test across sessions, use localStorage mocks |
| 3. User Authentication | Modal interaction complexities             | Med                       | Med                   | Use explicit waits, test modal lifecycle     |
| 4. Static Pages        | Content accuracy changes                   | Low                       | Low                   | Screenshot comparisons for visual regression |
| 5. Navigation          | URL routing inconsistencies                | Med                       | Med                   | Test back/forward navigation, deep linking   |
| 6. Error Handling      | Unhandled exceptions in JS                 | High                      | Med                   | Add try-catch blocks, monitor console errors |

## Test Scenarios

### 1. Product Browsing

**Seed:** `tests/seed.spec.ts`

#### 1.1. browse-home-page

**File:** `tests/product-browsing/browse-home-page.spec.ts`

**Steps:**

1. Navigate to the home page
   - expect: Page title is "STORE"
   - expect: Navigation menu is visible with links: Home, Contact, About us, Cart, Log in, Sign up
   - expect: Carousel is displayed with slides
   - expect: Categories section shows Phones, Laptops, Monitors
   - expect: Product list is displayed

#### 1.2. filter-by-category

**File:** `tests/product-browsing/filter-by-category.spec.ts`

**Steps:**

1. Click on "Phones" category
   - expect: URL changes to include category filter
   - expect: Only phone products are displayed
   - expect: Product image to be displayed
   - expect: Product name to be displayed and clickable
   - expect: Product price to be displayed and expressed in the USD currency format
   - expect: Product description to be displayed and free of any errors
2. Click on "Laptops" category
   - expect: Only laptop products are displayed
   - expect: Product image to be displayed
   - expect: Product name to be displayed and clickable
   - expect: Product price to be displayed and expressed in the USD currency format
   - expect: Product description to be displayed and free of any errors
3. Click on "Monitors" category
   - expect: Only monitor products are displayed
   - expect: Product image to be displayed
   - expect: Product name to be displayed and clickable
   - expect: Product price to be displayed and expressed in the USD currency format
   - expect: Product description to be displayed and free of any errors

#### 1.3. view-product-details

**File:** `tests/product-browsing/view-product-details.spec.ts`

**Steps:**

1. Click on a product title from the home page
   - expect: Navigates to product detail page (prod.html?idp\_=X)
   - expect: Product name, price, and description are displayed
   - expect: "Add to cart" button is visible and actionable

### 2. Shopping Cart

**Seed:** `tests/seed.spec.ts`

#### 2.1. add-product-to-cart

**File:** `tests/shopping-cart/add-product-to-cart.spec.ts`

**Steps:**

1. Navigate to a product detail page
2. Click "Add to cart" button
   - expect: Alert appears confirming item added
   - expect: Cart link in navigation shows updated count (if applicable)

#### 2.2. view-cart

**File:** `tests/shopping-cart/view-cart.spec.ts`

**Steps:**

1. Click on "Cart" in navigation
   - expect: Navigates to cart.html
   - expect: Cart table shows columns: Pic, Title, Price, x
   - expect: Total amount is displayed
   - expect: "Place Order" button is visible

#### 2.3. remove-from-cart

**File:** `tests/shopping-cart/remove-from-cart.spec.ts`

**Steps:**

1. Add a product to cart
2. Navigate to cart page
3. Click the delete (x) button for the item
   - expect: Item is removed from cart table
   - expect: Total is updated

#### 2.4. place-order

**File:** `tests/shopping-cart/place-order.spec.ts`

**Steps:**

1. Add products to cart
2. Navigate to cart
3. Click "Place Order"
   - expect: Order form modal appears
   - expect: Form fields: Name, Country, City, Credit card, Month, Year
4. Fill in order details and submit
   - expect: Success message appears
   - expect: Cart is emptied

### 3. User Authentication

**Seed:** `tests/seed.spec.ts`

#### 3.1. sign-up

**File:** `tests/user-authentication/sign-up.spec.ts`

**Steps:**

1. Click "Sign up" in navigation
   - expect: Sign up modal appears
   - expect: Username and Password fields are visible, editable, and not pre-filled
2. Enter valid username and password
3. Click "Sign up" button
   - expect: Success alert appears
   - expect: Modal closes

#### 3.2. sign-up-validation

**File:** `tests/user-authentication/sign-up-validation.spec.ts`

**Steps:**

1. Open sign up modal
2. Attempt to sign up with empty fields
   - expect: Validation error or alert
3. Attempt to sign up with existing username
   - expect: Error message about duplicate user

#### 3.3. log-in

**File:** `tests/user-authentication/log-in.spec.ts`

**Steps:**

1. Click "Log in" in navigation
   - expect: Log in modal appears
2. Enter valid credentials
3. Click "Log in" button
   - expect: Modal closes
   - expect: Welcome message appears
   - expect: Navigation shows logged in state

#### 3.4. log-in-validation

**File:** `tests/user-authentication/log-in-validation.spec.ts`

**Steps:**

1. Open log in modal
2. Enter invalid credentials
   - expect: Error alert appears
3. Enter empty fields
   - expect: Validation prevents submission

### 4. Static Pages

**Seed:** `tests/seed.spec.ts`

#### 4.1. contact-form

**File:** `tests/static-pages/contact-form.spec.ts`

**Steps:**

1. Click "Contact" in navigation
   - expect: Contact modal appears
   - expect: Fields: Contact Email, Contact Name, Message
2. Fill in contact form
3. Click "Send message"
   - expect: Success confirmation

#### 4.2. about-us

**File:** `tests/static-pages/about-us.spec.ts`

**Steps:**

1. Click "About us" in navigation
   - expect: About us modal appears
   - expect: Content about the company is displayed

### 5. Navigation

**Seed:** `tests/seed.spec.ts`

#### 5.1. navigation-links

**File:** `tests/navigation/navigation-links.spec.ts`

**Steps:**

1. From any page, click "Home" in navigation
   - expect: Navigates to index.html
2. Click "Cart"
   - expect: Navigates to cart.html
3. Click "PRODUCT STORE" logo
   - expect: Navigates to index.html

#### 5.2. carousel-navigation

**File:** `tests/navigation/carousel-navigation.spec.ts`

**Steps:**

1. On home page, click carousel next/previous buttons
   - expect: Slides change appropriately
2. Click carousel indicators
   - expect: Jumps to specific slide

### 6. Error Handling

**Seed:** `tests/seed.spec.ts`

#### 6.1. invalid-product-url

**File:** `tests/error-handling/invalid-product-url.spec.ts`

**Steps:**

1. Navigate to invalid product URL (prod.html?idp\_=999)
   - expect: Appropriate error handling or fallback

#### 6.2. network-errors

**File:** `tests/error-handling/network-errors.spec.ts`

**Steps:**

1. Simulate network failure during add to cart
   - expect: Graceful error handling

**Seed:** `tests/seed.spec.ts`

#### 5.1. navigation-links

**File:** `tests/navigation/navigation-links.spec.ts`

**Steps:**

1. From any page, click "Home" in navigation
   - expect: Navigates to index.html
2. Click "Cart"
   - expect: Navigates to cart.html
3. Click "PRODUCT STORE" logo
   - expect: Navigates to index.html

#### 5.2. carousel-navigation

**File:** `tests/navigation/carousel-navigation.spec.ts`

**Steps:**

1. On home page, click carousel next/previous buttons
   - expect: Slides change appropriately
2. Click carousel indicators
   - expect: Jumps to specific slide

### 6. Error Handling

**Seed:** `tests/seed.spec.ts`

#### 6.1. invalid-product-url

**File:** `tests/error-handling/invalid-product-url.spec.ts`

**Steps:**

1. Navigate to invalid product URL (prod.html?idp\_=999)
   - expect: Appropriate error handling or fallback

#### 6.2. network-errors

**File:** `tests/error-handling/network-errors.spec.ts`

**Steps:**

1. Simulate network failure during add to cart
   - expect: Graceful error handling
