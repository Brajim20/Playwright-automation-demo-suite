import { test, expect } from '@playwright/test';

test.describe('Welcome Page UI Validation', () => {
  
  // Runs before each test
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('https://practice.automationtesting.in/', { timeout: 120000 });
    console.log('Page loaded successfully');
  });

  test('Validate Welcome Page UI Elements', async ({ page }) => {
      test.setTimeout(1200000);
    // -----------------------
    // LOGO VALIDATION
    // -----------------------
    await expect(page.locator('#site-logo').getByRole('link', { name: 'Automation Practice Site' }))
      .toBeVisible();
    console.log('Logo is visible');


    // -----------------------
    // SEARCH BAR
    // -----------------------
    await expect(page.getByRole('textbox', { name: 'Search' })).toBeVisible();
    console.log('Search is visible');


    // -----------------------
    // TOP MENU ITEMS
    // -----------------------
    const menuItems = [
      'Shop',
      'My Account',
      'Test Cases',
      'AT Site',
      'Demo Site',
      ' 0 items -₹'
    ];
    for (const item of menuItems) {
      await expect(page.getByRole('link', { name: item })).toBeVisible();
    }
    console.log('Top menu items visible');


    // -----------------------
    // DROPDOWN MENU ICON
    // -----------------------
    await expect(page.locator('#header').getByRole('link').filter({ hasText: /^$/ }))
      .toBeVisible();
    console.log('Dropdown menu icon visible');


    // -----------------------
    // MAIN BANNER
    // -----------------------
    await expect(page.getByRole('img', { name: 'Shop Selenium Books' })).toBeVisible();
    console.log('Main banner visible');


    // -----------------------
    // NEW ARRIVALS SECTION
    // -----------------------
    await page.getByRole('heading', { name: 'new arrivals' }).scrollIntoViewIfNeeded();
    await expect(page.locator('#text-22-sub_row_1-0-1-1-0')).toBeVisible();
    console.log('New Arrivals section visible');


    // -----------------------
    // NEW ARRIVALS PRODUCTS
    // -----------------------
    const arrivals = [
      { name: 'Selenium Ruby Selenium Ruby ₹', selector: '#text-22-sub_row_1-0-2-0-0' },
      { name: 'Sale! Thinking in HTML', selector: '#text-22-sub_row_1-0-2-1-0' },
      { name: 'Mastering JavaScript', selector: '#text-22-sub_row_1-0-2-2-0' }
    ];

    for (const product of arrivals) {
      await expect(page.getByRole('link', { name: product.name })).toBeVisible();
      await expect(page.locator(product.selector).getByRole('link', { name: 'Add to basket' }))
        .toBeVisible();
    }

    console.log('New arrivals items visible');


    // -----------------------
    // FOOTER SECTION
    // -----------------------
    await expect(page.locator('.footer-widgets > .col4-1.first')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Subscribe Here' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Your email address' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Subscribe' })).toBeVisible();

    console.log('Footer section visible');
  
  });
});
