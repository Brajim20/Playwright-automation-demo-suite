import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * Two target applications, deliberately:
 *
 *  - PRACTICE_URL  a live WooCommerce practice site. Realistic, but third-party, so it can
 *                  (and does) go down. Tests against it live in `tests/practice/`.
 *  - STABLE_URL    a deterministic demo app. Tests against it live in `tests/stable/` and are
 *                  the suite's CI gate, so a red build always means *our* regression.
 *
 * See docs/TEST_PLAN.md for the reasoning.
 */
const PRACTICE_URL = process.env.PRACTICE_URL ?? 'https://practice.automationtesting.in';
const STABLE_URL = process.env.STABLE_URL ?? 'https://demo.playwright.dev/todomvc/';
const API_URL = process.env.API_URL ?? 'https://reqres.in';

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',
  outputDir: './test-results',
  snapshotPathTemplate: '{testDir}/__screenshots__/{testFilePath}/{arg}{ext}',

  /* A test that needs more than a minute is telling you something. Do not raise this to
     make a flaky test pass -- fix the wait instead. */
  timeout: 60_000,
  expect: { timeout: 10_000 },

  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 4 : undefined,
  /* Stop a broken build early instead of burning the full CI budget. */
  maxFailures: isCI ? 10 : 0,

  reporter: isCI
    ? [
        ['list'],
        ['html', { open: 'never' }],
        ['github'],
        ['json', { outputFile: 'test-results/results.json' }],
      ]
    : [['list'], ['html', { open: 'never' }]],

  use: {
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  /**
   * Every project is defined here and any of them can be run with `--project=<name>`.
   *
   * `npm test` deliberately does NOT run them all. It runs the three deterministic projects
   * plus the practice site on Chromium only. Running the practice suite across five browsers
   * means 195 live requests to a free third-party server on every local run -- slow, and not
   * a reasonable thing to do to someone else's box. The full matrix is one command away
   * (`npm run test:all-browsers`) and runs nightly in CI, which is where it belongs.
   */
  projects: [
    /* ---------------------------------------------------------------- setup */
    {
      name: 'setup',
      testDir: './tests/setup',
      testMatch: /.*\.setup\.ts/,
      use: { baseURL: PRACTICE_URL },
    },

    /* ------------------------------------------- deterministic CI gate */
    {
      name: 'stable-chromium',
      testDir: './tests/stable',
      use: { ...devices['Desktop Chrome'], baseURL: STABLE_URL },
    },

    /* ----------------------------------------------- headless API tests */
    {
      name: 'api',
      testDir: './tests/api',
      use: { baseURL: API_URL },
    },

    /* --------------------------------------------- accessibility scans */
    {
      name: 'a11y',
      testDir: './tests/a11y',
      use: { ...devices['Desktop Chrome'], baseURL: STABLE_URL },
    },

    /* ------------------------------------- practice-site UI, per browser */
    {
      name: 'chromium',
      testDir: './tests/practice',
      use: { ...devices['Desktop Chrome'], baseURL: PRACTICE_URL },
      dependencies: ['setup'],
    },
    {
      name: 'firefox',
      testDir: './tests/practice',
      use: { ...devices['Desktop Firefox'], baseURL: PRACTICE_URL },
      dependencies: ['setup'],
    },
    {
      name: 'webkit',
      testDir: './tests/practice',
      use: { ...devices['Desktop Safari'], baseURL: PRACTICE_URL },
      dependencies: ['setup'],
    },
    /* Real device emulation -- do NOT call page.setViewportSize() in these tests or you
       silently overwrite the descriptor and end up testing desktop twice. */
    {
      name: 'mobile-chrome',
      testDir: './tests/practice',
      use: { ...devices['Pixel 5'], baseURL: PRACTICE_URL },
      dependencies: ['setup'],
    },
    {
      name: 'mobile-safari',
      testDir: './tests/practice',
      use: { ...devices['iPhone 12'], baseURL: PRACTICE_URL },
      dependencies: ['setup'],
    },
  ],
});
