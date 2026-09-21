# Test plan

## Scope

Two applications are under test, for different reasons.

| Target                                        | Why it is here                                                                                                | Gates a merge? |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | -------------- |
| `practice.automationtesting.in` (WooCommerce) | A real, messy, third-party e-commerce app. Realistic flows: registration, login, catalogue, basket, checkout. | No             |
| `demo.playwright.dev/todomvc`                 | Deterministic, controlled, always up.                                                                         | Yes            |
| `reqres.in`                                   | A JSON API, for contract-level tests with no browser.                                                         | Yes            |

### Why the realistic target does not gate a merge

`practice.automationtesting.in` is a free public practice site nobody on this project
operates. While this suite was being written it served **HTTP 500 on every request, for
hours** — a WordPress fatal error. A merge gate that depends on it produces red builds that
mean "someone else's site fell over," and a team learns within about two weeks to ignore a
signal like that.

So the suite splits: the practice site gets thorough, realistic coverage that runs on a
schedule and reports, and the deterministic targets carry the gate. That split is the single
most important design decision here.

---

## Risk assessment

Ranked by what actually costs money or trust if it breaks.

| #   | Risk                                                                     | Impact                     | Coverage                                                                   |
| --- | ------------------------------------------------------------------------ | -------------------------- | -------------------------------------------------------------------------- |
| 1   | Checkout accepts an order but records the wrong total or loses the order | Revenue, direct            | `basket.spec.ts`, `checkout.spec.ts`                                       |
| 2   | Price filter or sort shows products at the wrong price                   | Revenue, trust             | `shop-sorting.spec.ts`, `shop-price-filter.spec.ts`, `shop-mocked.spec.ts` |
| 3   | A user cannot register or sign in                                        | Acquisition blocked        | `account-registration.spec.ts`, `account-login.spec.ts`                    |
| 4   | Password reset silently fails                                            | Support load, lockout      | `account-password-reset.spec.ts`                                           |
| 5   | API contract drifts (pagination, schema, status codes)                   | Integrations break quietly | `tests/api/users.spec.ts`                                                  |
| 6   | Catalogue or search returns the wrong set                                | Conversion                 | `search.spec.ts`, `shop-catalogue.spec.ts`                                 |
| 7   | Page is unusable with a screen reader or at low vision                   | Legal, reach               | `tests/a11y/`                                                              |
| 8   | Navigation chrome breaks                                                 | Annoyance                  | `site-navigation.spec.ts`, `home-page.spec.ts`                             |

---

## Coverage map

### Deterministic suite — gates merges

| Spec                           | What it proves                                                                                                                                                                |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `stable/todo-crud.spec.ts`     | Create, complete, clear, filter, persist. The filter test asserts Active and Completed are a clean **partition** of All — no item missing from both, none counted twice.      |
| `stable/shop-mocked.spec.ts`   | The shop page object and price parser, against a known catalogue served by `page.route`. Covers sale-price parsing, an empty grid, a backend 500 and a dropped connection.    |
| `api/users.spec.ts`            | Pagination envelope self-consistency (`total_pages === ceil(total / per_page)`), per-record schema, non-overlapping pages, 404 handling, POST echo, auth success and failure. |
| `a11y/stable-app.a11y.spec.ts` | WCAG 2.1 A/AA scan in empty and populated states, with an explicit baseline.                                                                                                  |

### Practice site — scheduled, informational

