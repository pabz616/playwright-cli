import { type Page, type Locator, expect } from "@playwright/test";
import locators from "../pageElements/locators";

class NavigationHeader {
  readonly home_link: Locator;
  readonly contact_link: Locator;
  readonly aboutUs_link: Locator;
  readonly cart_link: Locator;
  readonly logIn_link: Locator;
  readonly SIGN_UP_link: Locator;

  constructor(page: Page) {
    this.home_link = page.locator(locators.HOME);
    this.contact_link = page.locator(locators.CONTACT);
    this.aboutUs_link = page.locator(locators.ABOUT_US);
    this.cart_link = page.locator(locators.CART);
    this.logIn_link = page.locator(locators.LOGIN);
    this.SIGN_UP_link = page.locator(locators.SIGN_UP);
  }

  async verifyNavigationLinks() {
    await expect(this.home_link).toBeVisible();
    await expect(this.home_link).toBeEnabled();
    //
    await expect(this.contact_link).toBeVisible();
    await expect(this.contact_link).toBeEnabled();
    //
    await expect(this.aboutUs_link).toBeVisible();
    await expect(this.aboutUs_link).toBeEnabled();
    //
    await expect(this.cart_link).toBeVisible();
    await expect(this.cart_link).toBeEnabled();
    //
    await expect(this.logIn_link).toBeVisible();
    await expect(this.logIn_link).toBeEnabled();
    //
    await expect(this.SIGN_UP_link).toBeVisible();
    await expect(this.SIGN_UP_link).toBeEnabled();
  }

  async navigateToHome() {
    await this.home_link.click();
  }

  async navigateToContact() {
    await this.contact_link.click();
  }
  async navigateToAboutUs() {
    await this.aboutUs_link.click();
  }
  async navigateToCart() {
    await this.cart_link.click();
  }

  async navigateToLogIn() {
    await this.logIn_link.click();
  }

  async navigateToSignUp() {
    await this.SIGN_UP_link.click();
  }
}

export default NavigationHeader;
