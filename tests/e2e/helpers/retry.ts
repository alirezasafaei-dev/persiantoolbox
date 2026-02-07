import { expect, type Page, type Route } from '@playwright/test';

export const retryTimeouts = {
  firstFailureMs: 90_000,
  recoveryMs: 15_000,
} as const;

export const isRetryBackendEnabled = process.env['E2E_RETRY_BACKEND'] === '1';

export async function routeJsonByPath(
  page: Page,
  pathname: string,
  handler: (route: Route) => Promise<void>,
) {
  await page.route((url) => url.pathname === pathname, handler);
}

export async function expectCounterToIncrease(counter: () => number, timeout: number) {
  await expect.poll(counter, { timeout }).toBeGreaterThan(0);
}
