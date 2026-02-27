import { expect, test } from '@playwright/test';

test.describe('asdev smoke', () => {
  test('asdev page loads with rebranded profile content in mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/asdev');

    await expect(page.locator('h1')).toContainText('علیرضا صفایی مهندس سیستم های وب');
    await expect(
      page.getByText(
        'تمرکز اصلی روی معماری نرم‌افزار، طراحی سیستم، بهبود کیفیت تحویل و ایجاد تجربه کاربری فارسیِ دقیق و حرفه‌ای است.',
      ),
    ).toBeVisible();
    await expect(
      page.getByText('برای کسب اطلاعات و نحوه همکاری و دیدن نمونه کارها به وبسایت من مراجعه کنین.'),
    ).toBeVisible();
    await expect(page.getByRole('link', { name: 'ورود به وبسایت رسمی' })).toHaveAttribute(
      'href',
      'https://alirezasafaeisystems.ir/',
    );
  });
});
