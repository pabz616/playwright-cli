import { test, expect } from "@playwright/test";
import NavigationHeader from "../pages/HomePage_Navigation";
import testData from "../../utils/testData";

let onHomePageNavigationHeader: NavigationHeader;

test.beforeEach(async ({ page }) => {
  await page.goto(testData.BASE_URL);
  onHomePageNavigationHeader = new NavigationHeader(page);
});

test.describe("Demoblaze Product Store Homepage", () => {
  test("Verify homepage URL", async ({ page }) => {
    await expect(page).toHaveURL(testData.BASE_URL);
  });
  test.skip("Confirm Navigation Links UI", async ({ page }) => {
    onHomePageNavigationHeader.verifyNavigationLinks();
  });
  test("Confirm Navigation to Contact page", async ({ page }) => {
    await onHomePageNavigationHeader.navigateToContact();
    await expect(page.locator("#exampleModal")).toBeVisible();
  });

  test("Confirm Navigation to About Us page", async ({ page }) => {
    await onHomePageNavigationHeader.navigateToAboutUs();
    await expect(page.locator("#videoModal")).toBeVisible();
  });

  test("Navigate to Cart page", async ({ page }) => {
    await onHomePageNavigationHeader.navigateToCart();
    await expect(page).toHaveURL(/cart\.html$/);
  });
  test("Navigate to Log In page", async ({ page }) => {
    await onHomePageNavigationHeader.navigateToLogIn();
    await expect(page.locator("#logInModal")).toBeVisible();
  });
  test("Navigate to Sign Up page", async ({ page }) => {
    await onHomePageNavigationHeader.navigateToSignUp();
    await expect(page.locator("#signInModal")).toBeVisible();
  });
});
