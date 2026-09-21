import type { APIRequestContext } from '@playwright/test';

/**
 * One reachability probe per worker, shared by every practice-site spec.
 *
 * The practice site is third-party and goes down. When it does, the honest result is
 * "skipped -- target unavailable", not a wall of red that says nothing about this code.
 * Memoising the promise means each worker pays for one request, not one per test.
 */
const probes = new Map<string, Promise<number>>();

export async function targetStatus(request: APIRequestContext, url: string): Promise<number> {
  let probe = probes.get(url);
  if (!probe) {
    probe = request
      .get(url, { failOnStatusCode: false, timeout: 15_000 })
      .then((r) => r.status())
      .catch(() => 0);
    probes.set(url, probe);
  }
  return probe;
}

export function unavailableReason(url: string, status: number): string {
  return status === 0
    ? `${url} is unreachable -- target unavailable, not a regression in this repo`
    : `${url} returned HTTP ${status} -- target unavailable, not a regression in this repo`;
}
