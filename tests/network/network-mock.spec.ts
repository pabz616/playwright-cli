"INTERCEPTING AND CONTROLLING NETWORK RESPONSES IN TESTS"

import { test, expect } from "@playwright/test";
import testData from "../../utils/testData";

test.beforeEach(async ({ page }) => {
    await page.goto(testData.QAPLAYGROUND_NTWK);
});

test.afterEach(async ({ page }) => {
    await page.close();
});

test.describe("Network Mocking and Interception", () => {
    test("Intercepting and Controlling Network Responses", async ({ page }) => {
        await page.route("**/api/products", (route) => 
        route.fulfill({
            json:{ products: [{ id: 1, name: "Mocked Product", price: 99.99 }] },}) );

        await page.getByRole("button", { name: "Load Products" }).click();
        await expect(page.url()).toContain("/network/mocking");
        await expect(page.getByRole('cell', { name: 'Mocked Product' })).toBeVisible();
    });
    
    test("Modify Network Response", async ({ page }) => {
        await page.route("**/api/products?*", async (route) => {
            const response = await route.fetch();
            const body = await response.json();
            
            // Modify the response body to inject a new product
            body.products.push({ id: 100, name: 'Injected Product', price: 1 });
            
            // Fulfill the request with the modified response
            await route.fulfill({ response, json: body });

            // Assertions to verify the modified response
            await expect(response.status()).toBe(200);
            await expect(body.products).toBeDefined();
            await expect(body.products.length).toBeGreaterThan(1);
            //
            await expect(body.products["id"]).toBeVisible();
            await expect(body.products["price"]).not.toBe(0);
            await expect(body.products["id"]).not.toContainText("100");
            //
            await expect(body.products["name"]).toBeVisible();
            await expect(body.products["name"]).toContainText("Injected Product");
            //
            await expect(body.products["price"]).toBeDefined();
            await expect(body.products["price"]).toBeGreaterThan(0);
            await expect(body.products["price"]).not.toContainText("1");
        })        
    });

    test("Simulate Internal Server Error - 5XX", async ({ page }) => {
        await page.route("**/api/notifications", (route) => {
            route.fulfill({
                status: 503,
                contentType: 'application/json',
                body: JSON.stringify({ error: 'Internal Server Error' }),
            });
        });
    });

    test("Simulate Resource Not Found Error - 4XX", async ({ page }) => {
        await page.route("**/api/notifications", (route) => {
            route.fulfill({
                status: 404,
                contentType: 'application/json',
                body: JSON.stringify({ error: 'Resource Not Found' }),
            });
        });
    });

    test("Simulate Redirection - 3XX", async ({ page }) => {
        await page.route("**/api/notifications", (route) => {
            route.fulfill({
                status: 301,
                contentType: 'application/json',
                body: JSON.stringify({ error: 'Moved Permanently' }),
            });
        });
    });
});