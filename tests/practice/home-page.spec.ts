import { test, expect } from '../../src/fixtures/test-fixtures';

test.describe('Home page', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.goto();
  });

  test('renders the masthead, catalogue and footer @smoke', async ({ homePage }) => {
    await test.step('Masthead', async () => {
      await expect(homePage.siteLogo).toBeVisible();
      await expect(homePage.searchBox).toBeVisible();
      await expect(homePage.cartLink).toBeVisible();
    });

    await test.step('Primary navigation', async () => {
      for (const item of ['Shop', 'My Account', 'Test Cases', 'AT Site', 'Demo Site'] as const) {
        await expect(homePage.navLink(item), `nav item "${item}"`).toBeVisible();
      }
    });

    await test.step('Hero banner', async () => {
      await expect(homePage.bannerSlider).toBeVisible();
    });

    await test.step('New arrivals', async () => {
      await homePage.newArrivalsHeading.scrollIntoViewIfNeeded();
      await expect(homePage.newArrivalsHeading).toBeVisible();

      const featured = ['Selenium Ruby', 'Thinking in HTML', 'Mastering JavaScript'];
      for (const name of featured) {
        const card = homePage.product(name);
        await expect(card.root, `card for "${name}"`).toBeVisible();
        await expect(card.addToBasketButton).toBeVisible();
        /* A price, not a *specific* price -- this test is about the page rendering, and
           hard-coding ₹450.00 here would make an unrelated price change look like a bug. */
        expect(await card.price(), `price for "${name}"`).toBeGreaterThan(0);
      }
    });

    await test.step('Footer', async () => {
      await expect(homePage.footer).toBeVisible();
      await expect(homePage.subscribeHeading).toBeVisible();
      await expect(homePage.subscribeEmailInput).toBeVisible();
      await expect(homePage.subscribeButton).toBeVisible();
    });
  });
});
