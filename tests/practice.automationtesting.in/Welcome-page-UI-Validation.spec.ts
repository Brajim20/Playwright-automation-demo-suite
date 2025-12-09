import { test, expect, Page } from '@playwright/test';

test.describe('Welcome Page UI Validation', () => {
  test('Initial load of the page', async ({ page }) => {
	await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('https://practice.automationtesting.in/',{ timeout: 120000 });
 console.log('Welcome page loaded successfully');

  });
});
  test('should validate welcome page UI', async ({ page }) => {

    //validate logo
    await expect(page.locator('#site-logo').getByRole('link', { name: 'Automation Practice Site' })).toBeVisible();
    console.log('Logo is visible');

    // search icon 
    await expect(page.getByRole('textbox', { name: 'Search' })).toBeVisible();

    // validate top menu items
    await expect(page.getByRole('link', { name: 'Shop' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'My Account' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Test Cases' })).toBeVisible();
    





  });

