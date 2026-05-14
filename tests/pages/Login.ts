import { type Page, type Locator, expect } from "@playwright/test";
import locators from "../pageElements/locators";

class LoginForm {
  private page: Page;
  private logInLink: Locator;
  private logInModal: Locator;
  private loginUsernameInput: Locator;
  private loginPasswordInput: Locator;
  private logInButton: Locator;
  private nameOfUser: Locator;
  private logOutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.logInLink = page.locator(locators.LOG_IN);
    this.logInModal = page.locator(locators.LOG_IN_MODAL);
    this.loginUsernameInput = page.locator(locators.LOGIN_USERNAME);
    this.loginPasswordInput = page.locator(locators.LOGIN_PASSWORD);
    this.logInButton = page.locator(locators.LOG_IN_BUTTON);
    this.nameOfUser = page.locator(locators.NAME_OF_USER);
    this.logOutButton = page.locator(locators.LOG_OUT_BUTTON);
  }

    async submitValidLogin(usn: string, pwd: string) {
   
    await this.logInLink.click();
    await this.loginUsernameInput.fill(usn);
    await this.loginPasswordInput.fill(pwd);
    await this.logInButton.click();
    await expect(this.nameOfUser).toBeVisible();
    await expect(this.nameOfUser).toHaveText(`Welcome ${usn}`);
    await expect(this.logOutButton).toBeVisible();
    //
    await this.logOutButton.click();
    await expect(this.logInLink).toBeVisible();
  }

  async submitLogInForm(usn: string, pwd: string) {
    await this.logInLink.click();
    await this.loginUsernameInput.fill(usn);
    await this.loginPasswordInput.fill(pwd);
    await this.logInButton.click();
  }

  async verifyLogInValidation() {
    await this.logInLink.click();
    await expect(this.logInModal).toBeVisible();

    await this.page.locator(locators.LOG_IN_BUTTON).click();

    await this.page.fill(locators.LOGIN_USERNAME, "not_a_user");
    await this.page.fill(locators.LOGIN_PASSWORD, "wrongpassword");
    await this.page.locator(locators.LOG_IN_BUTTON).click();
  }
}

export default LoginForm;
