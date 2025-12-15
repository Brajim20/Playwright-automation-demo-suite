import { test, expect, Locator } from '@playwright/test';
test.describe('basket test', () => {
  
  // Runs before each test
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('https://practice.automationtesting.in/', { timeout: 120000 });
    console.log('shop ui validation Page loaded successfully');
  });

  test('Validate add to basket funtionality', async ({ page }) => {
  test.setTimeout(1200000);
  // clear cookies and local storage
  await page.context().clearCookies();
  await page.evaluate(() => localStorage.clear());
  console.log('Cleared cookies and local storage');

//add to basket
await page.locator('#text-22-sub_row_1-0-2-0-0').getByRole('link', { name: 'Add to basket' }).click();
await page.locator('#text-22-sub_row_1-0-2-1-0').getByRole('link', { name: 'Add to basket' }).click();
await page.getByRole('link', { name: 'Add to basket', exact: true }).click();

// Product containers
const product1 = page.locator('#text-22-sub_row_1-0-2-0-0');
const product2 = page.locator('#text-22-sub_row_1-0-2-1-0');
const product3 = page.locator('#text-22-sub_row_1-0-2-2-0');

// Add products to basket
await product1.getByRole('link', { name: 'Add to basket' }).click();
await page.waitForTimeout(2000);   
await product2.getByRole('link', { name: 'Add to basket' }).click();
await page.waitForTimeout(2000); 
await product3.getByRole('link', { name: 'Add to basket' }).click();
await page.waitForTimeout(2000); 


// Validate each product shows "View Basket"
await expect(product1.getByRole('link', { name: 'View Basket' })).toBeVisible();
await expect(product2.getByRole('link', { name: 'View Basket' })).toBeVisible();
await expect(product3.getByRole('link', { name: 'View Basket' })).toBeVisible();

//go to basket

await page.goto('https://practice.automationtesting.in/basket/', { timeout: 120000 });
console.log('Navigated to basket page successfully');

// coupon neg test case 
await expect(page.getByRole('button', { name: 'Apply Coupon' })).toBeVisible();
await expect(page.getByRole('textbox', { name: 'Coupon:' })).toBeVisible();
await expect(page.locator('#body')).toBeVisible();
await expect(page.getByRole('cell', { name: 'Apply Coupon Update Basket' })).toBeVisible();
await expect(page.locator('.wc-proceed-to-checkout')).toBeVisible();
// apply coupon
await page.getByRole('textbox', { name: 'Coupon:' }).fill('krishnasakinala');
await page.getByRole('button', { name: 'Apply Coupon' }).click();
await expect(page.getByText('Sorry, this coupon is not')).toBeVisible();
console.log('Coupon code negative test case validated successfully');


// proceed to checkout
await page.getByRole('link', { name: 'Proceed to Checkout' }).click();


//returning customer 

await expect(page.getByText('Returning customer? Click')).toBeVisible();
await page.getByText('Returning customer? Click').click();
await page.getByRole('link', { name: 'Click here to login' }).click();
await page.waitForTimeout(1000);
await page.getByRole('link', { name: 'Click here to login' }).click();
await expect(page.getByRole('textbox', { name: 'Username or email *' })).toBeVisible();
await expect(page.getByRole('textbox', { name: 'Password *' })).toBeVisible();
await expect(page.getByText('If you have shopped with us')).toBeVisible();
await expect(page.locator('form').filter({ hasText: 'If you have shopped with us' })).toBeVisible();
 
   // login 
   await page.getByRole('textbox', { name: 'Username or email *' }).fill('TestUser1765553247158@example.com');
   await page.getByRole('textbox', { name: 'Password *' }).fill('Test@1234@');
   await page.waitForTimeout(1000);
   await page.getByRole('button', { name: 'Login' }).click();

   
// validate billing details section

await expect(page.getByRole('heading', { name: 'Billing Details' })).toBeVisible();
await expect(page.getByRole('heading', { name: 'Additional Information' })).toBeVisible();
await expect(page.getByText('Billing Details First Name *')).toBeVisible();
await expect(page.getByText('First Name *')).toBeVisible();
await expect(page.getByText('Last Name *')).toBeVisible();
await expect(page.getByText('Email Address *')).toBeVisible();
await expect(page.getByText('Phone *')).toBeVisible();
await expect(page.getByText('Country * India Country *')).toBeVisible();
await expect(page.getByRole('textbox', { name: 'Address *', exact: true })).toBeVisible();
await expect(page.getByRole('textbox', { name: 'Town / City *' })).toBeVisible();
await expect(page.getByText('State / County *').first()).toBeVisible();
await expect(page.getByText('Postcode / ZIP *')).toBeVisible();
await expect(page.getByRole('textbox', { name: 'Postcode / ZIP *' })).toBeVisible();
await expect(page.getByRole('heading', { name: 'Your order' })).toBeVisible();
await expect(page.getByRole('columnheader', { name: 'Product' })).toBeVisible();
await expect(page.getByRole('columnheader', { name: 'Total' })).toBeVisible();


// fill out  the billing details form

await page.getByRole('textbox', { name: 'First Name *' }).fill('test');
await page.getByRole('textbox', { name: 'Last Name *' }).fill('user');
await page.getByRole('textbox', { name: 'Phone *' }).fill('1234567890');
await page.getByRole('textbox', { name: 'Address *', exact: true }).fill('123 Test Street');
await page.getByRole('textbox', { name: 'Town / City *' }).fill('Test City');
await page.getByRole('textbox', { name: 'ZIP *' }).fill('10001');
await page.getByRole('textbox', { name: 'Order Notes' }).fill('Please deliver between 9 AM to 5 PM');
console.log('Billing details filled successfully');


// display payment methods
await expect(page.getByRole('list').filter({ hasText: 'Direct Bank Transfer Make' })).toBeVisible();
await expect(page.getByText('Direct Bank Transfer')).toBeVisible();
await expect(page.getByText('Check Payments')).toBeVisible();
await expect(page.getByText('Cash on Delivery')).toBeVisible();
await expect(page.getByText('PayPal Express Checkout')).toBeVisible();

console.log('Add to basket and checkout process validated successfully');

// select payment method
await page.getByRole('radio', { name: 'Cash on Delivery' }).check();

// place order

await page.getByRole('button', { name: 'Place order' }).click();

// order confirmation
await expect(page.getByText('Thank you. Your order has')).toBeVisible();
await expect(page.getByText('Order Number:')).toBeVisible();
await expect(page.getByText('Pay with cash upon delivery.')).toBeVisible();
await expect(page.getByRole('heading', { name: 'Order Details' })).toBeVisible();
await expect(page.locator('#body')).toBeVisible();
await expect(page.getByRole('heading', { name: 'Customer Details' })).toBeVisible();
await expect(page.getByRole('rowheader', { name: 'Note:' })).toBeVisible();
await expect(page.getByRole('cell', { name: 'Please deliver between 9 AM' })).toBeVisible();
await expect(page.getByRole('rowheader', { name: 'Email:' })).toBeVisible();
await expect(page.getByRole('cell', { name: 'testuser1765553247158@example' })).toBeVisible();
await expect(page.getByRole('rowheader', { name: 'Telephone:' })).toBeVisible();
await expect(page.getByRole('cell', { name: '1234567890' })).toBeVisible();
await expect(page.getByRole('heading', { name: 'Billing Address' })).toBeVisible();
await expect(page.getByText('test user123 Test StreetTest')).toBeVisible();
await page.getByRole('listitem').filter({ hasText: 'Payment Method: Cash on' }).click();
await expect(page.getByRole('strong').filter({ hasText: 'Cash on Delivery' })).toBeVisible();
await expect(page.getByRole('listitem').filter({ hasText: 'Payment Method: Cash on' })).toBeVisible();

console.log('Order placed and confirmed successfully');



    });
      });