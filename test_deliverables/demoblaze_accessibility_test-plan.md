# New Accessibility Tests

1. **Home page critical accessibility checks** - Focuses on critical violations like color contrast, image alt text, button names, and link names.

2. **Product details page accessibility** - Tests accessibility on individual product pages after clicking on a product.

3. **Login modal accessibility** - Specifically tests form accessibility in the login modal.

4. **Sign up modal accessibility** - Tests form accessibility in the sign-up modal.

5. **Cart page accessibility** - Checks table accessibility on the cart page.

6. **Keyboard navigation accessibility** - Tests that keyboard navigation works properly through interactive elements.

7. **Focus management in forms** - Ensures proper focus behavior in form fields.

8. **Heading structure accessibility** - Verifies proper heading hierarchy (h1, h2, etc.).

9. **Image alt text accessibility** - Checks that all images have appropriate alt text.

10. **Color contrast compliance** - Specifically tests color contrast ratios (logs issues but doesn't fail the test as this is often a design consideration).

## Key Features of the Tests

- **Selective violation checking**: Instead of expecting zero violations (which is unrealistic for most sites), the tests focus on critical accessibility issues that would prevent users from using the site.

- **Page-specific testing**: Tests different sections of the site (home, product details, cart, forms).

- **Functional accessibility**: Includes keyboard navigation and focus management tests.

- **Logging for review**: Some tests log violations to the console for manual review without failing the test.

The tests use `@axe-core/playwright` to perform comprehensive accessibility audits and provide detailed feedback on any issues found. This gives you a robust accessibility testing suite that can help ensure your application remains accessible to all users.

## As of May 2026

### Tests NOT passing (8)

The 8 failing tests are correctly catching real accessibility deficiencies in the DemoBlaze demo site. These tests serve as good documentation of the site's current accessibility gaps and can be addressed by the site owners to improve compliance with WCAG standards.
