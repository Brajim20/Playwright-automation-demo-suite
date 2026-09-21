/**
 * Test data factories.
 *
 * Every run creates its own account. Nothing in this suite depends on a magic pre-existing
 * user, so a wiped or expired account cannot take four specs down with it.
 */

export interface TestUser {
  email: string;
  password: string;
  username: string;
}

/** Collision-proof across parallel workers and across repeat runs on the same second. */
function uniqueToken(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export function buildTestUser(prefix = 'qa'): TestUser {
  const username = `${prefix}_${uniqueToken()}`;
  return {
    username,
    email: `${username}@example.com`,
    password: process.env.PRACTICE_NEW_USER_PASSWORD ?? 'Demo!Suite#2026',
  };
}

export interface BillingDetails {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  postcode: string;
  orderNotes: string;
}

export function buildBillingDetails(): BillingDetails {
  return {
    firstName: 'Ada',
    lastName: 'Lovelace',
    phone: '5551234567',
    address: '12 Analytical Engine Way',
    city: 'London',
    postcode: '10001',
    orderNotes: 'Please deliver between 9 AM and 5 PM.',
  };
}
