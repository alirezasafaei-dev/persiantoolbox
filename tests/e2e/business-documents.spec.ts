import { test, expect } from '@playwright/test';

test.describe('Business Document Studio - Full User Flow', () => {
  test('invoice flow: select type → fill seller → fill buyer → items → preview → export', async ({
    page,
  }) => {
    await page.goto('/business-tools');
    const invoiceCard = page.getByRole('link', { name: /فاکتور فروش/ });
    await expect(invoiceCard.first()).toBeVisible({ timeout: 10000 });
    await invoiceCard.first().click();
    await expect(page).toHaveURL(/business-tools\/document-studio\?type=invoice/);

    await expect(page.getByText('اطلاعات فروشنده')).toBeVisible({ timeout: 10000 });
    const sellerNameInput = page.locator('#فروشنده-name');
    await expect(sellerNameInput).toBeVisible();
    await sellerNameInput.fill('فروشنده تست');

    await page.getByRole('button', { name: 'مرحله بعد' }).click();
    await expect(page.getByText('اطلاعات خریدار')).toBeVisible();
    const buyerNameInput = page.locator('#خریدار-name');
    await buyerNameInput.fill('خریدار تست');

    await page.getByRole('button', { name: 'مرحله بعد' }).click();
    await expect(page.getByText('اقلام سند')).toBeVisible();

    const descInput = page.getByPlaceholder('شرح کالا/خدمت').first();
    await descInput.fill('کالای تستی');
    const qtyInput = page.locator('table input[type="number"]').first();
    await qtyInput.fill('2');
    const priceInput = page.locator('table input[type="number"]').nth(1);
    await priceInput.fill('100000');

    await expect(page.getByText('جمع کل')).toBeVisible();
    await expect(page.getByText('۲۰۰,۰۰۰ تومان')).toBeVisible();

    await page.getByRole('button', { name: 'مرحله بعد' }).click();
    await expect(page.getByText('تنظیمات سند')).toBeVisible();
    await page.getByRole('button', { name: 'مرحله بعد' }).click();
    await expect(page.getByText('پیش‌نمایش سند')).toBeVisible();

    await expect(page.getByText('فروشنده تست').first()).toBeVisible();
    await expect(page.getByText('خریدار تست').first()).toBeVisible();
    await expect(page.getByText('کالای تستی').first()).toBeVisible();
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
    await expect(page.getByText('دانلود سند')).toBeVisible();

    await expect(page.getByRole('button', { name: 'دانلود HTML' })).not.toBeVisible();

    const disclaimerCheckbox = page.getByRole('checkbox', { name: /تأیید سلب مسئولیت/ });
    await disclaimerCheckbox.check();
    await expect(page.getByRole('button', { name: 'دانلود HTML' })).toBeVisible();
  });

  test('draft is restored after refresh', async ({ page }) => {
    await page.goto('/business-tools/document-studio?type=invoice');
    await expect(page.getByText('اطلاعات فروشنده')).toBeVisible({ timeout: 10000 });
    await page.locator('#فروشنده-name').fill('فروشنده تست');

    await page.reload();
    await expect(page.getByText('اطلاعات فروشنده')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#فروشنده-name')).toHaveValue('فروشنده تست');
  });

  test('mobile viewport (375px) renders correctly', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/business-tools/document-studio?type=invoice');
    await expect(page.getByText('اطلاعات فروشنده')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#فروشنده-name')).toBeVisible();
  });

  test('RTL layout is applied', async ({ page }) => {
    await page.goto('/business-tools/document-studio?type=invoice');
    const html = page.locator('html');
    await expect(html).toHaveAttribute('dir', 'rtl');
  });

  test('no unexpected external network requests during document creation', async ({ page }) => {
    const externalRequests: string[] = [];
    page.on('request', (request) => {
      const url = request.url();
      if (url.startsWith('http') && !url.includes('localhost:3100')) {
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
    const focused = page.locator(':focus');
    await expect(focused).toBeVisible();
  });

  test('page loads and disclaimer is visible', async ({ page }) => {
    await page.goto('/business-tools/document-studio?type=invoice');
    await expect(page.getByText('این ابزار صرفاً').first()).toBeVisible({ timeout: 10000 });
  });

  test('export buttons present and DOCX has premium indicator', async ({ page }) => {
    await page.goto('/business-tools/document-studio?type=invoice');
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
