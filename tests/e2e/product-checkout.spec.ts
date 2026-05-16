import { test, expect } from "@playwright/test";
const { testData } = require("../../utils/testData");
import ShoppingCart from "../pages/ShoppingCart";
import HomePage_ProductBrowsing from "../pages/ProductBrowsing";
import LoginForm from "../pages/Login";

let onShoppingCart: ShoppingCart;
let onLoginForm: LoginForm;
let onHomePageProductBrowsing: HomePage_ProductBrowsing;

test.beforeEach(async ({ page }) => {
  await page.goto(testData.BASE_URL);
  onShoppingCart = new ShoppingCart(page);
  onLoginForm = new LoginForm(page);
  onHomePageProductBrowsing = new HomePage_ProductBrowsing(page);
});

test.describe("Demoblaze Product Store - Checkout Workflow", () => {
  test("Guest Checkout - Place single order", async ({ page }) => {
    await onShoppingCart.addProductToCart();
    await onShoppingCart.confirmCartUIElements();
    await onShoppingCart.placeOrder();
  });

  test("Logged In Checkout - Place single order", async ({ page }) => {
    await onLoginForm.submitValidLogin(testData.USN, testData.PWD);
    await onShoppingCart.addProductToCart();
    await onShoppingCart.confirmCartUIElements();
    await onShoppingCart.placeOrder();
  });

  test("Random Product Checkout - Add a randomly selected product", async ({
    page,
  }) => {
    const randomProduct = await onShoppingCart.addRandomProductToCart();
    await onShoppingCart.viewCart();
    await onShoppingCart.confirmItemsInCart();
    await onShoppingCart.confirmCartUIElements();
    await onShoppingCart.placeOrder();
    await onShoppingCart.verifyOrderConfirmation();
    await expect(randomProduct).toBeTruthy();
  });

  test("Checkout with all identical products", async ({ page }) => {
    const productName = await onShoppingCart.addSameProductMultipleTimes(0, 3);
    const productsAdded = page.locator("#tbodyid tr");

    await onShoppingCart.viewCart();
    expect(productName).toBeTruthy();
    await expect(productsAdded).toHaveCount(3);
    await onShoppingCart.confirmCartUIElements();
    await onShoppingCart.placeOrder();
  });

  test("Checkout with one phone, one laptop, and one monitor", async ({
    page,
  }) => {
    const productsAdded = page.locator("#tbodyid tr");

    await onShoppingCart.addProductToCartByIndex(0);
    await onShoppingCart.returnHome();

    await onHomePageProductBrowsing.filterByCategory("Laptops");
    await onShoppingCart.addProductToCartByIndex(0);
    await onShoppingCart.returnHome();

    await onHomePageProductBrowsing.filterByCategory("Monitors");
    await onShoppingCart.addProductToCartByIndex(0);

    await onShoppingCart.viewCart();
    await expect(productsAdded).toHaveCount(3);
    await onShoppingCart.confirmCartUIElements();
    await onShoppingCart.placeOrder();
  });
});
