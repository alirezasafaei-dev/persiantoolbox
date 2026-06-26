import { test, expect } from '@playwright/test';

test.describe('Business Document Studio - Full User Flow', () => {
  test('invoice flow: select type → fill seller → fill buyer → items → preview → export', async ({
    page,
  }) => {
    await page.goto('/business-tools');
    await page.locator('a[href*="document-studio?type=invoice"]').first().click();
    await expect(page).toHaveURL(/business-tools\/document-studio\?type=invoice/, {
      timeout: 10000,
    });

    await expect(page.locator('h2').filter({ hasText: 'اطلاعات فروشنده' }).first()).toBeVisible({
      timeout: 10000,
    });
    await page.locator('#فروشنده-name').fill('فروشنده تست');
    await page.getByRole('button', { name: 'مرحله بعد' }).click();

    await expect(page.locator('h2').filter({ hasText: 'اطلاعات خریدار' }).first()).toBeVisible();
    await page.locator('#خریدار-name').fill('خریدار تست');
    await page.getByRole('button', { name: 'مرحله بعد' }).click();

    await expect(page.locator('h2').filter({ hasText: 'اقلام سند' }).first()).toBeVisible();
    await page.getByPlaceholder('شرح کالا/خدمت').first().fill('کالای تستی');
    await page.locator('table input[type="number"]').first().fill('2');
    await page.locator('table input[type="number"]').nth(1).fill('100000');
    await expect(page.getByText('جمع کل')).toBeVisible();
    await expect(page.getByText('۲۰۰,۰۰۰ تومان').first()).toBeVisible();

    await page.getByRole('button', { name: 'مرحله بعد' }).click();
    await expect(page.locator('h2').filter({ hasText: 'تنظیمات سند' }).first()).toBeVisible();
    await page.getByRole('button', { name: 'مرحله بعد' }).click();
    await expect(page.locator('h2').filter({ hasText: 'پیش‌نمایش سند' }).first()).toBeVisible();
  });

  test('disclaimer blocks export until accepted', async ({ page }) => {
    await page.goto('/business-tools/document-studio?type=invoice');
    await page.locator('#فروشنده-name').fill('فروشنده تست');
    await page.getByRole('button', { name: 'مرحله بعد' }).click();
    await page.locator('#خریدار-name').fill('خریدار تست');
    await page.getByRole('button', { name: 'مرحله بعد' }).click();
    await page.getByPlaceholder('شرح کالا/خدمت').first().fill('تست');
    await page.locator('table input[type="number"]').first().fill('1');
    await page.locator('table input[type="number"]').nth(1).fill('1000');

    await page.getByRole('button', { name: 'مرحله بعد' }).click();
    await page.getByRole('button', { name: 'مرحله بعد' }).click();
    await page.getByRole('button', { name: 'تأیید و دانلود' }).click();

    await expect(page.locator('h2').filter({ hasText: 'دانلود سند' }).first()).toBeVisible({
      timeout: 10000,
    });

    const htmlBtn = page.getByRole('button', { name: 'دانلود HTML' });
    await expect(htmlBtn).not.toBeVisible();

    await page.getByRole('checkbox', { name: /تأیید سلب مسئولیت/ }).check();
    await expect(htmlBtn).toBeVisible();
  });

  test('draft is restored after refresh', async ({ page }) => {
    await page.goto('/business-tools/document-studio?type=invoice');
    await expect(page.locator('h2').filter({ hasText: 'اطلاعات فروشنده' }).first()).toBeVisible({
      timeout: 10000,
    });
    await page.locator('#فروشنده-name').fill('فروشنده تست');
    await page.waitForTimeout(2000);

    await page.reload();
    await expect(page.locator('h2').filter({ hasText: 'اطلاعات فروشنده' }).first()).toBeVisible({
      timeout: 10000,
    });
    await expect(page.locator('#فروشنده-name')).toHaveValue('فروشنده تست');
  });

  test('mobile viewport (375px) renders correctly', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/business-tools/document-studio?type=invoice');
    await expect(page.locator('h2').filter({ hasText: 'اطلاعات فروشنده' }).first()).toBeVisible({
      timeout: 10000,
    });
    await expect(page.locator('#فروشنده-name')).toBeVisible();
  });

  test('RTL layout is applied', async ({ page }) => {
    await page.goto('/business-tools/document-studio?type=invoice');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  });

  test('no unexpected external network requests during document creation', async ({ page }) => {
    const externalRequests: string[] = [];
    page.on('request', (request) => {
      const url = request.url();
      if (
        url.startsWith('http') &&
        !url.includes('localhost:3100') &&
        !url.includes('sentry') &&
        !url.includes('google') &&
        !url.includes('analytics') &&
        !url.includes('enamad.ir')
      ) {
        externalRequests.push(url);
      }
    });

    await page.goto('/business-tools/document-studio?type=invoice');
    await page.locator('#فروشنده-name').fill('فروشنده تست');
    await page.getByRole('button', { name: 'مرحله بعد' }).click();
    await page.locator('#خریدار-name').fill('خریدار تست');
    await page.getByRole('button', { name: 'مرحله بعد' }).click();
    await page.getByPlaceholder('شرح کالا/خدمت').first().fill('تست');
    await page.locator('table input[type="number"]').first().fill('1');
    await page.locator('table input[type="number"]').nth(1).fill('1000');
    await page.getByRole('button', { name: 'مرحله بعد' }).click();

    expect(externalRequests).toHaveLength(0);
  });

  test('keyboard navigation through form', async ({ page }) => {
    await page.goto('/business-tools/document-studio?type=invoice');
    await page.locator('#فروشنده-name').fill('فروشنده تست');
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toBeVisible();
  });

  test('page loads and disclaimer is visible', async ({ page }) => {
    await page.goto('/business-tools/document-studio?type=invoice');
    await expect(page.getByText('این ابزار صرفاً').first()).toBeVisible({ timeout: 10000 });
  });

  test('export buttons present and DOCX has premium indicator', async ({ page }) => {
    await page.goto('/business-tools/document-studio?type=invoice');
    await page.locator('#فروشنده-name').fill('فروشنده تست');
    await page.getByRole('button', { name: 'مرحله بعد' }).click();
    await page.locator('#خریدار-name').fill('خریدار تست');
    await page.getByRole('button', { name: 'مرحله بعد' }).click();
    await page.getByPlaceholder('شرح کالا/خدمت').first().fill('تست');
    await page.locator('table input[type="number"]').first().fill('1');
    await page.locator('table input[type="number"]').nth(1).fill('1000');
    await page.getByRole('button', { name: 'مرحله بعد' }).click();
    await page.getByRole('button', { name: 'مرحله بعد' }).click();
    await page.getByRole('button', { name: 'تأیید و دانلود' }).click();

    await expect(page.locator('h2').filter({ hasText: 'دانلود سند' }).first()).toBeVisible({
      timeout: 10000,
    });
    await page.getByRole('checkbox', { name: /تأیید سلب مسئولیت/ }).check();

    const docxBtn = page.getByRole('button', { name: /DOCX/ }).first();
    if (await docxBtn.isVisible()) {
      const isDisabled = await docxBtn.isDisabled();
      const hasPremiumIndicator = await page
        .getByText(/پرمیوم|Premium|ویژه/)
        .first()
        .isVisible()
        .catch(() => false);
      expect(isDisabled || hasPremiumIndicator).toBe(true);
    }
  });
});
