import { test, expect } from '../../src/fixtures/test-fixtures';

test.describe('Shop price filter @regression', () => {
  test.beforeEach(async ({ shopPage }) => {
    await shopPage.goto();
  });

  test('every product left in the grid falls inside the selected range', async ({ shopPage }) => {
    await test.step('Narrow the range by dragging the lower handle', async () => {
      await shopPage.dragSliderHandle(0, 80);
    });

    const range = await shopPage.selectedPriceRange();
    expect(range.min, 'dragging the handle should have raised the minimum').toBeGreaterThan(0);

    await shopPage.applyPriceFilter();

    const prices = await shopPage.listedPrices();
    expect(prices.length, 'filter should leave at least one product').toBeGreaterThan(0);

    /* The actual contract of a price filter: nothing outside the range survives it.
       The old version asserted the range label was visible and then computed a product count
       it never used. */
    for (const price of prices) {
      expect(
        price,
        `₹${price} should fall within ₹${range.min}-₹${range.max}`,
      ).toBeGreaterThanOrEqual(range.min);
      expect(price).toBeLessThanOrEqual(range.max);
    }
  });

  test('the unfiltered grid is a superset of the filtered grid', async ({ shopPage }) => {
    const unfiltered = await shopPage.listedNames();

    await shopPage.dragSliderHandle(0, 80);
    await shopPage.applyPriceFilter();
    const filtered = await shopPage.listedNames();

    expect(filtered.length).toBeLessThanOrEqual(unfiltered.length);
    for (const name of filtered) {
      expect(unfiltered, `"${name}" appeared only after filtering`).toContain(name);
    }
  });
});
