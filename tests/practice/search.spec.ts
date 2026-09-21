import { test, expect } from '../../src/fixtures/test-fixtures';

test.describe('Catalogue search', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.goto();
  });

  test('returns matching products for a term with results @smoke', async ({ homePage, page }) => {
    await homePage.search('HTML');

    await expect(page.getByRole('heading', { name: /Search Results for:\s*HTML/i })).toBeVisible();

    /* Assert the *shape* of the result set -- every hit mentions the term -- rather than
       naming three specific books, which would break the moment the catalogue changes. */
    const titles = await page.locator('.post-title, h2.entry-title, li.product h3').allInnerTexts();
    expect(titles.length, 'search returned at least one result').toBeGreaterThan(0);
    expect(
      titles.filter((t) => /html/i.test(t)).length,
      `every result should mention the search term; got ${JSON.stringify(titles)}`,
    ).toBe(titles.length);
  });

  test('reports no matches for a term with no results @regression', async ({ homePage, page }) => {
    await homePage.search('zzzzqqqnotaproduct');

    await expect(
      page
        .getByRole('heading', { name: /Search Results for/i })
        .or(page.getByText(/Nothing Found/i)),
    ).toBeVisible();
    await expect(page.locator('li.product')).toHaveCount(0);
  });
});
