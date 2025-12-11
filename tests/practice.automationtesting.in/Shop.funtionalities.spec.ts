import { test, expect, Locator } from '@playwright/test';
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

    //filter products by price
async function moveSlider(locator: Locator, offset: number) {
  await locator.waitFor();
  const box = await locator.boundingBox();
  if (!box) throw new Error('Slider handle not found');

  await locator.page().mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await locator.page().mouse.down();
  await locator.page().mouse.move(box.x + offset, box.y + box.height / 2, { steps: 10 });
  await locator.page().mouse.up();
}

// usage
await moveSlider(page.locator('.ui-slider-handle').first(), 80);

console.log('Price filter applied successfully');

//validate filtered products
await expect(page.getByText('Price: ₹278 — ₹')).toBeVisible();
await page.getByRole('button', { name: 'Filter' }).click();

// Validate that filtered products are displayed
const products = page.locator('.products .product');
const count = await products.count();

// sorting button validation

await expect(page.getByRole('combobox')).toBeVisible();
await page.getByRole('combobox').selectOption('popularity');
console.log('Products sorted by popularity successfully');

///set sorting  low to high
await page.getByRole('combobox').selectOption('price');
console.log('Products sorted by price: low to high successfully');

// validate product are validated in low to high

await expect(page.getByText('HTML5 Forms ₹280.00 Add to')).toBeVisible();
await expect(page.getByText('Mastering JavaScript ₹350.00 Add to basket')).toBeVisible();
await expect(page.getByText('Sale! Thinking in HTML ₹450.00 ₹400.00 Add to basket')).toBeVisible();

// product categories selction 

await expect(page.getByText('Android (1)')).toBeVisible();
await page.getByRole('link', { name: 'Android', exact: true }).click();
await expect(page.getByRole('link', { name: 'Sale! Android Quick Start' })).toBeVisible();
await expect(page.getByRole('list').filter({ hasText: 'Sale! Android Quick Start' })).toBeVisible();


// Final console log message
console.log('Shop page filter and sorting functionalities are working successfully');

  }); 
 });