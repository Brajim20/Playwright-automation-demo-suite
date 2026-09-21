import { test, expect } from '../../src/fixtures/test-fixtures';
import { isAscending, isDescending } from '../../src/utils/price';

/**
 * These tests are the reason the suite has a price parser.
 *
 * The version they replace selected "sort by price" and then asserted that three named
 * products were *visible* -- an assertion that passes no matter what order the grid is in,
 * and so could never have caught a sorting regression.
 */
test.describe('Shop sorting @regression', () => {
  test.beforeEach(async ({ shopPage }) => {
    await shopPage.goto();
  });

  test('sorts price low to high', async ({ shopPage }) => {
    await shopPage.sortBy('price');

    const prices = await shopPage.listedPrices();
    expect(prices.length, 'grid should not be empty').toBeGreaterThan(1);
    expect(isAscending(prices), `expected ascending order, got ${JSON.stringify(prices)}`).toBe(
      true,
    );
  });

  test('sorts price high to low', async ({ shopPage }) => {
    await shopPage.sortBy('price-desc');

    const prices = await shopPage.listedPrices();
    expect(prices.length, 'grid should not be empty').toBeGreaterThan(1);
    expect(isDescending(prices), `expected descending order, got ${JSON.stringify(prices)}`).toBe(
      true,
    );
  });

  test('changing the sort order reorders the grid', async ({ shopPage }) => {
    await shopPage.sortBy('price');
    const ascending = await shopPage.listedNames();

    await shopPage.sortBy('price-desc');
    const descending = await shopPage.listedNames();

    expect(descending, 'high-to-low should be the reverse of low-to-high').toEqual(
      [...ascending].reverse(),
    );
  });

  test('sorting by popularity keeps every product in the grid', async ({ shopPage }) => {
    const before = await shopPage.listedNames();

    await shopPage.sortBy('popularity');
    const after = await shopPage.listedNames();

    /* Sorting is a reordering, never a filter. Comparing the sorted sets catches a sort that
       silently drops or duplicates a product -- something an order-only assertion misses. */
    expect([...after].sort()).toEqual([...before].sort());
  });
});
