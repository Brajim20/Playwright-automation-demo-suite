import { test, expect, Locator } from '@playwright/test';
test.describe('my account test', () => {
  
  // Runs before each test
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('https://practice.automationtesting.in/', { timeout: 120000 });
    console.log('shop ui validation Page loaded successfully');
  });

  test('Validate forgot password funtionality', async ({ page }) => {
  test.setTimeout(1200000);

// my account locator and locate the login page
await page.getByRole('link', { name: 'My Account', exact: true }).click();

// lost yourt password link
await expect(page.getByRole('link', { name: 'Lost your password?' })).toBeVisible();
await page.getByRole('link', { name: 'Lost your password?' }).click();

// forgot password page validation
await expect(page.getByText('Lost your password? Please')).toBeVisible();
await expect(page.getByText('Username or email', { exact: true })).toBeVisible();
await expect(page.getByRole('textbox', { name: 'Username or email' })).toBeVisible();
await expect(page.getByRole('button', { name: 'Reset Password' })).toBeVisible();

const randomNumber = Math.floor(Math.random() * 1000000000);

// enter registered email id
await page.getByRole('textbox', { name: 'Username or email' }).fill('TestUser' + randomNumber + '@example.com');
await page.getByRole('button', { name: 'Reset Password' }).click();

//validate invalid user message
await expect(page.getByText('Invalid username or e-mail.')).toBeVisible();

// enter valid email id
await page.getByRole('textbox', { name: 'Username or email' }).fill('TestUser1765553247158@example.com');
await page.waitForTimeout(1000);
await page.getByRole('button', { name: 'Reset Password' }).click();

// validate reset password message
await expect(page.getByText('Password reset email has been sent.')).toBeVisible();
console.log('Forgot password functionality working fine');

// validate the the  bottom message 
await expect(page.locator('#page-36')).toContainText('A password reset email has been sent to the email address on file for your account, but may take several minutes to show up in your inbox. Please wait at least 10 minutes before attempting another reset.');
await expect(page.locator('#content')).toBeVisible();

//console log
console.log('Forgot password page validated successfully');



    });
      });