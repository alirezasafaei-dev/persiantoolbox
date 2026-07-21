import { test, expect } from '@playwright/test';

const TEST_EMAIL = `test-e2e-${Date.now()}@persian-tools.local`;
const TEST_PASSWORD = 'TestPassword123!';

test.describe('Complete user journey', () => {
  test('register → account → subscription → premium flow', async ({ page }) => {
    await page.goto('/account');
    await page.waitForLoadState('load');

    const hasDb = await page.evaluate(() => {
      return fetch('/api/auth/me')
        .then((r) => r.ok)
        .catch(() => false);
    });

    if (!hasDb) {
      const heading = page.getByRole('heading', { level: 1 });
      await expect(heading).toHaveText('ورود به حساب');
      await expect(page.getByRole('button', { name: 'ثبت‌نام' })).toBeVisible();
      return;
    }

    const emailInput = page.getByRole('textbox', { name: 'ایمیل' }).first();
    const passwordInput = page.getByRole('textbox', { name: 'رمز عبور' }).first();

    await emailInput.fill(TEST_EMAIL);
    await passwordInput.fill(TEST_PASSWORD);

    const registerButton = page.getByRole('button', { name: 'ثبت‌نام' });
    await registerButton.click();
    await page.waitForLoadState('load');

    const pageContent = await page.textContent('body');
    expect(pageContent).toContain(TEST_EMAIL);

    const subscriptionSection = page.locator('text=وضعیت اشتراک');
    await expect(subscriptionSection).toBeVisible();

    await page.goto('/premium');
    await page.waitForLoadState('load');

    const premiumHeading = page.getByRole('heading', { level: 1 });
    await expect(premiumHeading).toContainText('اشتراک حرفه‌ای');

    const planCards = page.locator('text=انتخاب طرح');
    const planCount = await planCards.count();
    expect(planCount).toBeGreaterThanOrEqual(3);
  });

  test('login → account → logout flow', async ({ page }) => {
    await page.goto('/account');
    await page.waitForLoadState('load');

    const hasDb = await page.evaluate(() => {
      return fetch('/api/auth/me')
        .then((r) => r.ok)
        .catch(() => false);
    });

    if (!hasDb) {
      const heading = page.getByRole('heading', { level: 1 });
      await expect(heading).toHaveText('ورود به حساب');
      await expect(page.getByRole('button', { name: 'ورود' }).last()).toBeVisible();
      return;
    }

    const emailInput = page.getByRole('textbox', { name: 'ایمیل' }).first();
    if (await emailInput.isVisible()) {
      await emailInput.fill(TEST_EMAIL);
      await page.getByRole('textbox', { name: 'رمز عبور' }).first().fill(TEST_PASSWORD);
      await page.getByRole('button', { name: 'ثبت‌نام' }).click();
      await page.waitForLoadState('load');
    }

    const logoutButton = page.getByRole('button', { name: 'خروج' });
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
    }

    await page.goto('/account');
    await page.waitForLoadState('load');

    const loginEmailInput = page.getByRole('textbox', { name: 'ایمیل' }).nth(1);
    if (await loginEmailInput.isVisible()) {
      await loginEmailInput.fill(TEST_EMAIL);
      await page.getByRole('textbox', { name: 'رمز عبور' }).nth(1).fill(TEST_PASSWORD);
      await page.getByRole('button', { name: 'ورود' }).click();
      await page.waitForLoadState('load');

      const pageContent = await page.textContent('body');
      expect(pageContent).toContain(TEST_EMAIL);
    }
  });

  test('tool usage → CTA click → portfolio redirect', async ({ page }) => {
    await page.goto('/pdf-tools/merge/merge-pdf');
    await page.waitForLoadState('load');

    const toolHeading = page.getByRole('heading', { level: 1 });
    await expect(toolHeading).toBeVisible();

    const ctaLink = page.locator('a[href*="alirezasafaeisystems.ir"]').first();
    await expect(ctaLink).toBeVisible();

    const href = await ctaLink.getAttribute('href');
    expect(href).toContain('utm_source=toolbox');
    expect(href).toContain('utm_medium=');
  });

  test('all public main routes render correctly', async ({ page }) => {
    const routes = [
      { path: '/', expectedText: 'ابزارهای فارسی' },
      { path: '/pdf-tools', expectedText: 'ابزارهای PDF' },
      { path: '/image-tools', expectedText: 'ابزارهای تصویر' },
      { path: '/tools', expectedText: 'ابزارهای مالی' },
      { path: '/date-tools', expectedText: 'ابزارهای تاریخ' },
      { path: '/text-tools', expectedText: 'ابزارهای متنی' },
    ];

    for (const route of routes) {
      await page.goto(route.path);
      await page.waitForLoadState('load');
      const content = await page.textContent('body');
      expect(content).toContain(route.expectedText);
    }
  });

  test('subscription route renders management or the account gate', async ({ page }) => {
    await page.goto('/subscription');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      /مدیریت اشتراک|ورود به حساب/,
      { timeout: 15000 },
    );
  });
});
