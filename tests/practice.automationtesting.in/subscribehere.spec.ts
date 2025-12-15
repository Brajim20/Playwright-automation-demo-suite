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

  const randomNumber = Math.floor(Math.random() * 1000000000);

// validate subscribe here section 

await expect(page.locator('div').filter({ hasText: 'Subscribe Here Subscribe' }).nth(5)).toBeVisible();
await expect(page.getByRole('textbox', { name: 'Your email address' })).toBeVisible();
await expect(page.getByRole('button', { name: 'Subscribe' })).toBeVisible();


  // find subscribe here link

  await page.getByRole('textbox', { name: 'Your email address' }).fill('TestUser' + randomNumber + '@example.com');

  // click on subscribe button
await page.getByRole('button', { name: 'Subscribe' }).click();
// validate the error message
  await expect(page.getByText('Oops. Something went wrong.')).toBeVisible();
  await expect(page.locator('#mc4wp_form_widget-2')).toContainText('Oops. Something went wrong. Please try again later.');

  // this funtions it not working on this test site. 

  console.log('Subscribe here section validated successfully');

   });
 });
