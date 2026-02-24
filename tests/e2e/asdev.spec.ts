import { expect, test } from '@playwright/test';

test.describe('asdev smoke', () => {
  test('asdev page loads and contains cross-site links in mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/asdev');

    await expect(page.locator('h1')).toContainText('ASDEV');
    await expect(page.getByRole('heading', { name: /پورتفولیو و راه‌های ارتباطی/ })).toBeVisible();
    await expect(
      page.getByRole('heading', { name: /PersianToolbox — ابزارهای فارسی/ }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: /Audit IR — بررسی فنی و امنیتی/ }),
    ).toBeVisible();
    await expect(page.locator('a[href*="utm_campaign=asdev_network"]')).toHaveCount(3);
  });
});
