import { test, expect } from '@playwright/test';
test.describe('logo test', () => {
  
  // Runs before each test
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('https://practice.automationtesting.in/', { timeout: 120000 });
    console.log('Page loaded successfully');
  });

  test('Validate logo funtionality', async ({ page }) => {


    // Validate logo is visible

    await expect(page.locator('#site-logo').getByRole('link', { name: 'Automation Practice Site' })).toBeVisible();
    await expect(page.locator('div').nth(2)).toBeVisible();
    await page.locator('#site-logo').getByRole('link', { name: 'Automation Practice Site' }).click();
    console.log('Logo is visible and clickable, navigated to home page successfully');

    // valite logo click functionality from other page

    await page.getByRole('link', { name: 'Shop' }).click();
    await page.locator('#site-logo').getByRole('link', { name: 'Automation Practice Site' }).click();
    await page.getByRole('link', { name: 'My Account' }).click();
    await page.locator('#site-logo').getByRole('link', { name: 'Automation Practice Site' }).click();
    await page.getByRole('link', { name: 'Test Cases' }).click();
    await page.locator('#site-logo').getByRole('link', { name: 'Automation Practice Site' }).click();

// Validate we are back to home page

await expect(page.locator('div').nth(2)).toBeVisible();
await expect(page.getByText('Automation Practice Site Shop')).toBeVisible();
await expect(page.locator('.row_inner_wrapper').first()).toBeVisible();
console.log('Logo click functionality working fine, navigated to home page successfully from other pages');

// validate from the cart page

await page.getByRole('link', { name: ' 0 items -₹' }).click();
await page.locator('#site-logo').getByRole('link', { name: 'Automation Practice Site' }).click();
await expect(page.locator('#site-logo').getByRole('link', { name: 'Automation Practice Site' })).toBeVisible();

// console log final success message
console.log('Logo functionality working fine from cart page as well, all tests passed successfully');


      });
  });