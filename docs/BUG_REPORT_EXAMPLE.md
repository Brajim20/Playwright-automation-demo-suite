# Bug report — WCAG 2.1 AA contrast failures on the TodoMVC demo

> A worked example of how this project reports a defect: measured, scoped honestly, with the
> fix pointed at a specific rule. Found by the automated axe-core scan in
> `tests/a11y/stable-app.a11y.spec.ts`.

**Application**: `https://demo.playwright.dev/todomvc/`
**Found on**: 21 September 2026
**Found by**: automated scan, axe-core 4.13 via `@axe-core/playwright`, Chromium 143
**Standard**: WCAG 2.1 Level AA, success criterion 1.4.3 (Contrast — Minimum)
**Severity**: serious (axe impact) — affects all users with low vision; no functional impact
**Status**: upstream, third-party CSS. Baselined in this suite, not fixed here.

---

## Actual behaviour

Four elements render below the AA contrast threshold. Measured ratios:

| Element                                      | Foreground | Background | Measured   | Required         | Shortfall  |
| -------------------------------------------- | ---------- | ---------- | ---------- | ---------------- | ---------- |
| `h1` ("todos", 100px)                        | `#ebd7d7`  | `#f5f5f5`  | **1.26:1** | 3:1 (large text) | 2.4× below |
| `p:nth-child(1)` (footer, 10px)              | `#bfbfbf`  | `#f5f5f5`  | **1.68:1** | 4.5:1            | 2.7× below |
| `p:nth-child(2)` (footer, 10px)              | `#bfbfbf`  | `#f5f5f5`  | **1.68:1** | 4.5:1            | 2.7× below |
| `a[href$="remojansen/"]` (credit link, 10px) | `#bfbfbf`  | `#f5f5f5`  | **1.68:1** | 4.5:1            | 2.7× below |

The `h1` is the worst of the four in absolute terms: at 1.26:1 the page's largest element is
very nearly invisible against its own background.

## Expected behaviour

Text meets WCAG 2.1 AA: **4.5:1** for body copy, **3:1** for large text (≥18pt, or ≥14pt
bold). The 100px `h1` qualifies as large text, so 3:1 applies to it and 4.5:1 to the rest.

## Steps to reproduce

1. Open `https://demo.playwright.dev/todomvc/`
2. Run an axe-core scan restricted to `wcag2a, wcag2aa, wcag21a, wcag21aa`
3. Read the `color-contrast` violation

Or in this repo:

```bash
npm run test:a11y
```

## To fix

Raise the two foreground colours in the TodoMVC stylesheet:

- `#ebd7d7` → roughly `#af8f8f` or darker clears 3:1 on `#f5f5f5`
- `#bfbfbf` → roughly `#767676` or darker clears 4.5:1 on `#f5f5f5`

`#767676` on `#f5f5f5` is the conventional minimum-passing grey and needs no redesign.

## More info

- The heading colour is decorative by intent, but SC 1.4.3 has no decorative-text exemption —
  it is real text conveying the app's name.
- The three 10px findings share one rule and one colour, so they are one fix, not three.
- This is third-party CSS. This suite records it as a **known issue** rather than disabling
  the rule: it still runs, still appears in every report, and still fails the build if a
  _different_ serious violation appears. A third test asserts the finding is still present,
  so when upstream fixes it the baseline entry gets deleted rather than quietly outliving
  the bug.
