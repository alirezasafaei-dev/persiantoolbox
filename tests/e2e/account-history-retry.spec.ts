import { test, expect } from '@playwright/test';

const runRetryScenarios = process.env['E2E_RETRY_BACKEND'] === '1';
const firstFailureTimeoutMs = 90_000;
const recoveryTimeoutMs = 15_000;

test.use({ serviceWorkers: 'block' });

test.describe('Retry scenarios for account/history flows', () => {
  test.skip(
    !runRetryScenarios,
    'Enable with E2E_RETRY_BACKEND=1 in deterministic backend fixtures.',
  );

  test('account page retries after transient auth/me failure', async ({ page }) => {
    let authMeCount = 0;

    await page.route(
      (url) => url.pathname === '/api/auth/me',
      async (route) => {
        authMeCount += 1;
        if (authMeCount === 1) {
          await route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({ ok: false, error: 'SERVER_ERROR' }),
          });
          return;
        }
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            user: { id: 'u-1', email: 'user@example.com', createdAt: Date.now() - 1000 },
            subscription: {
              id: 'sub-1',
              planId: 'basic_monthly',
              status: 'active',
              startedAt: Date.now() - 86_400_000,
              expiresAt: Date.now() + 86_400_000,
            },
          }),
        });
      },
    );

    await page.route(
      (url) => url.pathname === '/api/history',
      async (route) => {
        if (route.request().method() !== 'GET') {
          await route.continue();
          return;
        }
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ entries: [] }),
        });
      },
    );

    await page.goto('/account');
    await expect.poll(() => authMeCount, { timeout: firstFailureTimeoutMs }).toBeGreaterThan(0);
    await expect(page.getByText('بارگذاری اطلاعات حساب با خطا مواجه شد.')).toBeVisible({
      timeout: firstFailureTimeoutMs,
    });
    await page.getByRole('button', { name: 'تلاش مجدد' }).click();
    await expect(page.getByRole('heading', { name: 'حساب کاربری' })).toBeVisible({
      timeout: recoveryTimeoutMs,
    });
    await expect(page.getByText('user@example.com')).toBeVisible();
  });

  test('account history retries after transient API failure', async ({ page }) => {
    let authMeCount = 0;
    let historyGetCount = 0;

    await page.route(
      (url) => url.pathname === '/api/auth/me',
      async (route) => {
        authMeCount += 1;
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            user: { id: 'u-1', email: 'user@example.com', createdAt: Date.now() - 1000 },
            subscription: {
              id: 'sub-1',
              planId: 'basic_monthly',
              status: 'active',
              startedAt: Date.now() - 86_400_000,
              expiresAt: Date.now() + 86_400_000,
            },
          }),
        });
      },
    );

    await page.route(
      (url) => url.pathname === '/api/history',
      async (route) => {
        if (route.request().method() !== 'GET') {
          await route.continue();
          return;
        }
        historyGetCount += 1;
        if (historyGetCount === 1) {
          await route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({ ok: false, error: 'SERVER_ERROR' }),
          });
          return;
        }
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            entries: [
              {
                id: 'h-1',
                tool: 'loan-calculator',
                inputSummary: 'مبلغ: ۱۰۰۰۰۰۰۰',
                outputSummary: 'قسط: ۲۵۰۰۰۰۰',
                createdAt: Date.now(),
              },
            ],
          }),
        });
      },
    );

    await page.goto('/account');
    await expect.poll(() => authMeCount, { timeout: firstFailureTimeoutMs }).toBeGreaterThan(0);
    await expect.poll(() => historyGetCount, { timeout: firstFailureTimeoutMs }).toBeGreaterThan(0);
    await expect(page.getByText('دریافت تاریخچه با خطا مواجه شد.')).toBeVisible({
      timeout: firstFailureTimeoutMs,
    });
    await page.getByRole('button', { name: 'تلاش مجدد' }).click();
    await expect(page.getByText('ارتباط مجدد برقرار شد و تاریخچه بازیابی شد.')).toBeVisible({
      timeout: recoveryTimeoutMs,
    });
    await expect(page.getByText('loan-calculator')).toBeVisible();
  });

  test('date-tools recent history retries after transient API failure', async ({
    page,
    context,
  }) => {
    await context.addCookies([
      {
        name: 'pt_session',
        value: 'mock-session',
        url: 'http://localhost:3100',
      },
    ]);

    let historyGetCount = 0;
    await page.route(
      (url) => url.pathname === '/api/history',
      async (route) => {
        if (route.request().method() !== 'GET') {
          await route.continue();
          return;
        }
        historyGetCount += 1;
        if (historyGetCount === 1) {
          await route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({ ok: false, error: 'SERVER_ERROR' }),
          });
          return;
        }
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            entries: [
              {
                id: 'h-2',
                tool: 'date-tools',
                inputSummary: '1403/01/01',
                outputSummary: '2024/03/20',
                createdAt: Date.now(),
              },
            ],
          }),
        });
      },
    );

    await page.goto('/date-tools');
    await expect.poll(() => historyGetCount, { timeout: firstFailureTimeoutMs }).toBeGreaterThan(0);
    await expect(page.getByText('دریافت تاریخچه با خطا مواجه شد.')).toBeVisible({
      timeout: firstFailureTimeoutMs,
    });
    await page.getByRole('button', { name: 'تلاش مجدد' }).click();
    await expect(page.getByText('اتصال دوباره برقرار شد و تاریخچه بازیابی شد.')).toBeVisible({
      timeout: recoveryTimeoutMs,
    });
    await expect(page.getByText('date-tools')).toBeVisible();
  });
});
