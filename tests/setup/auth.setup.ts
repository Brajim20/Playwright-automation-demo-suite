import { test as setup, expect } from '@playwright/test';
import fs from 'fs';
import { MyAccountPage } from '../../src/pages';
import { buildTestUser } from '../../src/utils/test-data';
import { AUTH_DIR, CREDENTIALS_FILE, STORAGE_STATE } from '../../src/fixtures/paths';
import { targetStatus, unavailableReason } from '../../src/fixtures/target-availability';

/**
 * Register one throwaway account per run and save its session.
 *
 * Why not a hard-coded account? The previous suite pinned four specs to one shared login.
 * If that account is ever deleted, expires, or has its
 * password changed by another visitor to this public practice site, four specs fail at once
 * for a reason that has nothing to do with the code under test. Creating the account as part
 * of the run makes the suite self-contained.
 */
setup('create and authenticate a throwaway account', async ({ page, request, baseURL }) => {
  /* Skip rather than fail when the third-party target is down. A skipped dependency still
     lets the dependent projects start, where each test skips for the same stated reason --
     so an outage reads as "not run", never as "broken". */
  const status = await targetStatus(request, baseURL!);
  setup.skip(status !== 200, unavailableReason(baseURL!, status));

  const user = buildTestUser('setup');
  const myAccount = new MyAccountPage(page);

  await setup.step('Open the My Account page', async () => {
    await myAccount.goto();
    await expect(myAccount.registerHeading).toBeVisible();
  });

  await setup.step(`Register ${user.email}`, async () => {
    await myAccount.register(user);
  });

  await setup.step('Confirm the session is authenticated', async () => {
    await expect(myAccount.logoutLink).toBeVisible();
    await expect(myAccount.dashboardIntro).toBeVisible();
  });

  await setup.step('Persist the session and credentials for the UI projects', async () => {
    fs.mkdirSync(AUTH_DIR, { recursive: true });
    await page.context().storageState({ path: STORAGE_STATE });
    fs.writeFileSync(CREDENTIALS_FILE, JSON.stringify(user, null, 2));
  });
});
