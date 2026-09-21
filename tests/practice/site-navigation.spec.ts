import { test, expect } from '../../src/fixtures/test-fixtures';

/** Every page the logo has to be able to bring the user home from. */
const ORIGINS = ['Shop', 'My Account', 'Test Cases'] as const;

test.describe('Site logo navigation @regression', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.goto();
  });

  for (const origin of ORIGINS) {
    test(`returns to the home page from ${origin}`, async ({ homePage, page }) => {
      await homePage.navLink(origin).click();
      await expect(page).not.toHaveURL(/\/$/);

      await homePage.clickLogo();

      /* Asserting the URL is the real check. The old version asserted that a div was
         visible, which is true on every page of the site. */
      await expect(page).toHaveURL(/practice\.automationtesting\.in\/?$/);
      await expect(homePage.newArrivalsHeading).toBeVisible();
    });
  }

  test('returns to the home page from the basket', async ({ homePage, page }) => {
    await homePage.cartLink.click();
    await expect(page).toHaveURL(/\/basket\/?/);

    await homePage.clickLogo();
    await expect(page).toHaveURL(/practice\.automationtesting\.in\/?$/);
  });
});
