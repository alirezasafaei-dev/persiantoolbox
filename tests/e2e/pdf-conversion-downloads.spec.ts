import { readFile } from 'node:fs/promises';
import { expect, test, type Locator } from '@playwright/test';
import JSZip from 'jszip';
import { PDFDocument } from 'pdf-lib';

async function downloadBytes(link: Locator) {
  const [download] = await Promise.all([
    link.page().waitForEvent('download', { timeout: 12_000 }),
    link.click(),
  ]);
  const path = await download.path();
  if (!path) throw new Error('No local download path');
  return readFile(path);
}

test('downloading the image ZIP preserves separate PDF page downloads', async ({ page }) => {
  const pdf = await PDFDocument.create();
  pdf.addPage([180, 130]).drawText('PNG fixture');
  await page.goto('/pdf-tools/convert/pdf-to-image');
  const input = page.getByLabel('انتخاب فایل PDF');
  const fixture = {
    name: 'conversion-fixture.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from(await pdf.save()),
  };
  await expect(async () => {
    await input.setInputFiles([]);
    await input.setInputFiles(fixture);
    await expect(page.getByText(fixture.name, { exact: false })).toBeVisible({ timeout: 1_000 });
  }).toPass({ timeout: 10_000 });
  await page.getByRole('button', { name: 'تبدیل به تصویر', exact: true }).click();
  const link = page.locator('a[download="page-1.png"]');
  const first = await downloadBytes(link);
  expect(first.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
  await page.getByRole('button', { name: 'دانلود همه (ZIP)', exact: true }).click();
  const data = await downloadBytes(
    page.getByRole('link', { name: 'دانلود فایل ZIP', exact: true }),
  );
  const zip = await JSZip.loadAsync(data);
  const archived = await zip.file('page-1.png')?.async('nodebuffer');
  expect(archived?.equals(first)).toBe(true);
  expect((await downloadBytes(link)).equals(first)).toBe(true);
});

test('building a PDF does not revoke the selected image previews', async ({ page }) => {
  const png = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==',
    'base64',
  );
  await page.goto('/pdf-tools/convert/image-to-pdf');
  const input = page.getByLabel('انتخاب تصویر');
  const images = page.locator('img[src^="blob:"]');
  await expect(async () => {
    await input.setInputFiles([]);
    await input.setInputFiles(
      ['first.png', 'second.png'].map((name) => ({ name, mimeType: 'image/png', buffer: png })),
    );
    await expect(images).toHaveCount(2, { timeout: 1_000 });
  }).toPass({ timeout: 10_000 });
  const canLoad = () =>
    images.evaluateAll((items) =>
      Promise.all(
        items.map((item) => {
          return new Promise<boolean>((resolve) => {
            const image = new Image();
            image.onload = () => resolve(true);
            image.onerror = () => resolve(false);
            image.src = (item as HTMLImageElement).src;
          });
        }),
      ),
    );
  expect(await canLoad()).toEqual([true, true]);
  await page.getByRole('button', { name: 'تبدیل به PDF', exact: true }).click();
  const pdf = await PDFDocument.load(await downloadBytes(page.locator('a[download="images.pdf"]')));
  expect(pdf.getPageCount()).toBe(2);
  expect(await canLoad()).toEqual([true, true]);
});
