import { test, expect } from '../../src/fixtures/test-fixtures';

test.describe('Shop catalogue', () => {
  test.beforeEach(async ({ shopPage }) => {
    await shopPage.goto();
  });

  test('renders the grid, filter widget and category list @smoke', async ({ shopPage }) => {
    await test.step('Product grid', async () => {
      await expect(shopPage.productGrid).toBeVisible();
      const count = await shopPage.productCards.count();
      expect(count, 'shop grid should list products').toBeGreaterThan(0);
    });

    await test.step('Every card exposes a name, a price and an add-to-basket action', async () => {
      const cards = shopPage.productCards;
      for (let i = 0; i < (await cards.count()); i++) {
        const card = cards.nth(i);
        await expect(card.locator('h3')).toBeVisible();
        await expect(card.locator('.price')).toBeVisible();
        await expect(card.getByRole('link', { name: 'Add to basket' })).toBeVisible();
      }
    });

    await test.step('Price filter widget', async () => {
      await expect(shopPage.priceFilterHeading).toBeVisible();
      await expect(shopPage.filterButton).toBeVisible();
      await expect(shopPage.priceRangeLabel).toBeVisible();
    });

    await test.step('Category list', async () => {
      await expect(shopPage.categoriesHeading).toBeVisible();
      for (const category of ['Android', 'HTML', 'JavaScript', 'selenium']) {
        expect(
          await shopPage.categoryCount(category),
          `category "${category}" should list a count`,
        ).toBeGreaterThan(0);
      }
    });
  });

  test('a category filters the grid to that category only @regression', async ({ shopPage }) => {
    const expected = await shopPage.categoryCount('HTML');

    await shopPage.openCategory('HTML');

    /* The count advertised in the sidebar has to match what the grid actually renders.
       That relationship is the behaviour worth testing -- not that one known book is visible. */
    await expect(shopPage.productCards).toHaveCount(expected);
  });
});
