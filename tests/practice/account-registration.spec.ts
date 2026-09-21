import { test, expect } from '../../src/fixtures/test-fixtures';

/* Registration establishes a brand-new session, so it must not reuse the stored one. */
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Account registration @smoke', () => {
  test.beforeEach(async ({ myAccountPage }) => {
    await myAccountPage.goto();
  });

  test('a new user can register and lands on the dashboard', async ({
    myAccountPage,
    testUser,
  }) => {
    await test.step('The registration form is present', async () => {
      await expect(myAccountPage.registerHeading).toBeVisible();
      await expect(myAccountPage.registerEmailInput).toBeVisible();
      await expect(myAccountPage.registerPasswordInput).toBeVisible();
      await expect(myAccountPage.registerButton).toBeVisible();
    });

    await test.step(`Register ${testUser.email}`, async () => {
      await myAccountPage.register(testUser);
    });

    await test.step('The dashboard reflects the new account', async () => {
      await expect(myAccountPage.greeting).toContainText(testUser.username);
      await expect(myAccountPage.logoutLink).toBeVisible();
      for (const item of [
        'Dashboard',
        'Orders',
        'Downloads',
        'Addresses',
        'Account Details',
      ] as const) {
        await expect(myAccountPage.dashboardNavLink(item), `nav item "${item}"`).toBeVisible();
      }
    });
  });

  test('registering an already-registered address is rejected @regression', async ({
    myAccountPage,
    testUser,
    page,
  }) => {
    await myAccountPage.register(testUser);
    await myAccountPage.logout();

    await myAccountPage.registerEmailInput.fill(testUser.email);
    await myAccountPage.registerPasswordInput.fill(testUser.password);
    await myAccountPage.registerButton.click();

    await expect(myAccountPage.notice).toContainText(/already registered/i);
    await expect(page.getByRole('link', { name: 'Logout' })).toBeHidden();
  });
});
