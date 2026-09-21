import { test, expect } from '../../src/fixtures/test-fixtures';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Account login', () => {
  test.beforeEach(async ({ myAccountPage }) => {
    await myAccountPage.goto();
  });

  test('the login form renders its fields and links @smoke', async ({ myAccountPage }) => {
    await expect(myAccountPage.loginHeading).toBeVisible();
    await expect(myAccountPage.usernameInput).toBeVisible();
    await expect(myAccountPage.passwordInput).toBeVisible();
    await expect(myAccountPage.loginButton).toBeVisible();
    await expect(myAccountPage.rememberMeCheckbox).toBeVisible();
    await expect(myAccountPage.lostPasswordLink).toBeVisible();
  });

  test('submitting an empty form reports the missing username @regression', async ({
    myAccountPage,
  }) => {
    await myAccountPage.loginButton.click();

    await expect(myAccountPage.notice).toContainText('Username is required.');
    await expect(myAccountPage.logoutLink).toBeHidden();
  });

  test('a wrong password is rejected @regression', async ({ myAccountPage, registeredUser }) => {
    await myAccountPage.login(registeredUser.email, 'definitely-not-the-password');

    await expect(myAccountPage.notice).toContainText(/incorrect|not correct|error/i);
    await expect(myAccountPage.logoutLink).toBeHidden();
  });

  test('valid credentials sign the user in and out @smoke', async ({
    myAccountPage,
    registeredUser,
  }) => {
    await test.step('Sign in', async () => {
      await myAccountPage.login(registeredUser.email, registeredUser.password);
      await expect(myAccountPage.dashboardIntro).toBeVisible();
      await expect(myAccountPage.greeting).toContainText(registeredUser.username);
      await expect(myAccountPage.logoutLink).toBeVisible();
    });

    await test.step('Sign out', async () => {
      await myAccountPage.logout();
      await expect(myAccountPage.loginButton).toBeVisible();
      await expect(myAccountPage.logoutLink).toBeHidden();
    });
  });
});
