import { type Page, type Locator, expect } from "@playwright/test";
import locators from "../pageElements/locators";

class Carousel {
  private page: Page;
  private activeSlide: Locator;
  private nextButton: Locator;
  private prevButton: Locator;
  private indicators: Locator;

  constructor(page: Page) {
    this.page = page;
    this.activeSlide = page.locator(locators.ACTIVE_SLIDE);
    this.nextButton = page.locator(locators.NEXT_BUTTON);
    this.prevButton = page.locator(locators.PREV_BUTTON);
    this.indicators = page.locator(locators.INDICATORS);
  }

  async verifyCarouselUI() {
    await expect(this.activeSlide).toBeVisible();
    //
    await expect(this.nextButton).toBeVisible();
    await expect(this.nextButton).toBeEnabled();
    //
    await expect(this.prevButton).toBeVisible();
    await expect(this.prevButton).toBeEnabled();
    //

    if ((await this.indicators.count()) > 1) {
      await this.indicators.nth(1).click();
      await expect(this.activeSlide).toBeVisible();
    }
  }
}

export default Carousel;
