import { test, expect, Locator } from '@playwright/test';
test.describe('my account test', () => {
  
  // Runs before each test
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('https://practice.automationtesting.in/', { timeout: 120000 });
    console.log('shop ui validation Page loaded successfully');
  });

  test('Validate  register account funtionality', async ({ page }) => {
      test.setTimeout(1200000);
  // myaccount locator and locate the login page
    await page.getByRole('link', { name: 'My Account' }).click();
    await expect(page.getByRole('heading', { name: 'Register' })).toBeVisible();
    await expect(page.getByText('Email address *', { exact: true })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Email address *', exact: true })).toBeVisible();
    await expect(page.getByText('Password *').nth(1)).toBeVisible();
    await expect(page.locator('#reg_password')).toBeVisible();
    await expect(page.getByRole('paragraph').filter({ hasText: 'Register' })).toBeVisible();
    await expect(page.getByText('Email address * Password * Anti-spam Register')).toBeVisible();
    await expect(page.getByText('Register Email address *')).toBeVisible();

    // Fill in the registration form
    const testEmail = 'TestUser' + Date.now() + '@example.com';
    await page.getByRole('textbox', { name: 'Email address *', exact: true }).fill(testEmail);
    await page.locator('#reg_password').fill('Test@1234@@reg');
    await page.waitForTimeout(2000); // Wait for 2 seconds
     await page.locator('#reg_password').fill('Test@1234@');
     await page.getByRole('button', { name: 'Register' }).dblclick();
      await page.getByRole('button', { name: 'Login' }).click();
     await page.waitForTimeout(2000); 
    await page.getByRole('textbox', { name: 'Email address *', exact: true }).fill(testEmail);
    await page.locator('#reg_password').fill('Test@1234@@reg');
    await page.waitForTimeout(2000); // Wait for 2 seconds
     await page.locator('#reg_password').fill('Test@1234@');
     await page.getByRole('button', { name: 'Register' }).dblclick();
    await page.getByRole('button', { name: 'Register' }).dblclick();
   
  
   
    // Verify successful registration

    await expect(page.getByRole('link', { name: 'shipping and billing addresses' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'edit your password and' })).toBeVisible();
    await expect(page.locator('#content')).toBeVisible();
    await expect(page.getByRole('navigation').filter({ hasText: 'Dashboard Orders Downloads' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Orders', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Addresses', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Account Details', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Logout' })).toBeVisible();
    await page.getByText('Dashboard Orders Downloads Addresses Account Details Logout Hello').click();

// console log for successful registration
    console.log('User registered successfully');



     });
      });