import { test, expect } from '@playwright/test';

const runRetryScenarios = process.env['E2E_RETRY_BACKEND'] === '1';

test.describe('Retry scenarios for account/history flows', () => {
  test.skip(
    !runRetryScenarios,
    'Enable with E2E_RETRY_BACKEND=1 in deterministic backend fixtures.',
  );

  test('account history retries after transient API failure', async ({ page }) => {
    let historyGetCount = 0;

    await page.route('**/api/auth/me*', async (route) => {
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
    });

    await page.route('**/api/history*', async (route) => {
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
    });

    await page.goto('/account');
    await expect(page.getByText('دریافت تاریخچه با خطا مواجه شد.')).toBeVisible();
    await page.getByRole('button', { name: 'تلاش مجدد' }).click();
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
    await page.route('**/api/history*', async (route) => {
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
    });

    await page.goto('/date-tools');
    await expect(page.getByText('دریافت تاریخچه با خطا مواجه شد.')).toBeVisible();
    await page.getByRole('button', { name: 'تلاش مجدد' }).click();
    await expect(page.getByText('date-tools')).toBeVisible();
  });
});
