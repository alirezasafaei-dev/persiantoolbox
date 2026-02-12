import { test, expect } from '@playwright/test';

test.describe('Consent scenarios', () => {
  test('ads surface is intentionally unavailable in no-login mode', async ({ page }) => {
    await page.goto('/ads');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'صفحه‌ای که دنبالش بودید پیدا نشد',
    );
  });

  test('home does not render ad consent controls or ad slots', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('نمایش تبلیغات؟')).toHaveCount(0);
    await expect(page.locator('[data-ad-slot]')).toHaveCount(0);
  });
});
