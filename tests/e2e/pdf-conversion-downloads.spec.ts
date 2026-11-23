import { readFile } from 'node:fs/promises';
import { expect, test, type Locator } from '@playwright/test';
import JSZip from 'jszip';
import { PDFDocument } from 'pdf-lib';

const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAE0lEQVR4nGP4z8DwHwwZGP6DAQBJyAn3FGMynQAAAABJRU5ErkJggg==',
  'base64',
);

async function downloadBytes(link: Locator) {
  await expect(link).toBeVisible();
  await link.evaluate((element) =>
    element.scrollIntoView({ block: 'center', behavior: 'instant' }),
  );
  const [download] = await Promise.all([
    link.page().waitForEvent('download', { timeout: 12_000 }),
    link.click(),
  ]);
  const path = await download.path();
  if (!path) throw new Error('No local download path');
  return readFile(path);
}

for (const colorScheme of ['light', 'dark'] as const) {
  test(`the PDF drop zone shows keyboard focus in ${colorScheme} mode`, async ({ page }) => {
    await page.emulateMedia({ colorScheme });
    await page.goto('/pdf-tools/convert/pdf-to-image');
    const consent = page.getByRole('dialog', { name: 'cookie consent' });
    await consent.getByRole('button', { name: 'رد همه کوکی‌ها', exact: true }).click();
    await expect(consent).toBeHidden();
    const input = page.locator('main input[type="file"]');
    for (let tab = 0; tab < 70; tab += 1) {
      await page.keyboard.press('Tab');
      if (await input.evaluate((element) => element === document.activeElement)) break;
    }
    await expect(input).toBeFocused();
    const dropZone = input.locator('..');
    await expect(dropZone).toHaveCSS('outline-style', 'solid');
    await expect(dropZone).toHaveCSS('outline-width', '2px');
  });
}

test('downloading the image ZIP preserves separate PDF page downloads', async ({ page }) => {
  const pdf = await PDFDocument.create();
  pdf.addPage([180, 130]).drawText('PNG fixture');
  await page.goto('/pdf-tools/convert/pdf-to-image');
  const consent = page.getByRole('dialog', { name: 'cookie consent' });
  await consent.getByRole('button', { name: 'رد همه کوکی‌ها', exact: true }).click();
  await expect(consent).toBeHidden();
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

test('image to PDF rejects oversized and empty selections without clearing valid images', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const originalSize = Object.getOwnPropertyDescriptor(Blob.prototype, 'size')?.get;
    if (!originalSize) throw new Error('Blob size getter is unavailable');
    Object.defineProperty(Blob.prototype, 'size', {
      configurable: true,
      get() {
        if (this instanceof File && /^(batch|large)-/.test(this.name)) {
          return (this.name.startsWith('large-') ? 21 : 20) * 1024 * 1024;
        }
        return originalSize.call(this);
      },
    });
  });
  await page.goto('/pdf-tools/convert/image-to-pdf');
  const input = page.getByLabel('انتخاب تصویر');
  const previews = page.locator('img[src^="blob:"]');
  const image = (name: string, buffer = png) => ({ name, mimeType: 'image/png', buffer });
  await expect(async () => {
    await input.setInputFiles([image('batch-first.png'), image('batch-second.png')]);
    await expect(previews).toHaveCount(2, { timeout: 1_000 });
  }).toPass({ timeout: 10_000 });
  await input.setInputFiles([
    image('empty.png', Buffer.alloc(0)),
    image('large-extra.png'),
    image('batch-overflow.png'),
    image('valid.png'),
  ]);
  const error = page.getByRole('main').getByRole('alert');
  await expect(error).toContainText('empty.png');
  await expect(error).toContainText('large-extra.png');
  await expect(error).toContainText('batch-overflow.png');
  await expect(previews).toHaveCount(3);
  await input.setInputFiles(Array.from({ length: 18 }, (_, i) => image(`small-${i}.png`)));
  await expect(error).toBeVisible();
  await expect(previews).toHaveCount(20);
  await expect(page.getByText('small-17.png', { exact: true })).toHaveCount(0);
});

test('building a PDF does not revoke the selected image previews', async ({ page }) => {
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

test('a browser-decoded GIF converts to a PDF page', async ({ page }) => {
  await page.goto('/pdf-tools/convert/image-to-pdf');
  const consent = page.getByRole('dialog', { name: 'cookie consent' });
  await consent.getByRole('button', { name: 'رد همه کوکی‌ها', exact: true }).click();
  const input = page.getByLabel('انتخاب تصویر');
  await input.setInputFiles({
    name: 'single-pixel.gif',
    mimeType: 'image/gif',
    buffer: Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64'),
  });
  await page.getByRole('button', { name: 'تبدیل به PDF', exact: true }).click();
  const pdf = await PDFDocument.load(await downloadBytes(page.locator('a[download="images.pdf"]')));
  expect(pdf.getPages().map((pdfPage) => pdfPage.getSize())).toEqual([{ width: 1, height: 1 }]);
});

test('image to PDF fits a 320px RTL viewport before and after choosing an image', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/pdf-tools/convert/image-to-pdf');
  const viewportLayout = () =>
    page.evaluate(() => ({
      width: window.innerWidth,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    }));
  await expect.poll(viewportLayout).toEqual({ width: 320, overflow: false });

  const input = page.getByLabel('انتخاب تصویر');
  const name = `${'long-filename-'.repeat(12)}.png`;
  await expect(async () => {
    await input.setInputFiles({ name, mimeType: 'image/png', buffer: png });
    await expect(page.getByText(name, { exact: true })).toBeVisible({ timeout: 1_000 });
  }).toPass({ timeout: 10_000 });
  await expect.poll(viewportLayout).toEqual({ width: 320, overflow: false });
});
