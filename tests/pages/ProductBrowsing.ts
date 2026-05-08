import { type Page, type Locator, expect } from "@playwright/test";
import locators from "../pageElements/locators";

class HomePage_ProductBrowsing {
  private page: Page;
  private phonesCategory: Locator;
  private laptopsCategory: Locator;
  private monitorsCategory: Locator;
  private productCards: Locator;
  private firstProductTitle: Locator;

  constructor(page: Page) {
    this.page = page;
    this.phonesCategory = page.locator(locators.PHONES_CATEGORY);
    this.laptopsCategory = page.locator(locators.LAPTOPS_CATEGORY);
    this.monitorsCategory = page.locator(locators.MONITORS_CATEGORY);
    this.productCards = page.locator(locators.PRODUCT_CARDS);
    this.firstProductTitle = page.locator(locators.FIRST_PRODUCT_TITLE).first();
  }

  async verifyHomePage() {
    await expect(this.page).toHaveTitle(/STORE/);

    await expect(this.page.locator(locators.HOME)).toBeVisible();
    await expect(this.page.locator(locators.CONTACT)).toBeVisible();
    await expect(this.page.locator(locators.ABOUT_US)).toBeVisible();
    await expect(this.page.locator(locators.CART)).toBeVisible();
    await expect(this.page.locator(locators.LOGIN)).toBeVisible();
    await expect(this.page.locator(locators.SIGN_UP)).toBeVisible();

    const carouselItems = this.page.locator(locators.ACTIVE_SLIDE);
    expect(await carouselItems.count()).toBeGreaterThan(0);
    await expect(carouselItems.first()).toBeVisible();

    await expect(this.phonesCategory).toBeVisible();
    await expect(this.laptopsCategory).toBeVisible();
    await expect(this.monitorsCategory).toBeVisible();

    await this.page.waitForSelector(locators.PRODUCT_CARDS);
    // expect(await this.productCards.count()).toBeGreaterThan(0);
    await expect(
      this.productCards.first().locator(locators.PRODUCT_IMAGE),
    ).toBeVisible();
    await expect(
      this.productCards.first().locator(locators.PRODUCT_TITLE),
    ).toBeVisible();
    await expect(
      this.productCards.first().locator(locators.PRODUCT_PRICE),
    ).toBeVisible();
  }

  async filterByCategory(categoryName: string) {
    let categoryLocator: Locator;
    if (categoryName === "Phones") {
      categoryLocator = this.phonesCategory;
    } else if (categoryName === "Laptops") {
      categoryLocator = this.laptopsCategory;
    } else if (categoryName === "Monitors") {
      categoryLocator = this.monitorsCategory;
    } else {
      throw new Error("Unknown category");
    }
    await categoryLocator.click();
    await this.page.waitForSelector(locators.PRODUCT_CARDS);
    // expect(await this.productCards.count()).toBeGreaterThan(0);
    await expect(this.productCards.first().locator(locators.PRODUCT_IMAGE),).toBeVisible();
    await expect(this.productCards.first().locator(locators.PRODUCT_TITLE),).toBeVisible();
    await expect(this.productCards.first().locator(locators.PRODUCT_PRICE),).toBeVisible();
    // await expect(this.productCards.first().locator(locators.PRODUCT_PRICE),).toContainText("$");
  }

  async viewProductDetails() {
    const productTitle = await this.firstProductTitle.textContent();
    await this.firstProductTitle.click();

    await expect(this.page).toHaveURL(/prod\.html\?idp_=\d+/);
    await expect(this.page.locator(locators.PRODUCT_NAME)).toBeVisible();
    await expect(this.page.locator(locators.PRODUCT_NAME)).toContainText(
      productTitle?.trim() || "",
    );
    await expect(
      this.page.locator(locators.PRODUCT_PRICE_CONTAINER),
    ).toBeVisible();
    await expect(this.page.locator(locators.PRODUCT_DESCRIPTION)).toBeVisible();
    await expect(this.page.locator(locators.ADD_TO_CART_BUTTON)).toBeVisible();
  }
}

export default HomePage_ProductBrowsing;
