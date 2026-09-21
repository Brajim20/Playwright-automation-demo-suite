# Playwright Automation Demo Suite

[![CI](https://github.com/Brajim20/Playwright-automation-demo-suite/actions/workflows/ci.yml/badge.svg)](https://github.com/Brajim20/Playwright-automation-demo-suite/actions/workflows/ci.yml)
[![Playwright](https://img.shields.io/badge/Playwright-1.57-2EAD33?logo=playwright&logoColor=white)](https://playwright.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

End-to-end test suite in TypeScript covering UI, API, accessibility and network-mocked
scenarios — built to show how I think about test design, not just how to drive a browser.

**Start here:** [Test plan](docs/TEST_PLAN.md) · [Worked bug report](docs/BUG_REPORT_EXAMPLE.md)

---

## Quick start

```bash
git clone https://github.com/Brajim20/Playwright-automation-demo-suite.git
cd Playwright-automation-demo-suite
npm ci
npm run install:browsers

npm run test:stable     # deterministic UI suite  (14 tests, ~8s)
npm run test:api        # API contract tests       (7 tests, ~5s)
npm run test:a11y       # accessibility scans      (6 tests, ~7s)
npm run report          # open the HTML report
```

No `.env` is needed to run the commands above. Copy `.env.example` to `.env` to point the
suite at different targets.

---

## What this suite demonstrates

|                                        |                                                                                                                                                                                |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Page Object Model**                  | Six page objects plus a `ProductCard` component object, in `src/pages/`. Objects expose locators and intent; assertions stay in tests.                                         |
| **Custom fixtures**                    | `test.extend` injects ready-built page objects and test data. A unique user per test — no shared magic account.                                                                |
| **Behavioural assertions**             | Sorting tests read the prices and check the ordering. Filter tests check every surviving product is in range. See [the sorting rewrite](#2-assertions-that-can-actually-fail). |
| **Guards proven to have teeth**        | Mocked specs serve a deliberately _unsorted_ grid to prove the sorting assertion fails when it should.                                                                         |
| **API testing**                        | Browserless contract tests: pagination envelope self-consistency, per-record schema, non-overlapping pages, status codes, auth.                                                |
| **Network mocking**                    | `page.route` serves fixture markup to test an empty catalogue, a backend 500 and a dropped connection — states you cannot arrange on someone else's server.                    |
| **Accessibility**                      | axe-core WCAG 2.1 A/AA scans with an explicit, justified baseline rather than blanket rule suppression.                                                                        |
| **Auth via `storageState`**            | A `setup` project registers a throwaway account once and every logged-in test reuses the session.                                                                              |
| **Tagged test tiers**                  | `@smoke`, `@regression`, `@a11y`, filterable with `--grep`.                                                                                                                    |
| **Lint rules that enforce the design** | `eslint-plugin-playwright` makes `waitForTimeout`, focused tests and assertionless specs build failures.                                                                       |
| **CI that means something**            | A deterministic merge gate, and a separate non-blocking nightly job for the third-party target.                                                                                |

---

## Architecture

```
src/
├── pages/                  page objects — locators + intent, no assertions
│   ├── base.page.ts          shared masthead, nav, search
│   ├── home.page.ts          hero carousel, new arrivals, newsletter
│   ├── shop.page.ts          grid, sorting, price filter, categories
│   ├── my-account.page.ts    login, register, reset, dashboard
│   ├── basket.page.ts        line items, totals, coupons
│   ├── checkout.page.ts      billing, payment, confirmation
│   └── product-card.ts       component object for a single tile
├── fixtures/
│   ├── test-fixtures.ts      test.extend — injects page objects + test data
│   ├── shop-html.ts          fixture markup served via page.route
│   └── paths.ts              storageState + credential locations
└── utils/
    ├── price.ts              parse ₹ strings, assert ordering
    ├── test-data.ts          collision-proof user + billing factories
    └── a11y.ts               axe wrapper, severity gating, baselining

tests/
├── setup/                  registers a throwaway account, saves the session
├── stable/    ← merge gate  deterministic UI + network-mocked page objects
├── api/       ← merge gate  contract tests, no browser
├── a11y/      ← merge gate  axe scans (practice-site scans skip if it is down)
└── practice/               the realistic WooCommerce flows, nightly
```

---

## Test targets, and why there are three

| Target                          | Role                        | Gates a merge?            |
| ------------------------------- | --------------------------- | ------------------------- |
| `demo.playwright.dev/todomvc`   | Deterministic UI            | ✅                        |
| `reqres.in`                     | JSON API                    | ✅                        |
| `practice.automationtesting.in` | Realistic WooCommerce flows | ❌ nightly, informational |

The practice site is a free public sandbox nobody here operates. **While this suite was being
written it returned HTTP 500 on every request for hours.** A merge gate wired to it produces
red builds that mean "someone else's WordPress fell over" — and a team learns to ignore a
signal like that within about two weeks.

So the suite splits. The realistic target gets thorough coverage that runs on a schedule and
reports; deterministic targets carry the gate. CI probes the practice site first and reports
**skipped — target unavailable** instead of failing. Skipped, failed and untested are three
different states and collapsing them throws away the only information that matters.

---

## Design decisions worth reading the code for

### 1. No test depends on a shared account

A single hard-coded user meant four specs failed together the day that account changed. The
`setup` project now registers a throwaway account per run and saves its `storageState`;
`buildTestUser()` generates collision-proof identities for parallel workers.

### 2. Assertions that can actually fail

The sorting test used to select "sort by price" and then assert three named products were
_visible_ — true in any order, so it could never catch a sorting regression.

```ts
// before — passes no matter what order the grid is in
await page.getByRole('combobox').selectOption('price');
await expect(page.getByText('HTML5 Forms ₹280.00 Add to')).toBeVisible();
await expect(page.getByText('Mastering JavaScript ₹350.00 Add to basket')).toBeVisible();

// after — reads the rendered prices and checks the ordering
await shopPage.sortBy('price');
const prices = await shopPage.listedPrices();
expect(isAscending(prices), `expected ascending order, got ${JSON.stringify(prices)}`).toBe(true);
```

And because a guard nobody has seen fail is not a guard, `shop-mocked.spec.ts` serves a
deliberately unsorted grid and asserts the check **fails**.

### 3. Waits on state, never on the clock

Ten `waitForTimeout` calls are gone. Each was replaced with the state change it was guessing
at — `View Basket` appearing after an AJAX add, a filter link gaining its `selected` class, a
cart row actually leaving the DOM. The rule is enforced in `eslint.config.mjs`, so it cannot
come back.

One of these was a real bug the rewrite exposed: `allInnerTexts()` does not auto-retry, so
reading the list straight after clicking a filter returned the _previous_ filter's contents.
A sleep would have hidden it on a fast machine and failed on a slow one.

### 4. Expected values come from the app, not from constants

```ts
const listedPrice = await card.price(); // read it off the card
await card.addToBasket();
expect(await basketPage.lineTotal(PRODUCT)).toBe(listedPrice);
```

The behaviour under test is "the listed price carries through to the basket." Hard-coding
₹500.00 would turn an unrelated price change into a false failure.

### 5. Locators survive a content change

```ts
// before — breaks when the sale ends or the price changes
page.getByText('Sale! Thinking in HTML ₹450.00 ₹400.00 Add to basket');
page.locator('#text-22-sub_row_1-0-2-0-0'); // generated theme id

// after — find the card, then reach for named parts
shopPage.product('Thinking in HTML').addToBasketButton;
```

### 6. Accessibility findings are baselined, not silenced

The scan found a genuine WCAG AA contrast failure (ratio **1.26:1** where 3:1 is required).
It is upstream CSS this project does not own, so it is recorded as a known issue with a
reason — the rule still runs, still reports, and any _different_ serious violation still
fails the build. A third test asserts the finding is still present, so the baseline entry
gets deleted when upstream fixes it instead of quietly outliving the bug. Full writeup:
[`docs/BUG_REPORT_EXAMPLE.md`](docs/BUG_REPORT_EXAMPLE.md).

---

## Commands

| Command                              | What it runs                                  |
| ------------------------------------ | --------------------------------------------- |
| `npm test`                           | Everything                                    |
| `npm run test:stable`                | Deterministic UI suite                        |
| `npm run test:api`                   | API contract tests                            |
| `npm run test:a11y`                  | Accessibility scans                           |
| `npm run test:smoke`                 | Everything tagged `@smoke`                    |
| `npm run test:regression`            | Everything tagged `@regression`               |
| `npm run test:ui`                    | Playwright UI mode                            |
| `npm run test:headed` / `test:debug` | Watch it run / step through it                |
| `npm run test:all-browsers`          | Chromium, Firefox, WebKit, Pixel 5, iPhone 12 |
| `npm run report`                     | Open the HTML report                          |
| `npm run verify`                     | Typecheck + lint + format check               |

Filter by tag directly: `npx playwright test --grep @smoke`

---

## CI

**`ci.yml`** — on every push and PR:

1. `verify` — typecheck, lint, format check
2. `test` — the three deterministic projects in parallel, reports uploaded as artifacts

Typical run: about two minutes. A red build here is always this repo's fault.

**`practice-site.yml`** — nightly at 06:00 UTC, or on demand:

Probes the target first. HTTP 200 → run the full browser matrix. Anything else → a job that
reports _skipped, target unavailable_ in the run summary. Never blocks a merge.

---

## Notes on scope

Deliberately not covered, with reasons, in the
[test plan](docs/TEST_PLAN.md#gaps--what-is-deliberately-not-covered): visual regression
(baselines are platform-specific and must be generated on the CI image — tracked, not faked),
payment gateways, email delivery, load testing.

## License

MIT — see [LICENSE](LICENSE).
