import { test } from "@playwright/test";
import testData from "../../utils/testData";
import ShoppingCart from "../pages/ShoppingCart";

let onShoppingCart: ShoppingCart;

test.beforeEach(async ({ page }) => {
  await page.goto(testData.BASE_URL);
  onShoppingCart = new ShoppingCart(page);
});

test.describe("Shopping cart", () => {
  test("place order", async ({ page }) => {
    await onShoppingCart.addProductToCart();
    await onShoppingCart.placeOrder();
  });
});
