import { test } from "@playwright/test";
import testData from "../../utils/testData";
import HomePage_ShoppingCart from "../pages/HomePage_ShoppingCart";

let onHomePageShoppingCart: HomePage_ShoppingCart;

test.beforeEach(async ({ page }) => {
  await page.goto(testData.BASE_URL);
  onHomePageShoppingCart = new HomePage_ShoppingCart(page);
});

test.describe("Shopping cart", () => {
  test("place order", async ({ page }) => {
    await onHomePageShoppingCart.addProductToCart();
    await onHomePageShoppingCart.placeOrder();
  });
});
