import { type Page, type Locator, expect } from "@playwright/test";
import locators from "../pageElements/locators";

class UserAuthentication {
  private page: Page;
  private signUpLink: Locator;
  private logInLink: Locator;
  private signInModal: Locator;
  private logInModal: Locator;

  constructor(page: Page) {
    this.page = page;
    this.signUpLink = page.locator(locators.SIGN_UP);
    this.logInLink = page.locator(locators.LOG_IN);
    this.signInModal = page.locator(locators.SIGN_IN_MODAL);
    this.logInModal = page.locator(locators.LOG_IN_MODAL);
  }

  async submitSignUpForm() {
    await this.signUpLink.click();
    await expect(this.signInModal).toBeVisible();
    await expect(this.page.locator(locators.SIGN_USERNAME)).toBeVisible();
    await expect(this.page.locator(locators.SIGN_PASSWORD)).toBeVisible();

    const username = `demo_user_${Date.now()}`;

    await this.page.waitForTimeout(1000);
    await this.page.fill(locators.SIGN_USERNAME, username);
    await this.page.fill(locators.SIGN_PASSWORD, "Password123!");

    const [dialog] = await Promise.all([
      this.page.waitForEvent("dialog"),
      this.page.locator(locators.SIGN_UP_BUTTON).click(),
    ]);

    expect(dialog.message()).toContain("Sign up successful");
    await dialog.accept();
    await this.page.keyboard.press("Escape");
  }

  async signUpValidation() {
    await expect(this.signUpLink).toBeVisible();
    await this.page.evaluate(() => {
      const link = document.querySelector("#signin2");
      if (link) (link as HTMLElement).click();
    });

    const emptyDialogPromise = this.page.waitForEvent("dialog");
    await this.page.evaluate(() => {
      const button = document.querySelector<HTMLButtonElement>(
        "#signInModal button.btn-primary",
      );
      if (button) setTimeout(() => button.click(), 0);
    });

    const emptyDialog = await emptyDialogPromise;
    expect(emptyDialog.message()).toMatch(/Please fill|empty|username/i);
    await emptyDialog.accept();

    await expect(this.signInModal).toBeVisible();
    const username = `demo_user_${Date.now()}`;
    //TODO - Tests fail to find element
    await this.page.fill(locators.SIGN_USERNAME, username);
    await this.page.fill(locators.SIGN_PASSWORD, "Password123!");

    await expect(this.signInModal).toBeVisible();
    const successDialogPromise = this.page.waitForEvent("dialog");
    await this.page.locator(locators.SIGN_UP_BUTTON).click();
    const successDialog = await successDialogPromise;
    await successDialog.accept();

    await expect(this.signUpLink).toBeVisible();
    await this.page.evaluate(() => {
      const link = document.querySelector("#signin2");
      if (link) (link as HTMLElement).click();
    });
    await expect(this.signInModal).toBeVisible();

    await this.page.fill(locators.SIGN_USERNAME, username);
    await this.page.fill(locators.SIGN_PASSWORD, "Password123!");
    await this.page.waitForTimeout(500);

    await expect(this.signInModal).toBeHidden();
  }

  async logIn() {
    const username = `user_login_${Date.now()}`;

    await this.signUpLink.click();
    await this.page.fill(locators.SIGN_USERNAME, username);
    await this.page.fill(locators.SIGN_PASSWORD, "Password123!");
    const signUpDialogPromise = this.page.waitForEvent("dialog");
    await this.page.locator(locators.SIGN_UP_BUTTON).click();
    const signUpDialog = await signUpDialogPromise;
    await signUpDialog.accept();

    await this.logInLink.click();
    await expect(this.logInModal).toBeVisible();
    await this.page.fill(locators.LOGIN_USERNAME, username);
    await this.page.fill(locators.LOGIN_PASSWORD, "Password123!");

    await this.page.locator(locators.LOG_IN_BUTTON).click();
    await expect(this.page.locator(locators.NAME_OF_USER)).toContainText(
      username,
    );
  }

  async logInValidation() {
    await this.logInLink.click();
    await expect(this.logInModal).toBeVisible();

    await this.page.locator(locators.LOG_IN_BUTTON).click();

    await this.page.fill(locators.LOGIN_USERNAME, "not_a_user");
    await this.page.fill(locators.LOGIN_PASSWORD, "wrongpassword");
    await this.page.locator(locators.LOG_IN_BUTTON).click();
  }
}

export default UserAuthentication;
