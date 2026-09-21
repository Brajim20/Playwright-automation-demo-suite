import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, type TestInfo } from '@playwright/test';
import type { Result } from 'axe-core';

/** WCAG 2.1 A + AA -- the bar the suite holds pages to. */
const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

/**
 * A violation the suite knows about and has decided not to fail on yet.
 *
 * Every entry needs a reason and an owner. This is deliberately not `disableRules()`: a
 * baselined rule still runs, still reports, and still shows up in the artifact. The
 * difference is that it does not block a merge.
 */
export interface KnownIssue {
  rule: string;
  reason: string;
}

export interface ScanOptions {
  /** CSS selectors to leave out, e.g. a third-party embed we do not control. */
  exclude?: string[];
  /** Accepted findings. Anything not listed here fails the test. */
  knownIssues?: KnownIssue[];
}

export async function scanPage(
  page: Page,
  testInfo: TestInfo,
  options: ScanOptions = {},
): Promise<Result[]> {
  let builder = new AxeBuilder({ page }).withTags(WCAG_TAGS);

  for (const selector of options.exclude ?? []) {
    builder = builder.exclude(selector);
  }

  const results = await builder.analyze();

  /* Attach the full report so a CI failure is diagnosable from the artifact alone. */
  await testInfo.attach('axe-violations.json', {
    body: JSON.stringify(results.violations, null, 2),
    contentType: 'application/json',
  });

  return results.violations;
}

/** Turn violations into something a developer can act on without opening the JSON. */
export function formatViolations(violations: Result[]): string {
  if (violations.length === 0) return 'No accessibility violations.';
  return violations
    .map((v) => {
      const nodes = v.nodes.map((n) => `      - ${n.target.join(' ')}`).join('\n');
      return `  [${v.impact ?? 'unknown'}] ${v.id}: ${v.help}\n    ${v.helpUrl}\n${nodes}`;
    })
    .join('\n\n');
}

/**
 * Fail on serious/critical violations that are not already baselined.
 *
 * Minor and moderate findings are attached to the report as debt rather than used to block a
 * build -- gating on every finding from day one is how an a11y suite gets switched off in
 * week two.
 */
export async function expectNoNewSeriousViolations(
  page: Page,
  testInfo: TestInfo,
  options: ScanOptions = {},
): Promise<void> {
  const known = options.knownIssues ?? [];
  const knownRules = new Set(known.map((k) => k.rule));

  const violations = await scanPage(page, testInfo, options);
  const serious = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');

  const accepted = serious.filter((v) => knownRules.has(v.id));
  const blocking = serious.filter((v) => !knownRules.has(v.id));

  for (const issue of accepted) {
    const entry = known.find((k) => k.rule === issue.id);
    testInfo.annotations.push({
      type: 'known-a11y-issue',
      description: `${issue.id} (${issue.nodes.length} node(s)) -- ${entry?.reason ?? 'no reason recorded'}`,
    });
  }

  /* A suppression nobody revisits is worse than no suppression. If a baselined rule stops
     firing, say so, so the entry can be deleted instead of quietly outliving the bug. */
  const stale = [...knownRules].filter((rule) => !serious.some((v) => v.id === rule));
  for (const rule of stale) {
    testInfo.annotations.push({
      type: 'stale-a11y-baseline',
      description: `"${rule}" is baselined but no longer fires -- remove it from knownIssues`,
    });
  }

  expect(
    blocking.map((v) => v.id),
    `Unbaselined serious/critical accessibility violations:\n${formatViolations(blocking)}`,
  ).toEqual([]);
}
