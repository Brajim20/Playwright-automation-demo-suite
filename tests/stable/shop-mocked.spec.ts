import { test, expect } from '@playwright/test';
import { ShopPage } from '../../src/pages';
import { isAscending } from '../../src/utils/price';
import { shopPageHtml, serverErrorHtml, type FixtureProduct } from '../../src/fixtures/shop-html';

/**
 * Page-object tests driven entirely by `page.route`.
 *
 * Two things this buys that a live-site test cannot:
 *
 *  1. The catalogue is known, so "does the price parser read a sale price correctly" has a
 *     single right answer instead of whatever the shop happens to be selling today.
 *  2. Failure states become testable on demand. The practice site was returning HTTP 500
 *     while this suite was written -- which is exactly the state a real suite should have an
 *     assertion for, and exactly the state you cannot arrange on someone else's server.
 */
const CATALOGUE: FixtureProduct[] = [
  { name: 'Mastering JavaScript', price: 350 },
  { name: 'Thinking in HTML', price: 450, salePrice: 400 },
  { name: 'HTML5 Forms', price: 280 },
  { name: 'Android Quick Start Guide', price: 600, salePrice: 450 },
];

const SHOP_URL = 'https://practice.automationtesting.in/shop/';

test.describe('Shop page object, against mocked responses @regression', () => {
  test('reads the effective price of every card, sale price included', async ({ page }) => {
    await page.route(SHOP_URL, (route) =>
      route.fulfill({ contentType: 'text/html', body: shopPageHtml(CATALOGUE) }),
    );

    const shop = new ShopPage(page);
    await page.goto(SHOP_URL);

    await expect(shop.productCards).toHaveCount(CATALOGUE.length);
    /* 400 and 450 are the *sale* prices -- proving the parser takes the last amount in a
       "was ₹450.00 now ₹400.00" block rather than the struck-through original. */
    expect(await shop.listedPrices()).toEqual([350, 400, 280, 450]);
  });

  test('the sorting assertion fails on an unsorted grid', async ({ page }) => {
    await page.route(SHOP_URL, (route) =>
      route.fulfill({ contentType: 'text/html', body: shopPageHtml(CATALOGUE) }),
    );

    const shop = new ShopPage(page);
    await page.goto(SHOP_URL);

    /* A guard is only worth having if it can fail. Serving a deliberately unsorted grid
       proves the sorting check has teeth -- the assertion it replaced passed on any order. */
    expect(isAscending(await shop.listedPrices())).toBe(false);
  });

  test('the sorting assertion passes on a sorted grid', async ({ page }) => {
    const sorted = [...CATALOGUE].sort(
      (a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price),
    );
    await page.route(SHOP_URL, (route) =>
      route.fulfill({ contentType: 'text/html', body: shopPageHtml(sorted) }),
    );

    const shop = new ShopPage(page);
    await page.goto(SHOP_URL);

    expect(isAscending(await shop.listedPrices())).toBe(true);
  });

  test('an empty catalogue renders no cards', async ({ page }) => {
    await page.route(SHOP_URL, (route) =>
      route.fulfill({ contentType: 'text/html', body: shopPageHtml([]) }),
    );

    const shop = new ShopPage(page);
    await page.goto(SHOP_URL);

    await expect(shop.productCards).toHaveCount(0);
    expect(await shop.listedPrices()).toEqual([]);
  });

  test('a backend 500 surfaces the error page, not a product grid', async ({ page }) => {
    await page.route(SHOP_URL, (route) =>
      route.fulfill({ status: 500, contentType: 'text/html', body: serverErrorHtml() }),
    );

    const response = await page.goto(SHOP_URL);

    expect(response?.status()).toBe(500);
    await expect(page.getByText('There has been a critical error')).toBeVisible();
    await expect(new ShopPage(page).productCards).toHaveCount(0);
  });

  test('a network failure is reported rather than swallowed', async ({ page }) => {
    await page.route(SHOP_URL, (route) => route.abort('connectionfailed'));

    await expect(page.goto(SHOP_URL)).rejects.toThrow(/ERR_CONNECTION_FAILED|net::/);
  });
});
