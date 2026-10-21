"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
const locators_1 = __importDefault(require("../pageElements/locators"));
class Carousel {
    page;
    activeSlide;
    nextButton;
    prevButton;
    indicators;
    constructor(page) {
        this.page = page;
        this.activeSlide = page.locator(locators_1.default.ACTIVE_SLIDE);
        this.nextButton = page.locator(locators_1.default.NEXT_BUTTON);
        this.prevButton = page.locator(locators_1.default.PREV_BUTTON);
        this.indicators = page.locator(locators_1.default.INDICATORS);
    }
    async verifyCarouselUI() {
        await (0, test_1.expect)(this.activeSlide).toBeVisible();
        await (0, test_1.expect)(this.nextButton).toBeVisible();
        await (0, test_1.expect)(this.nextButton).toBeEnabled();
        await (0, test_1.expect)(this.prevButton).toBeVisible();
        await (0, test_1.expect)(this.prevButton).toBeEnabled();
        if ((await this.indicators.count()) > 1) {
            await this.indicators.nth(1).click();
            await (0, test_1.expect)(this.activeSlide).toBeVisible();
        }
    }
}
exports.default = Carousel;
