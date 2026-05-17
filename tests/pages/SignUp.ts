import { type Page, type Locator, expect } from "@playwright/test";
import locators from "../pageElements/locators";
import testData from "../../utils/testData";

const username = testData.USN;
const password = testData.PWD;

class SignUp {
  private page: Page;
  private signUpLink: Locator;
  private signInModal: Locator;

  constructor(page: Page) {
    this.page = page;
    this.signUpLink = page.locator(locators.SIGN_UP);
    this.signInModal = page.locator(locators.SIGN_IN_MODAL);
  }

  async completeAndSubmitForm() {
    await this.signUpLink.click();
    await expect(this.signInModal).toBeVisible();
    await this.page.fill(locators.SIGN_USERNAME, username);
    await this.page.fill(locators.SIGN_PASSWORD, password);

    const [dialog] = await Promise.all([
      this.page.waitForEvent("dialog"),
      this.page.locator(locators.SIGN_UP_BUTTON).click(),
    ]);

    expect(dialog.message()).toContain("This user already exist.");
    await dialog.accept();
    await this.page.keyboard.press("Escape");
    await expect(this.signInModal).toBeHidden();
  }

  async verifySignUpValidation() {
    // SIGN UP LINK ON THE HOME PAGE
    await expect(this.signUpLink).toBeVisible();
    this.signUpLink.click();

    // ON-CLICK, DISPLAY SIGN UP MODAL
    await expect(this.signInModal).toBeVisible();
    await this.page.locator(locators.SIGN_UP_BUTTON).click();

    // VALIDATE FORM FIELDS
    await expect(this.page.locator(locators.SIGN_USERNAME)).toBeVisible();
    await expect(this.page.locator(locators.SIGN_USERNAME)).toBeEditable();
    await expect(this.page.locator(locators.SIGN_USERNAME)).toBeEmpty();
    //
    await expect(this.page.locator(locators.SIGN_PASSWORD)).toBeVisible();
    await expect(this.page.locator(locators.SIGN_PASSWORD)).toBeEditable();
    await expect(this.page.locator(locators.SIGN_PASSWORD)).toBeEmpty();
  }
}

export default SignUp;
