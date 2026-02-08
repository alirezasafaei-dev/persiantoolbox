import { expect, test } from '@playwright/test';
import { adminEmail, ensureAdminSession, isAdminBackendEnabled } from './helpers/admin';

test.use({ serviceWorkers: 'block' });

test.describe('Admin site settings', () => {
  test.skip(
    !isAdminBackendEnabled,
    'Enable with E2E_ADMIN_BACKEND=1 and DATABASE_URL for DB-backed admin flows.',
  );

  test('loads current settings and validates invalid URL payload', async ({ page }) => {
    await ensureAdminSession(page);

    const getResponse = await page.request.get('/api/admin/site-settings');
    expect(getResponse.status()).toBe(200);
    const current = (await getResponse.json()) as {
      ok: boolean;
      settings: {
        developerName: string;
        developerBrandText: string;
        orderUrl: string | null;
        portfolioUrl: string | null;
      };
    };
    expect(current.ok).toBe(true);

    await page.goto('/admin/site-settings');
    await expect(
      page.getByRole('heading', { name: 'مدیریت لینک ثبت سفارش و نمونه‌کارها' }),
    ).toBeVisible();

    await expect(page.getByLabel('نام توسعه‌دهنده')).toHaveValue(current.settings.developerName);
    await expect(page.getByLabel('متن برند')).toHaveValue(current.settings.developerBrandText);
    await expect(page.getByLabel('لینک ثبت سفارش')).toHaveValue(current.settings.orderUrl ?? '');
    await expect(page.getByLabel('لینک نمونه‌کارها / سایت شخصی')).toHaveValue(
      current.settings.portfolioUrl ?? '',
    );

    await page.getByLabel('لینک ثبت سفارش').fill('https://example.com/order');
    await page.getByLabel('لینک نمونه‌کارها / سایت شخصی').fill('ftp://invalid.local/path');
    await expect(page.getByLabel('لینک نمونه‌کارها / سایت شخصی')).toHaveValue(
      'ftp://invalid.local/path',
    );
    await page.getByRole('button', { name: 'ذخیره تنظیمات' }).click();
    await expect(page.getByText('portfolioUrl')).toBeVisible();
  });

  test('saves settings and reflects links in footer', async ({ page }) => {
    await ensureAdminSession(page);

    const stamp = Date.now();
    const nextName = `Admin E2E ${stamp}`;
    const nextBrand = `این وب‌سایت توسط ${adminEmail} مدیریت و توسعه داده شده است.`;
    const nextOrder = `https://example.com/order?ref=${stamp}`;
    const nextPortfolio = `https://example.com/portfolio/${stamp}`;

    await page.goto('/admin/site-settings');
    await page.getByLabel('نام توسعه‌دهنده').fill(nextName);
    await page.getByLabel('متن برند').fill(nextBrand);
    await page.getByLabel('لینک ثبت سفارش').fill(nextOrder);
    await page.getByLabel('لینک نمونه‌کارها / سایت شخصی').fill(nextPortfolio);

    await page.getByRole('button', { name: 'ذخیره تنظیمات' }).click();
    await expect(page.getByText('تنظیمات با موفقیت ذخیره شد.')).toBeVisible();

    await page.goto('/');
    await expect(page.getByText(nextBrand)).toBeVisible();
    await expect(page.getByRole('link', { name: 'ثبت سفارش' })).toHaveAttribute('href', nextOrder);
    await expect(page.getByRole('link', { name: 'نمونه‌کارها / سایت شخصی' })).toHaveAttribute(
      'href',
      nextPortfolio,
    );
  });
});
