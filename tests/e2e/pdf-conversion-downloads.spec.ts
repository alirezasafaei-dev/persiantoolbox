import { readFile } from 'node:fs/promises';
import { expect, test, type Locator } from '@playwright/test';
import JSZip from 'jszip';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import sharp from 'sharp';

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

test('canceling PDF rasterization restores keyboard focus and allows immediate retry', async ({
  page,
}) => {
  const source = await PDFDocument.create();
  source.addPage([160, 100]).drawRectangle({ x: 12, y: 12, width: 60, height: 40 });
  const fixture = {
    name: 'raster-cancel.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from(await source.save()),
  };
  await page.addInitScript(() => {
    const read = File.prototype.arrayBuffer;
    let paused = false;
    File.prototype.arrayBuffer = async function (this: File) {
      if (
        this.name === 'raster-cancel.pdf' &&
        document.documentElement.dataset['pauseRasterRead'] === 'true' &&
        !paused
      ) {
        paused = true;
        await new Promise<void>((resolve) => {
          window.addEventListener('release-raster-read', () => resolve(), { once: true });
          document.documentElement.dataset['rasterReadPending'] = 'true';
        });
        throw new Error('Late failure from canceled rasterization');
      }
      return read.call(this);
    };
  });
  await page.goto('/pdf-tools/convert/pdf-to-image');
  const consent = page.getByRole('dialog', { name: 'cookie consent' });
  await consent.getByRole('button', { name: 'رد همه کوکی‌ها', exact: true }).click();
  const input = page.getByLabel('انتخاب فایل PDF');
  await expect(async () => {
    await input.setInputFiles([]);
    await input.setInputFiles(fixture);
    await expect(page.getByText(fixture.name, { exact: false })).toBeVisible({ timeout: 1_000 });
  }).toPass({ timeout: 10_000 });
  await page.locator('#pdf-to-image-scale').selectOption('1');
  await page.evaluate(() => {
    document.documentElement.dataset['pauseRasterRead'] = 'true';
  });
  const convert = page.getByRole('button', { name: 'تبدیل به تصویر', exact: true });
  await convert.press('Enter');
  await expect(page.locator('html')).toHaveAttribute('data-raster-read-pending', 'true');
  await page.getByRole('button', { name: 'لغو پردازش', exact: true }).press('Enter');
  await expect(convert).toBeFocused();
  await convert.press('Enter');

  const link = page.locator('a[download="page-1.png"]');
  const pngBytes = await downloadBytes(link);
  const { format, width, height } = await sharp(pngBytes).metadata();
  expect({ format, width, height }).toEqual({ format: 'png', width: 160, height: 100 });
  const imageUrl = await link.getAttribute('href');
  await page.evaluate(async () => {
    window.dispatchEvent(new Event('release-raster-read'));
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  });
  await expect(page.getByText('Late failure from canceled rasterization')).toHaveCount(0);
  await expect(link).toHaveAttribute('href', imageUrl ?? '');
});

