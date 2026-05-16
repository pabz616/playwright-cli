import { test } from "@playwright/test";
import testData from "../../../utils/testData";
import ShoppingCart from "../../pages/ShoppingCart";

let onShoppingCart: ShoppingCart;

test.beforeEach(async ({ page }) => {
  await page.goto(testData.BASE_URL);
  onShoppingCart = new ShoppingCart(page);
});

test.afterEach(async ({ page }) => {
  await page.close();
});

test.describe("Demoblaze Product Store - Shopping Cart Checkout", () => {
  test("Confirm cart order form fields and complete purchase", async ({
    page,
  }) => {
    await onShoppingCart.addProductToCart();
    await onShoppingCart.viewCart();
    await onShoppingCart.confirmCartUIElements();
    await onShoppingCart.placeOrder();
    await onShoppingCart.verifyOrderConfirmation();
  });
});
