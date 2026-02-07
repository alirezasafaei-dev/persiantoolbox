import { test, expect } from '@playwright/test';

test.describe('Consent scenarios', () => {
  test('deny consent keeps ad slot blocked', async ({ page }) => {
    await page.goto('/ads');
    await expect(
      page.getByRole('heading', { name: 'تبلیغات با احترام به حریم خصوصی' }),
    ).toBeVisible();
    await expect(page.getByText('نمایش تبلیغات؟')).toBeVisible();
    await page.getByRole('button', { name: 'فعلاً نه' }).click();
    await expect(page.getByText('نمایش تبلیغات؟')).toBeVisible();
    await expect(page.locator('[data-ad-variant] img')).toHaveCount(0);
  });

  test('accept consent renders local ad slot with stable local variant', async ({ page }) => {
    await page.goto('/ads');
    await expect(
      page.getByRole('heading', { name: 'تبلیغات با احترام به حریم خصوصی' }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'قبول نمایش تبلیغات' }).click();
    const slot = page.locator('[data-ad-slot="ads-transparency-demo-slot"]').first();
    await expect(slot).toBeVisible();

    const firstVariant = await slot.getAttribute('data-ad-variant');
    expect(firstVariant).toMatch(/control|challenger/);

    await page.reload();
    const secondVariant = await page
      .locator('[data-ad-slot="ads-transparency-demo-slot"]')
      .first()
      .getAttribute('data-ad-variant');
    expect(secondVariant).toBe(firstVariant);
  });
});