| Spec                                 | What it proves                                                                                                                                                             |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `practice/home-page.spec.ts`         | Masthead, nav, hero, new arrivals, footer render.                                                                                                                          |
| `practice/home-slider.spec.ts`       | The carousel advances and reverses through every named slide and wraps both ways.                                                                                          |
| `practice/site-navigation.spec.ts`   | The logo returns to the home page from Shop, My Account, Test Cases and the basket — asserted on **URL**, not on a div being visible.                                      |
| `practice/search.spec.ts`            | Every hit mentions the search term; a no-match term yields zero product cards.                                                                                             |
| `practice/shop-catalogue.spec.ts`    | Grid renders; every card has a name, price and action; the count a category advertises matches the number of cards it renders.                                             |
| `practice/shop-sorting.spec.ts`      | Prices are genuinely ascending/descending; high-to-low is the exact reverse of low-to-high; sorting reorders without dropping or duplicating products.                     |
| `practice/shop-price-filter.spec.ts` | Every surviving product falls inside the selected range; the filtered set is a subset of the unfiltered set.                                                               |
| `practice/account-*.spec.ts`         | Registration, duplicate-email rejection, empty-form validation, wrong password, sign in/out, dashboard sections, password reset for known and unknown addresses.           |
| `practice/basket.spec.ts`            | Listed price carries through to the basket line; the total equals the sum of the lines; removal removes; an invalid coupon is rejected **and leaves the total unchanged**. |
| `practice/checkout.spec.ts`          | Form renders; empty billing is rejected; a complete order produces a confirmation with a numeric order number.                                                             |
| `practice/newsletter.spec.ts`        | Documents a known upstream defect (see below).                                                                                                                             |

---

## Test design rules this suite follows

1. **Assert behaviour, not presence.** "Three products are visible after sorting by price"
   is true in any order and can never fail. Read the prices and check the ordering.
2. **Every guard must be able to fail.** `shop-mocked.spec.ts` deliberately serves an
   unsorted grid to prove the sorting assertion has teeth.
3. **No `waitForTimeout`.** Wait on the state that actually changes. Enforced by
   `eslint-plugin-playwright`, so it cannot creep back in.
4. **Derive expected values from the app, not from constants.** The basket test reads the
   listed price off the card rather than hard-coding ₹500.00, so a price change on the site
   does not become a false failure.
5. **No shared magic account.** The `setup` project registers a throwaway user per run.
6. **Skipped, failed and untested are three different states.** The practice-site a11y scans
   skip with a stated reason when the target is unreachable.
7. **Page objects expose locators and intent; assertions live in tests.** That is what lets
   one object serve a happy path and a negative case.

---

## Known issues

| Issue                                                                                                                                | State                      | Where it is recorded                                                                                     |
| ------------------------------------------------------------------------------------------------------------------------------------ | -------------------------- | -------------------------------------------------------------------------------------------------------- |
| Newsletter signup returns "Oops. Something went wrong." for any address — the practice site's Mailchimp integration is unconfigured. | Upstream, not fixable here | Asserted as current behaviour in `newsletter.spec.ts`, so the test fails loudly if it is ever fixed      |
| WCAG 2.1 AA contrast failures on `demo.playwright.dev/todomvc` (ratios 1.26 and 1.68 against a 3:1 / 4.5:1 requirement)              | Upstream third-party CSS   | Baselined in `stable-app.a11y.spec.ts`; full writeup in [`BUG_REPORT_EXAMPLE.md`](BUG_REPORT_EXAMPLE.md) |
| `practice.automationtesting.in` returning HTTP 500                                                                                   | Upstream outage            | CI probes it and reports "skipped, target unavailable" rather than failing                               |

---

## Gaps — what is deliberately not covered

Stating these is part of the plan, not an omission from it.

- **Visual regression.** Not included yet. `toHaveScreenshot` baselines are
  platform-specific, so committing macOS baselines would fail on the Linux CI image. Doing
  it properly means generating baselines inside the Playwright Docker image and committing
  those. Tracked, not faked.
- **Payment gateways.** Only Cash on Delivery is exercised. PayPal Express leaves the
  application under test.
- **Email delivery.** Password reset is asserted up to "the site says it sent an email."
  Verifying receipt needs a mail-catcher API.
- **Load and performance.** Out of scope for a functional suite.
- **Cross-browser on the practice site** runs nightly only, not per-commit — a deliberate
  trade of feedback latency against hammering a third party's server 5× per push.
