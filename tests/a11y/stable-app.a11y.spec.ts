import { test, expect } from '@playwright/test';
import {
  expectNoNewSeriousViolations,
  scanPage,
  formatViolations,
  type KnownIssue,
} from '../../src/utils/a11y';

/**
 * Accessibility scans with axe-core.
 *
 * The scan found a genuine WCAG 2.1 AA contrast failure in the demo app's own stylesheet.
 * It is a real defect, it is in third-party CSS this project does not own, and it is
 * therefore baselined rather than fixed or silenced -- it keeps appearing in every report
 * while not blocking a merge on someone else's bug.
 */
const KNOWN_ISSUES: KnownIssue[] = [
  {
    rule: 'color-contrast',
    reason:
      'TodoMVC ships very light grey for the h1 and the footer credits -- upstream CSS, ' +
      'not owned by this project. Tracked, not fixed here.',
  },
];

test.describe('Accessibility @a11y', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./');
  });

  test('empty state has no unbaselined serious violations', async ({ page }, testInfo) => {
    await expectNoNewSeriousViolations(page, testInfo, { knownIssues: KNOWN_ISSUES });
  });

  test('populated list has no unbaselined serious violations', async ({ page }, testInfo) => {
    const input = page.getByPlaceholder('What needs to be done?');
    for (const item of ['write tests', 'review the PR']) {
      await input.fill(item);
      await input.press('Enter');
    }
    await expect(page.getByTestId('todo-title')).toHaveCount(2);

    await expectNoNewSeriousViolations(page, testInfo, { knownIssues: KNOWN_ISSUES });
  });

  test('the contrast finding is real and still present', async ({ page }, testInfo) => {
    const violations = await scanPage(page, testInfo);
    const contrast = violations.find((v) => v.id === 'color-contrast');

    /* A baseline entry that nothing verifies is just a comment. This asserts the accepted
       finding still exists, so the day upstream fixes it the entry gets removed rather than
       lingering forever. */
    expect(contrast, 'expected the baselined contrast violation to still be present').toBeDefined();
    expect(contrast!.impact).toBe('serious');
    expect(formatViolations([contrast!])).toContain('color-contrast');
  });
});
