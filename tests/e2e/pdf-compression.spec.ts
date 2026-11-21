import { readFile } from 'node:fs/promises';
import { expect, test, type Locator } from '@playwright/test';
import { degrees, PDFArray, PDFDict, PDFDocument, PDFName } from 'pdf-lib';

async function pdfFile(name: string, widths: number[]) {
  const document = await PDFDocument.create();
  widths.forEach((width) => document.addPage([width, 180]));
  return {
    name,
    mimeType: 'application/pdf',
    buffer: Buffer.from(await document.save()),
  };
}

async function readDownload(link: Locator) {
  const [download] = await Promise.all([link.page().waitForEvent('download'), link.click()]);
  const path = await download.path();
  if (!path) {
    throw new Error('The downloaded PDF has no local path.');
  }
  return readFile(path);
}

async function downloadPageWidths(link: Locator) {
  const document = await PDFDocument.load(await readDownload(link));
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

test('compression preserves form values, document metadata and page geometry', async ({ page }) => {
  test.setTimeout(120_000);
  const original = await PDFDocument.create();
  original.setTitle('Archive fixture');
  const sourcePage = original.addPage([281, 173]);
  sourcePage.setRotation(degrees(270));
  const field = original.getForm().createTextField('caseReference');
  field.addToPage(sourcePage, { x: 10, y: 40, width: 90, height: 20 });
  field.setText('Synthetic record 42');
  await original.attach(new Uint8Array([1, 3, 7]), 'fixture.bin', {
    mimeType: 'application/octet-stream',
  });
  sourcePage.drawText('Searchable fixture', { x: 10, y: 100 });

  await page.goto('/pdf-tools/compress/compress-pdf');
  await page.waitForLoadState('load');
  const input = page.getByLabel('انتخاب فایل PDF');
  const fixture = {
    name: 'archive.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from(await original.save({ useObjectStreams: false })),
  };
  await expect(async () => {
    await input.setInputFiles([]);
    await input.setInputFiles(fixture);
    await expect(page.getByText('archive.pdf', { exact: false })).toBeVisible({ timeout: 1_000 });
  }).toPass({ timeout: 10_000 });
  await page.getByRole('button', { name: 'فشرده سازی PDF', exact: true }).click();

  const link = page.getByRole('link', { name: 'دانلود', exact: true });
  await expect(link).toBeVisible({ timeout: 30_000 });
  const bytes = await readDownload(link);
  expect(bytes.byteLength).toBeLessThan(fixture.buffer.byteLength);
  const output = await PDFDocument.load(bytes);
  expect(output.getForm().getTextField('caseReference').getText()).toBe('Synthetic record 42');
  expect(output.getTitle()).toBe('Archive fixture');
  expect(output.getPageCount()).toBe(1);
  expect(output.getPage(0).getSize()).toEqual({ width: 281, height: 173 });
  expect(output.getPage(0).getRotation().angle).toBe(270);
  const names = output.catalog.lookup(PDFName.of('Names'), PDFDict);
  const attachments = names.lookup(PDFName.of('EmbeddedFiles'), PDFDict);
  expect(attachments.lookup(PDFName.of('Names'), PDFArray).size()).toBe(2);
});

test('compression keeps the original bytes when rewriting does not shrink the PDF', async ({
  page,
}) => {
  const fixture = await pdfFile('already-compact.pdf', [200]);
  await page.goto('/pdf-tools/compress/compress-pdf');
  const input = page.getByLabel('انتخاب فایل PDF');
  await expect(async () => {
    await input.setInputFiles([]);
    await input.setInputFiles(fixture);
    await expect(page.getByText(fixture.name, { exact: false })).toBeVisible({ timeout: 1_000 });
  }).toPass({ timeout: 10_000 });
  await page.getByRole('button', { name: 'فشرده سازی PDF', exact: true }).click();
  const output = await readDownload(page.getByRole('link', { name: 'دانلود', exact: true }));
  expect(output.equals(fixture.buffer)).toBe(true);
});
