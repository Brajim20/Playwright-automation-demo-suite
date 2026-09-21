import { test as base, expect } from '@playwright/test';
import fs from 'fs';
import { BasketPage, CheckoutPage, HomePage, MyAccountPage, ShopPage } from '../pages';
import { buildTestUser, type TestUser } from '../utils/test-data';
import { CREDENTIALS_FILE, STORAGE_STATE } from './paths';
import { targetStatus, unavailableReason } from './target-availability';

/**
 * Custom fixtures.
 *
 * Page objects arrive already constructed, so a spec never repeats `new HomePage(page)`, and
 * swapping a constructor signature is a one-line change here instead of a find-and-replace
 * across every file.
 */
interface Fixtures {
  homePage: HomePage;
  shopPage: ShopPage;
  myAccountPage: MyAccountPage;
  basketPage: BasketPage;
  checkoutPage: CheckoutPage;

  /** A fresh, unregistered user. Unique per test, so parallel workers never collide. */
  testUser: TestUser;

  /** The account created once by the `setup` project and reused by logged-in tests. */
  registeredUser: TestUser;

  /**
   * Auto fixture: skip the test when the practice site is not serving.
   *
   * Runs before every test in this suite, costs one HTTP probe per worker, and turns a
   * third-party outage into an honest skip instead of a false failure.
   */
  practiceSiteUp: void;
}

export const test = base.extend<Fixtures>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  shopPage: async ({ page }, use) => {
    await use(new ShopPage(page));
  },
  myAccountPage: async ({ page }, use) => {
    await use(new MyAccountPage(page));
  },
  basketPage: async ({ page }, use) => {
    await use(new BasketPage(page));
  },
  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },

  practiceSiteUp: [
    async ({ request, baseURL }, use) => {
      if (baseURL) {
        const status = await targetStatus(request, baseURL);
        test.skip(status !== 200, unavailableReason(baseURL, status));
      }
      await use();
    },
    { auto: true },
  ],

  testUser: async ({}, use) => {
    await use(buildTestUser());
  },

  registeredUser: async ({}, use) => {
    if (!fs.existsSync(CREDENTIALS_FILE)) {
      throw new Error(
        `No registered user found at ${CREDENTIALS_FILE}. ` +
          `Run the 'setup' project first (npm test runs it as a dependency).`,
      );
    }
    const user = JSON.parse(fs.readFileSync(CREDENTIALS_FILE, 'utf8')) as TestUser;
    await use(user);
  },
});

export { expect };

/**
 * Variant for tests that need to be signed in.
 *
 * `test.use({ storageState: '...' })` is resolved when the browser context is created --
 * before any fixture runs -- so a missing file is a hard ENOENT rather than a skip. Resolving
 * it through a fixture instead means that when the practice site is down and the `setup`
 * project never produced a session, these tests still reach the availability guard and skip
 * with a stated reason.
 */
export const authenticatedTest = test.extend({
  storageState: async ({}, use) => {
    await use(fs.existsSync(STORAGE_STATE) ? STORAGE_STATE : { cookies: [], origins: [] });
  },
});
