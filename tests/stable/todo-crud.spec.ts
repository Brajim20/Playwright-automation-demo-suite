import { test, expect, type Page } from '@playwright/test';

/**
 * The suite's deterministic CI gate.
 *
 * Every other UI test here runs against a third-party practice site that this project does
 * not control -- and which, at the time of writing, was serving HTTP 500. Tests against it
 * are valuable (it is a real application) but they cannot be the signal that gates a merge,
 * because a red build would mean "someone else's WordPress fell over" as often as it means
 * "we broke something". These tests run against a stable demo app so a failure here is
 * always ours.
 */
const TODOS = ['buy some cheese', 'feed the cat', 'book a doctors appointment'] as const;

async function addTodos(page: Page, items: readonly string[]): Promise<void> {
  const input = page.getByPlaceholder('What needs to be done?');
  for (const item of items) {
    await input.fill(item);
    await input.press('Enter');
  }
}

/**
 * Click a filter and wait for the app to actually apply it.
 *
 * `allInnerTexts()` is a one-shot read with no auto-retry, so reading the list straight after
 * the click returns the *previous* filter's contents. Waiting on the app's own "selected"
 * state is the correct signal -- a `waitForTimeout` here would paper over the same race and
 * still fail on a slow machine.
 */
async function applyFilter(page: Page, filter: 'All' | 'Active' | 'Completed'): Promise<void> {
  const link = page.getByRole('link', { name: filter, exact: true });
  await link.click();
  await expect(link).toHaveClass(/selected/);
}

test.beforeEach(async ({ page }) => {
  await page.goto('./');
});

test.describe('Todo list @smoke', () => {
  test('adds items in the order they were entered', async ({ page }) => {
    await addTodos(page, TODOS);

    await expect(page.getByTestId('todo-title')).toHaveText([...TODOS]);
    await expect(page.getByTestId('todo-count')).toHaveText(`${TODOS.length} items left`);
  });

  test('clears the input after each submission', async ({ page }) => {
    const input = page.getByPlaceholder('What needs to be done?');

    await addTodos(page, [TODOS[0]]);

    await expect(input).toBeEmpty();
  });

  test('marks an item complete and updates the remaining count', async ({ page }) => {
    await addTodos(page, TODOS);

    await page.getByRole('listitem').filter({ hasText: TODOS[0] }).getByRole('checkbox').check();

    await expect(page.getByRole('listitem').filter({ hasText: TODOS[0] })).toHaveClass(/completed/);
    await expect(page.getByTestId('todo-count')).toHaveText(`${TODOS.length - 1} items left`);
  });

  test('removes completed items with "Clear completed"', async ({ page }) => {
    await addTodos(page, TODOS);
    await page.getByRole('listitem').filter({ hasText: TODOS[1] }).getByRole('checkbox').check();

    await page.getByRole('button', { name: 'Clear completed' }).click();

    await expect(page.getByTestId('todo-title')).toHaveText([TODOS[0], TODOS[2]]);
  });
});

test.describe('Todo filters @regression', () => {
  test.beforeEach(async ({ page }) => {
    await addTodos(page, TODOS);
    await page.getByRole('listitem').filter({ hasText: TODOS[1] }).getByRole('checkbox').check();
  });

  test('Active shows only outstanding items', async ({ page }) => {
    await applyFilter(page, 'Active');
    await expect(page.getByTestId('todo-title')).toHaveText([TODOS[0], TODOS[2]]);
  });

  test('Completed shows only finished items', async ({ page }) => {
    await applyFilter(page, 'Completed');
    await expect(page.getByTestId('todo-title')).toHaveText([TODOS[1]]);
  });

  test('All shows every item, and the three filters partition the list', async ({ page }) => {
    await applyFilter(page, 'Active');
    const active = await page.getByTestId('todo-title').allInnerTexts();

    await applyFilter(page, 'Completed');
    const completed = await page.getByTestId('todo-title').allInnerTexts();

    await applyFilter(page, 'All');
    const all = await page.getByTestId('todo-title').allInnerTexts();

    /* Active and Completed must be a clean partition of All -- no item missing from both,
       none counted twice. An "is it visible" assertion per filter cannot catch either. */
    expect([...active, ...completed].sort()).toEqual([...all].sort());
  });
});

test.describe('Persistence @regression', () => {
  test('items survive a reload', async ({ page }) => {
    await addTodos(page, TODOS);
    await page.getByRole('listitem').filter({ hasText: TODOS[0] }).getByRole('checkbox').check();

    await page.reload();

    await expect(page.getByTestId('todo-title')).toHaveText([...TODOS]);
    await expect(page.getByRole('listitem').filter({ hasText: TODOS[0] })).toHaveClass(/completed/);
  });
});
