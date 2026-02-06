import { test, expect } from '@playwright/test';

test.describe('Consent scenarios', () => {
  test('deny consent keeps ad slot blocked', async ({ page }) => {
    await page.goto('/ads');
    await expect(
      page.getByRole('heading', { name: 'تبلیغات با احترام به حریم خصوصی' }),
    ).toBeVisible();
    await expect(page.getByText('نمایش تبلیغات؟')).toBeVisible();
    await expect(page.getByText('نمایش تبلیغات؟')).toBeVisible();
    await expect(page.getByAltText('بنر نمونه اسپانسر محلی')).toHaveCount(0);
  });

  test('accept consent path is exposed to user', async ({ page }) => {
    await page.goto('/ads');
    await expect(
      page.getByRole('heading', { name: 'تبلیغات با احترام به حریم خصوصی' }),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'قبول نمایش تبلیغات' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'فعلاً نه' })).toBeVisible();
  });
});
