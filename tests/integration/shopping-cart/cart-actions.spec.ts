import { test } from "@playwright/test";
import testData from "../../../utils/testData";
import ShoppingCart from "../../pages/ShoppingCart";

let onShoppingCart: ShoppingCart;

test.beforeEach(async ({ page }) => {
  await page.goto(testData.BASE_URL);
  onShoppingCart = new ShoppingCart(page);
});

test.describe("Demoblaze Product Store - Shopping Cart", () => {
  test("Add Product To Cart", async ({ page }) => {
    await onShoppingCart.addProductToCart();
  });

  test("View Cart", async ({ page }) => {
    await onShoppingCart.addProductToCart();
    await onShoppingCart.viewCart();
  });

  test("Remove Product From Cart", async ({ page }) => {
    await onShoppingCart.addProductToCart();
    await onShoppingCart.removeFromCart();
  });
});
