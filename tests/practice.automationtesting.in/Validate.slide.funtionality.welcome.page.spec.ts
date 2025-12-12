import { test, expect } from '@playwright/test';
test.describe('slide test', () => {
  
  // Runs before each test
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('https://practice.automationtesting.in/', { timeout: 120000 });
    console.log('Page loaded successfully');
  });

  test('Validate slide funtionality', async ({ page }) => {
  test.setTimeout(1200000);
    //lading image slide validation
  await expect(page.getByRole('img', { name: 'Shop Selenium Books' })).toBeVisible();
    console.log('Main banner visible');

    // Click on the next slide button
    await page.locator('#n2-ss-6-arrow-next').getByRole('img', { name: 'Arrow' }).click();

    // Validate the second slide is visible
    await expect(page.getByRole('img', { name: 'HTML', exact: true })).toBeVisible();

    // Click on the next buttton agian
    await page.locator('#n2-ss-6-arrow-next').getByRole('img', { name: 'Arrow' }).click();
    // Validate the third slide is visible
    await expect(page.getByRole('img', { name: 'JavaScript', exact: true })).toBeVisible();

// Click on the next button agian
    await page.locator('#n2-ss-6-arrow-next').getByRole('img', { name: 'Arrow' }).click();

// Validate the fourth slide is visible and back to first slide
    await expect(page.getByRole('img', { name: 'Shop Selenium Books' })).toBeVisible();
  console.log('Slide functionality working fine');

// validate slide previous button functionality
await expect(page.getByRole('img', { name: 'Shop Selenium Books' })).toBeVisible();

    // Click on the previous slide button
    await page.locator('#n2-ss-6-arrow-previous').getByRole('img', { name: 'Arrow' }).click();
    await expect(page.getByRole('img', { name: 'JavaScript', exact: true })).toBeVisible();

    // Click on the previous slide button again
    await page.locator('#n2-ss-6-arrow-previous').getByRole('img', { name: 'Arrow' }).click();
    await expect(page.getByRole('img', { name: 'HTML', exact: true })).toBeVisible();

    // Click on the previous slide button again
    await page.locator('#n2-ss-6-arrow-previous').getByRole('img', { name: 'Arrow' }).click();
    await expect(page.getByRole('img', { name: 'Shop Selenium Books' })).toBeVisible();

    //click foward to validate again once more

    await page.locator('#n2-ss-6-arrow-next').getByRole('img', { name: 'Arrow' }).click();
    await expect(page.getByRole('img', { name: 'HTML', exact: true })).toBeVisible();


    console.log('Previous button functionality working fine');

     });
      });
