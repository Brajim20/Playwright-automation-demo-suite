import { test, expect } from '../../src/fixtures/test-fixtures';
import { buildTestUser } from '../../src/utils/test-data';

test.describe('Newsletter subscription', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.goto();
  });

  test('the subscribe widget renders in the footer @smoke', async ({ homePage }) => {
    await expect(homePage.subscribeHeading).toBeVisible();
    await expect(homePage.subscribeEmailInput).toBeVisible();
    await expect(homePage.subscribeButton).toBeVisible();
  });

  /**
   * KNOWN ISSUE -- the practice site's Mailchimp integration is not configured, so a valid
   * submission returns "Oops. Something went wrong." rather than a confirmation.
   *
   * The suite asserts the behaviour that is actually there instead of pretending it passes.
   * When the integration is fixed this test will fail loudly, which is the correct outcome:
   * it is the signal to update the expectation.
   */
  test('submitting an address surfaces the upstream Mailchimp failure @regression', async ({
    homePage,
  }) => {
    const { email } = buildTestUser('subscriber');

    await homePage.subscribe(email);

    await expect(homePage.subscribeWidget).toContainText(/Oops\. Something went wrong/i);
  });
});
