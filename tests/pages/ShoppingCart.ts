import { type Page, type Locator, expect } from "@playwright/test";
import locators from "../pageElements/locators";
const { testData } = require("../../../utils/testData");

class ShoppingCart {
  private page: Page;
  private firstProductTitle: Locator;
  private productTitleLinks: Locator;
  private addToCartButton: Locator;
  private cartLink: Locator;
  private cartTable: Locator;
  private placeOrderButton: Locator;
  private orderModal: Locator;
  private deleteButton: Locator;
  private homeLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.firstProductTitle = page.locator(locators.FIRST_PRODUCT_TITLE).first();
    this.productTitleLinks = page.locator(locators.PRODUCT_TITLE);
    this.addToCartButton = page.locator(locators.ADD_TO_CART_BUTTON);
    this.cartLink = page.locator(locators.CART);
    this.cartTable = page.locator(locators.CART_TABLE);
    this.placeOrderButton = page.locator(locators.PLACE_ORDER_BUTTON);
    this.orderModal = page.locator(locators.ORDER_MODAL);
    this.deleteButton = page.locator("#tbodyid tr a", { hasText: "Delete" });
    this.homeLink = page.locator(locators.HOME);
  }

  async confirmCartUIElements() {
    await this.cartLink.click();
    await this.placeOrderButton.click();
    await expect(this.orderModal).toBeVisible();
    await expect(this.page.locator(locators.NAME_INPUT)).toBeVisible();
    await expect(this.page.locator(locators.NAME_INPUT)).toBeEditable();

    await expect(this.page.locator(locators.COUNTRY_INPUT)).toBeVisible();
    await expect(this.page.locator(locators.COUNTRY_INPUT)).toBeEditable();

    await expect(this.page.locator(locators.CITY_INPUT)).toBeVisible();
    await expect(this.page.locator(locators.CITY_INPUT)).toBeEditable();

    await expect(this.page.locator(locators.CARD_INPUT)).toBeVisible();
    await expect(this.page.locator(locators.CARD_INPUT)).toBeEditable();

    await expect(this.page.locator(locators.MONTH_INPUT)).toBeVisible();
    await expect(this.page.locator(locators.MONTH_INPUT)).toBeEditable();

    await expect(this.page.locator(locators.YEAR_INPUT)).toBeVisible();
    await expect(this.page.locator(locators.YEAR_INPUT)).toBeEditable();

    // Close the modal after confirming elements
    await this.page.locator("#orderModal .btn-secondary").click();
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

  async addProductToCartByIndex(index: number) {
    await this.page.waitForSelector(locators.PRODUCT_TITLE);
    const product = this.productTitleLinks.nth(index);
    const productName = (await product.textContent())?.trim() ?? "";
    await product.click();

    const [dialog] = await Promise.all([
      this.page.waitForEvent("dialog"),
      this.addToCartButton.click(),
    ]);
    expect(dialog.message()).toContain("Product added");
    await dialog.accept();

    return productName;
  }

  async addProductToCartFromCurrentProductDetails(times = 1) {
    await this.page.waitForSelector(locators.ADD_TO_CART_BUTTON);
    for (let i = 0; i < times; i += 1) {
      const [dialog] = await Promise.all([
        this.page.waitForEvent("dialog"),
        this.addToCartButton.click(),
      ]);
      expect(dialog.message()).toContain("Product added");
      await dialog.accept();
    }
  }

  async addRandomProductToCart() {
    await this.page.waitForSelector(locators.PRODUCT_TITLE);
    const count = await this.productTitleLinks.count();
    const randomIndex = Math.floor(Math.random() * count);
    return this.addProductToCartByIndex(randomIndex);
  }

  async addSameProductMultipleTimes(index: number, times: number) {
    const productName = await this.addProductToCartByIndex(index);
    if (times > 1) {
      await this.addProductToCartFromCurrentProductDetails(times - 1);
    }
    return productName;
  }

  async returnHome() {
    await this.homeLink.click();
    await this.page.waitForURL(/demoblaze\.com(\/|\/index\.html)?$/);
  }

  async confirmItemsInCart(expectedCount = 1) {
    await expect(this.page.locator("#tbodyid tr")).toHaveCount(1);
  }

  async getCartRowCount() {
    await this.cartLink.click();
    return this.page.locator(locators.CART_ROWS).count();
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
    await this.deleteButton.first().click();
    if (rowsBefore > 0) {
      await expect(this.page.locator(locators.CART_ROWS)).toHaveCount(
        Math.max(0, rowsBefore - 1),
      );
    }
  }

  async placeOrder() {
    await this.cartLink.click();
    await this.placeOrderButton.click();
    await this.page.fill(locators.NAME_INPUT, testData.NAME);
    await this.page.fill(locators.COUNTRY_INPUT, testData.COUNTRY);
    await this.page.fill(locators.CITY_INPUT, testData.CITY);
    await this.page.fill(locators.CARD_INPUT, testData.CARD);
    await this.page.fill(locators.MONTH_INPUT, testData.MONTH);
    await this.page.fill(locators.YEAR_INPUT, testData.YEAR);
    await this.page.locator(locators.PURCHASE_BUTTON).click();
    await expect(this.page.locator(locators.SUCCESS_ALERT)).toHaveText(
      testData.ORDER_MSG,
    );
  }

  async verifyOrderConfirmation() {
    await expect(this.page.locator(".sweet-alert h2")).toHaveText(
      testData.ORDER_MSG,
    );
  }
}

export default ShoppingCart;
