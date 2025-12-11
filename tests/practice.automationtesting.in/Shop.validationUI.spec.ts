import { test, expect } from '@playwright/test';
test.describe('shop test', () => {
  
  // Runs before each test
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('https://practice.automationtesting.in/', { timeout: 120000 });
    console.log('shop ui validation Page loaded successfully');
  });

  test('Validate logo funtionality', async ({ page }) => {

    //  Navigate to Shop page
    await expect(page.getByRole('link', { name: 'Shop' })).toBeVisible();
    await page.getByRole('link', { name: 'Shop' }).click();

    // Validate Shop page UI elements

    await page.getByText('Refine By > Filter by price').click();
    await expect(page.getByRole('heading', { name: 'Filter by price' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Filter' })).toBeVisible();
    await expect(page.getByText('Price: ₹150 — ₹')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Product Categories' })).toBeVisible();
    await expect(page.getByText('Android (1)')).toBeVisible();
    await expect(page.getByText('HTML (3)')).toBeVisible();
    await expect(page.getByText('JavaScript (3)')).toBeVisible();
    await expect(page.getByText('selenium (1)')).toBeVisible();
    await expect(page.getByRole('combobox')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Sale! Android Quick Start' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Functional Programming in JS' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Mastering HTML5 Forms HTML5 Forms ₹' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'HTML5 Web Application' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Selenium Ruby Selenium Ruby ₹' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Mastering JavaScript' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Learning JavaScript Data' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Sale! Thinking in HTML' })).toBeVisible();
    await expect(page.getByText('Sale! Android Quick Start Guide ₹600.00 ₹450.00 Add to basket Functional')).toBeVisible();
    await expect(page.locator('.col4-1').first()).toBeVisible();
    await expect(page.locator('div').filter({ hasText: 'Subscribe Here Subscribe' }).nth(5)).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Your email address' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Subscribe' })).toBeVisible();

    // Final console log message
    console.log('Shop page UI elements are visible and validated successfully');

      });
        });