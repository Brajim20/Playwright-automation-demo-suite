import { test } from '@playwright/test';
import { expectNoNewSeriousViolations } from '../../src/utils/a11y';

/**
 * Accessibility scans of the live practice site.
 *
 * The site is third-party and goes down. Rather than let that show up as a red build, these
 * skip with a reason when it is unreachable -- skipped, failed and untested are three
 * different states and collapsing them hides real signal.
 */
const PRACTICE_URL = process.env.PRACTICE_URL ?? 'https://practice.automationtesting.in';

const PAGES = [
  { name: 'Home', path: '/' },
  { name: 'Shop', path: '/shop/' },
  { name: 'My Account', path: '/my-account/' },
];

test.describe('Practice site accessibility @a11y', () => {
  for (const { name, path } of PAGES) {
    test(`${name} has no serious violations`, async ({ page, request }, testInfo) => {
      const probe = await request.get(`${PRACTICE_URL}${path}`, { failOnStatusCode: false });
      test.skip(
        !probe.ok(),
        `practice site returned HTTP ${probe.status()} for ${path} -- target unavailable`,
      );

      await page.goto(`${PRACTICE_URL}${path}`);
      await expectNoNewSeriousViolations(page, testInfo, {
        /* Third-party embed we do not control and cannot fix. */
        exclude: ['iframe[src*="mailchimp"]'],
      });
    });
  }
});
