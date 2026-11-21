import { readFile } from 'node:fs/promises';
import { expect, test, type Locator } from '@playwright/test';
import { PDFDocument } from 'pdf-lib';

async function pdfFile(name: string, widths: number[]) {
  const document = await PDFDocument.create();
  widths.forEach((width) => document.addPage([width, 180]));
  return {
    name,
    mimeType: 'application/pdf',
    buffer: Buffer.from(await document.save()),
  };
}

async function downloadPageWidths(link: Locator) {
  const [download] = await Promise.all([link.page().waitForEvent('download'), link.click()]);
  const path = await download.path();
  if (!path) {
    throw new Error('The downloaded PDF has no local path.');
  }
  const document = await PDFDocument.load(await readFile(path));
  return document.getPages().map((page) => page.getWidth());
}

test('batch compression downloads the correct PDF for similar and identical names', async ({
  page,
}) => {
  test.setTimeout(120_000);
  await page.goto('/pdf-tools/compress/compress-pdf');
  const input = page.getByLabel('انتخاب فایل PDF');
  await expect(input).toBeVisible();
  await page.waitForLoadState('load');
  await input.setInputFiles([
    await pdfFile('report-final.pdf', [155]),
    await pdfFile('report.pdf', [240, 260, 280]),
    await pdfFile('report.pdf', [320, 400]),
  ]);
  await page.getByRole('button', { name: 'فشرده سازی 3 فایل', exact: true }).click();

  const downloads = page.getByRole('link', { name: 'دانلود', exact: true });
  await expect(downloads).toHaveCount(3, { timeout: 30_000 });
  expect(await downloadPageWidths(downloads.nth(0))).toEqual([155]);
  expect(await downloadPageWidths(downloads.nth(1))).toEqual([240, 260, 280]);
  expect(await downloadPageWidths(downloads.nth(2))).toEqual([320, 400]);
  const downloadNames = await downloads.evaluateAll((links) =>
    links.map((link) => link.getAttribute('download')),
  );
  expect(new Set(downloadNames).size).toBe(3);

  await downloads.nth(1).locator('..').getByRole('button', { name: 'حذف' }).click();
  await expect(downloads).toHaveCount(2);
  expect(await downloadPageWidths(downloads.nth(1))).toEqual([320, 400]);

  await input.setInputFiles(await pdfFile('report.pdf', [240, 260, 280]));
  await page.getByRole('button', { name: 'فشرده سازی 3 فایل', exact: true }).click();
  await expect(downloads).toHaveCount(3, { timeout: 30_000 });
  expect(await downloadPageWidths(downloads.nth(0))).toEqual([155]);
  expect(await downloadPageWidths(downloads.nth(1))).toEqual([320, 400]);
  expect(await downloadPageWidths(downloads.nth(2))).toEqual([240, 260, 280]);
});
