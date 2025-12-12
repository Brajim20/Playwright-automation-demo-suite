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

    //validate user can not log in wiht out credentials
    
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.getByRole('list').filter({ hasText: 'Error: Username is required.' })).toBeVisible();
    await expect(page.getByText('Error: Username is required.')).toBeVisible();
    await expect(page.locator('#page-36')).toContainText('Error: Username is required.');
    

   // login 
   await page.getByRole('textbox', { name: 'Username or email address *' }).fill('TestUser1765553247158@example.com');
   await page.locator('#password').fill('Test@1234@');
   await page.waitForTimeout(1000);
   await page.getByRole('button', { name: 'Login' }).click();

// Verify successful login

await expect(page.locator('#content')).toBeVisible();
await expect(page.getByText('From your account dashboard')).toBeVisible();
await expect(page.getByText('Hello TestUser1765553247158 (')).toBeVisible();
await expect(page.getByRole('link', { name: 'shipping and billing addresses' })).toBeVisible();
await expect(page.getByRole('link', { name: 'edit your password and' })).toBeVisible();
await expect(page.getByRole('link', { name: 'recent orders' })).toBeVisible();
await expect(page.getByRole('link', { name: 'shipping and billing addresses' })).toBeVisible();
await expect(page.locator('#page-36')).toContainText('From your account dashboard you can view your recent orders, manage your shipping and billing addresses and edit your password and account details.');
await expect(page.getByRole('link', { name: 'Logout' })).toBeVisible();
console.log('User logged in successfully');

// validate funtionalities of my acocunt  

// click on orders link
await page.getByRole('link', { name: 'recent orders' }).click();
await expect(page.getByText('Go Shop No order has been')).toBeVisible();
await expect(page.getByRole('link', { name: 'Go Shop' })).toBeVisible();

// back to dashboard
await page.getByRole('listitem').filter({ hasText: 'Dashboard' }).click();

// click on downloads link
await page.getByRole('link', { name: 'Downloads' }).click();
await expect(page.getByText('Go Shop No downloads')).toBeVisible();
await expect(page.getByRole('link', { name: 'Go Shop' })).toBeVisible();

// back to dashboard
await page.getByRole('listitem').filter({ hasText: 'Dashboard' }).click();

//  addresses link
await page.getByRole('link', { name: 'Addresses' }).click();
await expect(page.getByText('The following addresses will')).toBeVisible();
await expect(page.getByRole('heading', { name: 'Billing Address' })).toBeVisible();
await expect(page.getByText('You have not set up this type').first()).toBeVisible();
await expect(page.getByRole('heading', { name: 'Shipping Address' })).toBeVisible();
await expect(page.getByText('You have not set up this type').nth(1)).toBeVisible();


// back to dashboard
await page.getByRole('listitem').filter({ hasText: 'Dashboard' }).click();

// click on account details link
await page.getByRole('link', { name: 'Account Details' }).click();
await expect(page.getByText('First name *')).toBeVisible();
await expect(page.getByRole('textbox', { name: 'First name *' })).toBeVisible();
await expect(page.getByText('Email address *')).toBeVisible();
await expect(page.getByRole('textbox', { name: 'Email address *' })).toBeVisible();
await expect(page.getByRole('textbox', { name: 'Last name *' })).toBeVisible();
await expect(page.getByText('Last name *')).toBeVisible();
await expect(page.getByText('Password Change')).toBeVisible();
await expect(page.getByText('Current Password (leave blank')).toBeVisible();
await expect(page.getByRole('textbox', { name: 'Current Password (leave blank' })).toBeVisible();
await expect(page.getByRole('textbox', { name: 'New Password (leave blank to' })).toBeVisible();
await expect(page.getByText('New Password (leave blank to')).toBeVisible();
await expect(page.getByText('Confirm New Password')).toBeVisible();
await expect(page.getByRole('textbox', { name: 'Confirm New Password' })).toBeVisible();
await expect(page.getByRole('button', { name: 'Save changes' })).toBeVisible();

//logout
await page.getByRole('link', { name: 'Logout' }).click();

//confirm logout
await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
console.log('User logged out successfully');

  });
    });