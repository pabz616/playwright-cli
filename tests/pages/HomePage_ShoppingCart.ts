import { type Page, type Locator, expect } from "@playwright/test";
import locators from "../pageElements/locators";

class HomePage_ShoppingCart {
  private page: Page;
  private firstProductTitle: Locator;
  private addToCartButton: Locator;
  private cartLink: Locator;
  private cartTable: Locator;
  private placeOrderButton: Locator;
  private orderModal: Locator;

  constructor(page: Page) {
    this.page = page;
    this.firstProductTitle = page.locator(locators.FIRST_PRODUCT_TITLE).first();
    this.addToCartButton = page.locator(locators.ADD_TO_CART_BUTTON);
    this.cartLink = page.locator(locators.CART);
    this.cartTable = page.locator(locators.CART_TABLE);
    this.placeOrderButton = page.locator(locators.PLACE_ORDER_BUTTON);
    this.orderModal = page.locator(locators.ORDER_MODAL);
  }

  async addProductToCart() {
    await this.firstProductTitle.click();
    const [dialog] = await Promise.all([
      this.page.waitForEvent("dialog"),
      this.addToCartButton.click(),
    ]);
    expect(dialog.message()).toContain("Product added");
    await dialog.accept();
  }

  async viewCart() {
    await this.cartLink.click();
    await expect(this.page).toHaveURL(/cart\.html$/);
    await expect(this.cartTable).toBeVisible();
    await expect(this.page.locator(locators.CART_PIC_HEADER)).toBeVisible();
    await expect(this.page.locator(locators.CART_TITLE_HEADER)).toBeVisible();
    await expect(this.page.locator(locators.CART_PRICE_HEADER)).toBeVisible();
    await expect(this.page.locator(locators.CART_DELETE_HEADER)).toBeVisible();
    await expect(this.page.locator(locators.CART_TOTAL)).toHaveCount(1);
    await expect(this.placeOrderButton).toBeVisible();
  }

  async removeFromCart() {
    await this.cartLink.click();
    const rowsBefore = await this.page.locator(locators.CART_ROWS).count();
    await this.page
      .locator("#tbodyid tr a", { hasText: "Delete" })
      .first()
      .click();
    if (rowsBefore > 0) {
      await expect(this.page.locator(locators.CART_ROWS)).toHaveCount(
        Math.max(0, rowsBefore - 1),
      );
    }
  }

  async placeOrder() {
    await this.cartLink.click();
    await this.placeOrderButton.click();
    await expect(this.orderModal).toBeVisible();
    await expect(this.page.locator(locators.NAME_INPUT)).toBeVisible();
    await expect(this.page.locator(locators.COUNTRY_INPUT)).toBeVisible();
    await expect(this.page.locator(locators.CITY_INPUT)).toBeVisible();
    await expect(this.page.locator(locators.CARD_INPUT)).toBeVisible();
    await expect(this.page.locator(locators.MONTH_INPUT)).toBeVisible();
    await expect(this.page.locator(locators.YEAR_INPUT)).toBeVisible();

    await this.page.fill(locators.NAME_INPUT, "Demo Tester");
    await this.page.fill(locators.COUNTRY_INPUT, "USA");
    await this.page.fill(locators.CITY_INPUT, "New York");
    await this.page.fill(locators.CARD_INPUT, "4111111111111111");
    await this.page.fill(locators.MONTH_INPUT, "12");
    await this.page.fill(locators.YEAR_INPUT, "2026");

    await this.page.locator(locators.PURCHASE_BUTTON).click();
    await expect(this.page.locator(locators.SUCCESS_ALERT)).toHaveText(
      /Thank you for your purchase!/i,
    );
  }
}

export default HomePage_ShoppingCart;
