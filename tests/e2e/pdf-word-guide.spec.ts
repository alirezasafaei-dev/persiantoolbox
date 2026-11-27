import { expect, test } from '@playwright/test';

test('Word to PDF links to local export steps without accepting a document', async ({ page }) => {
  await page.goto('/pdf-tools/convert/word-to-pdf');

  await expect(
    page.getByRole('heading', { level: 1, name: 'راهنمای تبدیل Word به PDF' }),
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Microsoft Word' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'LibreOffice Writer' })).toBeVisible();
  await expect(page.locator('input[type="file"]')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'تبدیل به PDF' })).toHaveCount(0);
  await expect(
    page.locator('script[type="application/ld+json"]').filter({
      hasText: /"@type":"(?:SoftwareApplication|WebApplication)"/,
    }),
  ).toHaveCount(0);
});
