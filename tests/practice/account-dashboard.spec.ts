import { authenticatedTest as test, expect } from '../../src/fixtures/test-fixtures';

/* Reuse the session created by the `setup` project instead of logging in again in every
   test. Cuts a full login round-trip from each of these cases. */

test.describe('Account dashboard @regression', () => {
  test.beforeEach(async ({ myAccountPage }) => {
    await myAccountPage.goto();
    await expect(myAccountPage.dashboardIntro).toBeVisible();
  });

  test('a new account has no orders', async ({ myAccountPage, page }) => {
    await myAccountPage.openDashboardSection('Orders');
    await expect(page.getByText(/No order has been made yet/i)).toBeVisible();
    await expect(page.getByRole('link', { name: 'Go Shop' })).toBeVisible();
  });

  test('a new account has no downloads', async ({ myAccountPage, page }) => {
    await myAccountPage.openDashboardSection('Downloads');
    await expect(page.getByText(/No downloads available yet/i)).toBeVisible();
  });

  test('a new account has no saved addresses', async ({ myAccountPage, page }) => {
    await myAccountPage.openDashboardSection('Addresses');

    await expect(page.getByRole('heading', { name: 'Billing Address' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Shipping Address' })).toBeVisible();
    await expect(page.getByText(/You have not set up this type of address yet/i)).toHaveCount(2);
  });

  test('account details exposes the profile and password-change fields', async ({
    myAccountPage,
    page,
  }) => {
    await myAccountPage.openDashboardSection('Account Details');

    for (const field of ['First name', 'Last name', 'Email address'] as const) {
      await expect(page.getByRole('textbox', { name: new RegExp(field, 'i') })).toBeVisible();
    }
    for (const field of ['Current Password', 'New Password', 'Confirm New Password'] as const) {
      await expect(page.getByRole('textbox', { name: new RegExp(field, 'i') })).toBeVisible();
    }
    await expect(page.getByRole('button', { name: 'Save changes' })).toBeVisible();
  });
});
