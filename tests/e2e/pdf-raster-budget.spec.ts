import { expect, test } from '@playwright/test';
import { PDFDocument } from 'pdf-lib';

test('PDF to image rejects an oversized canvas and accepts a smaller page on retry', async ({
  page,
}) => {
  const source = await PDFDocument.create();
  source.addPage([8_200, 12]);
  source.addPage([200, 100]).drawRectangle({ x: 10, y: 10, width: 80, height: 50 });
  const fixture = {
    name: 'canvas-dimensions.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from(await source.save()),
  };

  await page.goto('/pdf-tools/convert/pdf-to-image');
  const input = page.getByLabel('انتخاب فایل PDF');
  await expect(async () => {
    await input.setInputFiles(fixture);
    await expect(page.getByText(fixture.name, { exact: false })).toBeVisible({ timeout: 1_000 });
  }).toPass({ timeout: 10_000 });
  await page.locator('#pdf-to-image-scale').selectOption('1');
  const pages = page.locator('#pdf-to-image-pages');
  const convert = page.getByRole('button', { name: 'تبدیل به تصویر' });
  await pages.fill('1');
  await convert.click();
  const alert = page.getByRole('main').getByRole('alert');
  await expect(alert).toContainText('ابعاد صفحه');
  await expect(page.locator('a[download="page-1.png"]')).toHaveCount(0);

  await pages.fill('2');
  await convert.click();
  await expect(page.locator('a[download="page-2.png"]')).toBeVisible();
  await expect(alert).toHaveCount(0);
});