test('downloading the image ZIP preserves separate PDF page downloads', async ({ page }) => {
  const pdf = await PDFDocument.create();
  const privateTitle = 'SYNTHETIC-PRIVATE-RASTER-TITLE';
  pdf.setTitle(privateTitle);
  const font = await pdf.embedFont(StandardFonts.Symbol);
  pdf.addPage([180, 130]).drawText('Ω∑αβγ', { font, x: 20, y: 55, size: 24 });
  const fontResponses: string[] = [];
  page.on('response', (response) => {
    if (response.ok() && response.url().endsWith('/pdfjs/standard_fonts/FoxitSymbol.pfb')) {
      fontResponses.push(response.url());
    }
  });
  await page.goto('/pdf-tools/convert/pdf-to-image');
  const consent = page.getByRole('dialog', { name: 'cookie consent' });
  await consent.getByRole('button', { name: 'رد همه کوکی‌ها', exact: true }).click();
  await expect(consent).toBeHidden();
  const history: unknown[] = [];
  const outbound: string[] = [];
  await page.exposeFunction('captureRasterHistory', (payload: unknown) => {
    history.push(payload);
  });
  await page.evaluate(() => {
    document.cookie = 'pt_session=synthetic-history-fixture; Path=/; SameSite=Lax';
    const capture = (
      window as Window & { captureRasterHistory?: (payload: unknown) => Promise<void> }
    ).captureRasterHistory;
    if (!capture) throw new Error('Missing raster history capture');
    const fetch = window.fetch.bind(window);
    window.fetch = async (input, init) => {
      if (input === '/api/history' && init?.method === 'POST' && typeof init.body === 'string') {
        await capture(JSON.parse(init.body));
        return Response.json({});
      }
      return fetch(input, init);
    };
  });
  expect(await page.evaluate(() => document.cookie.includes('pt_session='))).toBe(true);
  page.on('request', (request) => {
    if (/^https?:/.test(request.url())) {
      outbound.push(`${request.url()}\n${request.postData() ?? ''}`);
    }
  });
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
  expect(fontResponses).toContain(
    new URL('/pdfjs/standard_fonts/FoxitSymbol.pfb', page.url()).href,
  );
  const pixels: Buffer = await sharp(first).removeAlpha().raw().toBuffer();
  expect(pixels.some((value) => value < 64)).toBe(true);
  await page.getByRole('button', { name: 'دانلود همه (ZIP)', exact: true }).click();
  const data = await downloadBytes(
    page.getByRole('link', { name: 'دانلود فایل ZIP', exact: true }),
  );
  const zip = await JSZip.loadAsync(data);
  const archived = await zip.file('page-1.png')?.async('nodebuffer');
  expect(archived?.equals(first)).toBe(true);
  expect((await downloadBytes(link)).equals(first)).toBe(true);
  const imageHistory = {
    tool: 'pdf-to-image',
    inputSummary: 'صفحه 1',
    outputSummary: 'دانلود تصویر صفحه 1',
  };
  await expect
    .poll(() => history)
    .toEqual([
      imageHistory,
      {
        tool: 'pdf-to-image',
        inputSummary: 'ZIP | تعداد صفحات: 1',
        outputSummary: 'دانلود فایل ZIP تصاویر',
      },
      imageHistory,
    ]);
  expect(outbound.some((item) => item.includes(fixture.name) || item.includes(privateTitle))).toBe(
    false,
  );
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

test('image to PDF rejects a small encoded PNG with too many pixels before preview', async ({
  page,
}) => {
  const largePng = await sharp({
    create: { width: 4000, height: 2200, channels: 3, background: '#ffffff' },
  })
    .png()
    .toBuffer();
  await page.goto('/pdf-tools/convert/image-to-pdf');
  const input = page.getByLabel('انتخاب تصویر');
  const previews = page.locator('img[src^="blob:"]');
  await expect(async () => {
    await input.setInputFiles({ name: 'small.png', mimeType: 'image/png', buffer: png });
    await expect(previews).toHaveCount(1, { timeout: 1_000 });
  }).toPass({ timeout: 10_000 });
  await input.setInputFiles({
    name: 'too-many-pixels.png',
    mimeType: 'image/png',
    buffer: largePng,
  });
  await expect(page.getByRole('main').getByRole('alert')).toContainText('too-many-pixels.png');
  await expect(previews).toHaveCount(1);

  const withinLimit = await sharp({
    create: { width: 3999, height: 2000, channels: 3, background: '#ffffff' },
  })
    .png()
    .toBuffer();
  await input.setInputFiles(
    Array.from({ length: 4 }, (_, index) => ({
      name: `within-limit-${index}.png`,
      mimeType: 'image/png',
      buffer: withinLimit,
    })),
  );
  await expect(page.getByRole('main').getByRole('alert')).toContainText('within-limit-3.png');
  await expect(previews).toHaveCount(4);
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

test('JPEG shares the pixel budget with PNG and accepted images still convert', async ({
  page,
}) => {
  const raster = (width: number, height: number) =>
    sharp({ create: { width, height, channels: 3, background: '#ffffff' } });
  const oversized = await raster(4000, 2200).jpeg().toBuffer();
  const small = await raster(4, 3).jpeg({ progressive: true }).toBuffer();
  const nearLimit = await raster(3999, 2000).png().toBuffer();
  const extra = await raster(4, 2000).jpeg().toBuffer();
  const jpeg = (name: string, buffer: Buffer) => ({ name, mimeType: 'image/jpeg', buffer });
  await page.goto('/pdf-tools/convert/image-to-pdf');
  const consent = page.getByRole('dialog', { name: 'cookie consent' });
  await consent.getByRole('button', { name: 'رد همه کوکی‌ها', exact: true }).click();
  const picker = page.getByLabel('انتخاب تصویر');
  await picker.setInputFiles([jpeg('oversized.jpg', oversized), jpeg('progressive.jpg', small)]);
  const previews = page.locator('img[src^="blob:"]');
  const error = page.getByRole('main').getByRole('alert');
  await expect(error).toContainText('oversized.jpg');
  await expect(previews).toHaveCount(1);
  const submit = page.getByRole('button', { name: 'تبدیل به PDF', exact: true });
  await submit.click();
  const result = await PDFDocument.load(
    await downloadBytes(page.locator('a[download="images.pdf"]')),
  );
  expect(result.getPages().map((pdfPage) => pdfPage.getSize())).toEqual([{ width: 4, height: 3 }]);
  await picker.setInputFiles([
    ...Array.from({ length: 3 }, (_, index) => ({
      name: `large-${index}.png`,
      mimeType: 'image/png',
      buffer: nearLimit,
    })),
    jpeg('over-batch.jpg', extra),
  ]);
  await expect(error).toContainText('over-batch.jpg');
  await expect(previews).toHaveCount(4);
});

test('a decoded WebP counts toward the batch pixel budget and removal allows a retry', async ({
  page,
}) => {
  const [, nearLimit, extra] = await Promise.all([
    page.goto('/pdf-tools/convert/image-to-pdf'),
    sharp({ create: { width: 3999, height: 2000, channels: 3, background: '#fff' } })
      .jpeg()
      .toBuffer(),
    sharp({ create: { width: 4, height: 1000, channels: 3, background: '#fff' } })
      .webp()
      .toBuffer(),
  ]);
  const consent = page.getByRole('dialog', { name: 'cookie consent' });
  await consent.getByRole('button', { name: 'رد همه کوکی‌ها', exact: true }).click();
  await expect(consent).toBeHidden();
  const picker = page.getByLabel('انتخاب تصویر');
  await picker.setInputFiles([
    ...Array.from({ length: 3 }, (_, index) => ({
      name: `page-${index}.jpg`,
      mimeType: 'image/jpeg',
      buffer: nearLimit,
    })),
    { name: 'within-budget.webp', mimeType: 'image/webp', buffer: extra },
    { name: 'extra.webp', mimeType: 'image/webp', buffer: extra },
  ]);
  await expect(page.locator('img[src^="blob:"]')).toHaveCount(5);
  const convert = page.getByRole('button', { name: 'تبدیل به PDF', exact: true });
  await convert.click();
  const link = page.locator('a[download="images.pdf"]');
  const alert = page.getByRole('main').getByRole('alert');
  await expect(alert).toContainText('extra.webp');
  await expect(link).toHaveCount(0);
  await page.getByRole('button', { name: 'حذف', exact: true }).last().click();
  await convert.click();
  const result = await PDFDocument.load(await downloadBytes(link));
  expect(result.getPages().map((pdfPage) => pdfPage.getSize())).toEqual([
    ...Array.from({ length: 3 }, () => ({ width: 3999, height: 2000 })),
    { width: 4, height: 1000 },
  ]);
});

test('image to PDF can cancel a pending file read and retry', async ({ page }) => {
  await page.addInitScript(() => {
    const read = File.prototype.arrayBuffer;
    let delayed = false;
    File.prototype.arrayBuffer = async function (this: File) {
      if (this.name === 'delayed.png' && !delayed) {
        delayed = true;
        document.documentElement.setAttribute('data-image-read-pending', 'true');
        await new Promise<void>((resolve) => {
          window.addEventListener('release-image-read', () => resolve(), { once: true });
        });
        throw new Error('Late failure from canceled file read');
      }
      return read.call(this);
    };
  });
  await page.goto('/pdf-tools/convert/image-to-pdf');
  const cookieDialog = page.getByRole('dialog', { name: 'cookie consent' });
  await cookieDialog.getByRole('button', { name: 'رد همه کوکی‌ها', exact: true }).click();
  await expect(cookieDialog).toBeHidden();
  await page.getByLabel('انتخاب تصویر').setInputFiles({
    name: 'delayed.png',
    mimeType: 'image/png',
    buffer: png,
  });
  const convert = page.getByRole('button', { name: 'تبدیل به PDF', exact: true });
  await convert.click();
  await expect(page.locator('html')).toHaveAttribute('data-image-read-pending', 'true');
  await page.getByRole('button', { name: 'لغو تبدیل', exact: true }).click();
  const link = page.locator('a[download="images.pdf"]');
  await expect(link).toHaveCount(0);
  await convert.click();
  const result = await PDFDocument.load(await downloadBytes(link));
  expect(result.getPageCount()).toBe(1);
  const href = await link.getAttribute('href');
  await page.evaluate(async () => {
    window.dispatchEvent(new Event('release-image-read'));
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  });
  expect(await link.getAttribute('href')).toBe(href);
  await expect(page.getByText('Late failure from canceled file read')).toHaveCount(0);
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
