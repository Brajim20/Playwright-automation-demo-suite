import { test, expect } from '../../src/fixtures/test-fixtures';

/**
 * The banner is a three-slide carousel that wraps in both directions.
 * Named in DOM order so the test can assert *which* slide it lands on, not just that a slide
 * is visible.
 */
const SLIDES = ['Shop Selenium Books', 'HTML', 'JavaScript'] as const;

test.describe('Home page banner carousel @regression', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.goto();
    await expect(homePage.slideImage(SLIDES[0])).toBeVisible();
  });

  test('advances through every slide and wraps to the first', async ({ homePage }) => {
    for (let i = 1; i <= SLIDES.length; i++) {
      const expected = SLIDES[i % SLIDES.length];

      await test.step(`Next -> "${expected}"`, async () => {
        await homePage.nextSlide();
        await expect(homePage.slideImage(expected)).toBeVisible();
      });
    }
  });

  test('steps backwards through every slide and wraps to the last', async ({ homePage }) => {
    for (let i = SLIDES.length - 1; i >= 0; i--) {
      const expected = SLIDES[i];

      await test.step(`Previous -> "${expected}"`, async () => {
        await homePage.previousSlide();
        await expect(homePage.slideImage(expected)).toBeVisible();
      });
    }
  });
});
