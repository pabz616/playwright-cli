import { type Page, type Locator, expect } from "@playwright/test";
import locators from "../pageElements/locators";

class StaticPages {
  private page: Page;
  private contactLink: Locator;
  private aboutUsLink: Locator;
  private contactModal: Locator;
  private videoModal: Locator;

  constructor(page: Page) {
    this.page = page;
    this.contactLink = page.locator(locators.CONTACT);
    this.aboutUsLink = page.locator(locators.ABOUT_US);
    this.contactModal = page.locator(locators.CONTACT_MODAL);
    this.videoModal = page.locator(locators.VIDEO_MODAL);
  }

  async contactForm() {
    await this.contactLink.click();
    await expect(this.contactModal).toBeVisible();
    await expect(this.page.locator(locators.RECIPIENT_EMAIL)).toBeVisible();
    await expect(this.page.locator(locators.RECIPIENT_NAME)).toBeVisible();
    await expect(this.page.locator(locators.MESSAGE_TEXT)).toBeVisible();

    await this.page.fill(locators.RECIPIENT_EMAIL, "demo@test.com");
    await this.page.fill(locators.RECIPIENT_NAME, "Demo Tester");
    await this.page.fill(
      locators.MESSAGE_TEXT,
      "This is a demo contact message.",
    );

    await this.page.locator(locators.SEND_MESSAGE_BUTTON).click();
  }

  async aboutUs() {
    await this.aboutUsLink.click();
    await expect(this.videoModal).toBeVisible();
    await expect(this.page.locator(locators.VIDEO_MODAL_BODY)).toBeVisible();
  }
}

export default StaticPages;
