import { test, expect, Locator } from '@playwright/test';
test.describe('my account test', () => {
  
  // Runs before each test
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('https://practice.automationtesting.in/', { timeout: 120000 });
    console.log('shop ui validation Page loaded successfully');
  });

  test('Validate login funtionality', async ({ page }) => {
  test.setTimeout(1200000);
    // myaccount locator and locate the login page
    await page.getByRole('link', { name: 'My Account' }).click();
    await expect(page.getByText('Login Username or email')).toBeVisible();
    await expect(page.getByText('Username or email address *')).toBeVisible();
    await expect(page.getByText('Password *').first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
    await expect(page.getByText('Remember me')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Lost your password?' })).toBeVisible();

   // 
   // log out after registration
      const testEmail = 'TestUser' + Date.now() + '@example.com';
await page.getByRole('textbox', { name: 'Username or email address *' }).fill(testEmail);
await page.locator('#password').fill('Test@1234');
await page.getByRole('checkbox', { name: 'Remember me' }).check();
await page.getByRole('button', { name: 'Login' }).click();

// Verify successful login
await expect(page.getByRole('link', { name: 'Logout' })).toBeVisible();
console.log('User logged in successfully');





  });
    });