import { test, expect } from '@playwright/test';
test.describe('search test', () => {
  
  // Runs before each test
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('https://practice.automationtesting.in/', { timeout: 120000 });
    console.log('Page loaded successfully');
  });

  test('Validate search funtionality', async ({ page }) => {

    // valedate search box is visible
    await expect(page.getByRole('textbox', { name: 'Search' })).toBeVisible();

    // Enter search term in search box
    await page.locator('#searchform input').fill('Selenium');
    await page.keyboard.press('Enter');

    // Validate search results are displayed (no results found for Selenium)

    await expect(page.getByRole('heading', { name: 'Search Results for: Selenium' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Selenium Ruby' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'admin' })).toBeVisible();
    await expect(page.getByRole('link', { name: '0', exact: true })).toBeVisible();
    await expect(page.locator('span').filter({ hasText: /^0$/ })).toBeVisible();

 // first clear the search box

    await expect(page.getByRole('textbox', { name: 'Search' })).toBeVisible();
    await page.getByRole('textbox', { name: 'Search' }).clear();
   
  // now validate with another search term
    await page.getByRole('textbox', { name: 'Search' }).click();
    await page.getByRole('textbox', { name: 'Search' }).fill('HTML');
    await page.keyboard.press('Enter');
    await expect(page.getByRole('link', { name: 'HTML5 WebApp Develpment' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'HTML5 Forms' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Thinking in HTML' })).toBeVisible();
    await expect(page.getByText('HTML (3)')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Search Results for: html' })).toBeVisible();

 // click on the html button  to see the actual search results with the html books

 await expect(page.getByText('HTML (3)')).toBeVisible();
 await page.getByRole('link', { name: 'HTML', exact: true }).click();
 await expect(page.getByRole('link', { name: 'Mastering HTML5 Forms HTML5 Forms ₹' })).toBeVisible();
 await expect(page.getByRole('link', { name: 'HTML5 Web Application' })).toBeVisible();
 await expect(page.getByRole('link', { name: 'Sale! Thinking in HTML' })).toBeVisible();

console.log('Search functionality working fine');


      });
        });