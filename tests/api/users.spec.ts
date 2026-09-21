import { test, expect } from '@playwright/test';

/**
 * API-layer tests.
 *
 * These run with no browser at all -- the `api` project in playwright.config.ts has no
 * `devices` entry -- so they are fast, and a failure here points at the contract rather than
 * at rendering.
 */
const API_KEY = process.env.REQRES_API_KEY ?? 'reqres-free-v1';

test.use({ extraHTTPHeaders: { 'x-api-key': API_KEY } });

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  avatar: string;
}

interface UserListResponse {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
  data: User[];
}

test.describe('GET /api/users @smoke', () => {
  test('returns a paginated list with a well-formed envelope', async ({ request }) => {
    const response = await request.get('/api/users', { params: { page: 2 } });

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');

    const body = (await response.json()) as UserListResponse;

    await test.step('Pagination envelope', () => {
      expect(body.page).toBe(2);
      expect(body.per_page).toBeGreaterThan(0);
      expect(body.total).toBeGreaterThan(0);
      /* The envelope has to be internally consistent -- a total_pages that disagrees with
         total/per_page is a real contract bug that a status-code check would sail past. */
      expect(body.total_pages).toBe(Math.ceil(body.total / body.per_page));
    });

    await test.step('Every record matches the user schema', () => {
      expect(body.data.length).toBeGreaterThan(0);
      for (const user of body.data) {
        expect(typeof user.id, `id of user ${user.id}`).toBe('number');
        expect(user.email).toMatch(/^[^@\s]+@[^@\s]+\.[^@\s]+$/);
        expect(user.first_name.length).toBeGreaterThan(0);
        expect(user.last_name.length).toBeGreaterThan(0);
        expect(user.avatar).toMatch(/^https?:\/\//);
      }
    });
  });

  test('pages do not overlap', async ({ request }) => {
    const [first, second] = await Promise.all([
      request.get('/api/users', { params: { page: 1 } }),
      request.get('/api/users', { params: { page: 2 } }),
    ]);

    const firstIds = ((await first.json()) as UserListResponse).data.map((u) => u.id);
    const secondIds = ((await second.json()) as UserListResponse).data.map((u) => u.id);

    /* Pagination that repeats a record across pages is a classic off-by-one. Asserting each
       page in isolation cannot see it. */
    expect(firstIds.filter((id) => secondIds.includes(id))).toEqual([]);
  });
});

test.describe('GET /api/users/{id} @regression', () => {
  test('returns a single user', async ({ request }) => {
    const response = await request.get('/api/users/2');

    expect(response.status()).toBe(200);
    const body = (await response.json()) as { data: User };
    expect(body.data.id).toBe(2);
    expect(body.data.email).toMatch(/@/);
  });

  test('returns 404 for an unknown id', async ({ request }) => {
    const response = await request.get('/api/users/23');

    expect(response.status()).toBe(404);
  });
});

test.describe('POST /api/users @regression', () => {
  test('echoes the created resource with an id and timestamp', async ({ request }) => {
    const payload = { name: 'ada lovelace', job: 'analyst' };

    const response = await request.post('/api/users', { data: payload });

    expect(response.status()).toBe(201);
    const body = (await response.json()) as typeof payload & { id: string; createdAt: string };
    expect(body.name).toBe(payload.name);
    expect(body.job).toBe(payload.job);
    expect(body.id).toBeTruthy();
    expect(Number.isNaN(Date.parse(body.createdAt))).toBe(false);
  });
});

test.describe('Authentication @regression', () => {
  test('rejects a login with no password', async ({ request }) => {
    const response = await request.post('/api/login', {
      data: { email: 'eve.holt@reqres.in' },
    });

    expect(response.status()).toBe(400);
    const body = (await response.json()) as { error: string };
    expect(body.error).toMatch(/password/i);
  });

  test('issues a token for valid credentials', async ({ request }) => {
    const response = await request.post('/api/login', {
      data: { email: 'eve.holt@reqres.in', password: 'cityslicka' },
    });

    expect(response.status()).toBe(200);
    const body = (await response.json()) as { token: string };
    expect(body.token).toBeTruthy();
  });
});
