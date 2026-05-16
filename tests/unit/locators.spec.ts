import locators from '../pageElements/locators';

describe('Demoblaze locator definitions', () => {
  test('defines navigation selectors for the main site links', () => {
    expect(locators.HOME).toBe('text=Home');
    expect(locators.CONTACT).toContain('Contact');
    expect(locators.ABOUT_US).toContain('About us');
    expect(locators.CART).toContain('Cart');
    expect(locators.LOG_IN).toContain('Log in');
    expect(locators.SIGN_UP).toBe('#signin2');
  });

  test('defines category selectors for the product filters', () => {
    expect(locators.PHONES_CATEGORY).toContain('Phones');
    expect(locators.LAPTOPS_CATEGORY).toContain('Laptops');
    expect(locators.MONITORS_CATEGORY).toContain('Monitors');
  });

  test('defines product detail selectors used by the page objects', () => {
    expect(locators.PRODUCT_NAME).toBe('.name');
    expect(locators.ADD_TO_CART_BUTTON).toContain('Add to cart');
    expect(locators.CART_TABLE).toBe('.table-responsive');
  });
});