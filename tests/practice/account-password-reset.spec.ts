import { test, expect } from '../../src/fixtures/test-fixtures';
import { buildTestUser } from '../../src/utils/test-data';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Password reset @regression', () => {
  test.beforeEach(async ({ myAccountPage }) => {
    await myAccountPage.goto();
    await myAccountPage.lostPasswordLink.click();
  });

  test('the reset form renders', async ({ myAccountPage, page }) => {
    await expect(page.getByText(/Lost your password\?/i).first()).toBeVisible();
    await expect(myAccountPage.lostPasswordInput).toBeVisible();
    await expect(myAccountPage.resetPasswordButton).toBeVisible();
  });

  test('an unknown address is rejected', async ({ myAccountPage }) => {
    const unknown = buildTestUser('nobody');

    await myAccountPage.requestPasswordReset(unknown.email);

    await expect(myAccountPage.notice).toContainText(/Invalid username or e-?mail/i);
  });

  test('a known address is accepted', async ({ myAccountPage, registeredUser }) => {
    await myAccountPage.requestPasswordReset(registeredUser.email);

    await expect(myAccountPage.notice).toContainText(/Password reset email has been sent/i);
  });
});
