import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';

export default tseslint.config(
  {
    ignores: ['node_modules/**', 'playwright-report/**', 'test-results/**', '.auth/**'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['tests/**/*.ts'],
    ...playwright.configs['flat/recommended'],
    rules: {
      ...playwright.configs['flat/recommended'].rules,

      /* The anti-patterns this suite was cleaned of, now enforced so they cannot come back:
         a sleep instead of a wait, a conditional instead of an assertion, a skipped test with
         no reason, and a spec that runs without asserting anything. */
      'playwright/no-wait-for-timeout': 'error',
      'playwright/no-element-handle': 'error',
      'playwright/no-eval': 'error',
      'playwright/no-focused-test': 'error',
      'playwright/no-skipped-test': ['warn', { allowConditional: true }],
      /* The a11y helpers assert internally; teach the rule about them rather than
         weakening it. */
      'playwright/expect-expect': [
        'error',
        {
          assertFunctionNames: ['expectNoNewSeriousViolations', 'expectNoSeriousViolations'],
        },
      ],
      /* toHaveLength() cannot express "more than zero", which is the assertion we want when
         the exact count is data-dependent. */
      'playwright/prefer-to-have-length': 'off',
      'playwright/no-conditional-in-test': 'warn',
      'playwright/no-useless-await': 'error',
      'playwright/prefer-web-first-assertions': 'error',
      'playwright/valid-expect': 'error',
      'no-console': 'error',
    },
  },
  {
    files: ['src/**/*.ts', 'playwright.config.ts'],
    rules: {
      'no-console': 'error',
      /* `async ({}, use) => {}` is the documented Playwright fixture signature. */
      'no-empty-pattern': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
  {
    files: ['**/*.ts'],
    rules: {
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
);
