import { readFile } from 'node:fs/promises';
import { expect, test, type Page } from '@playwright/test';
import fontkit from '@pdf-lib/fontkit';
import JSZip from 'jszip';
import { PDFDocument } from 'pdf-lib';

test.use({ serviceWorkers: 'block' });

async function selectPdf(page: Page, document: PDFDocument | Uint8Array) {
  const input = page.getByLabel('انتخاب فایل PDF');
  const fixture = {
    name: 'conversion-fixture.PDF',
    mimeType: 'application/pdf',
    buffer: Buffer.from(document instanceof Uint8Array ? document : await document.save()),
  };

  await page.goto('/pdf-tools/convert/pdf-to-word');
  await expect(async () => {
    if (await input.count()) {
      await input.setInputFiles([]);
      await input.setInputFiles(fixture);
    }
    await expect(page.getByText(fixture.name, { exact: true })).toBeVisible({ timeout: 1_000 });
  }).toPass({ timeout: 10_000 });

  return page.getByRole('button', { name: 'تبدیل به Word', exact: true });
}

test('PDF to Word writes editable Persian and Latin lines in source order', async ({ page }) => {
  const source = await PDFDocument.create();
  source.registerFontkit(fontkit);
  const font = await source.embedFont(await readFile('public/fonts/Vazirmatn-Regular.ttf'), {
    subset: true,
  });
  const sourcePage = source.addPage([400, 300]);
  sourcePage.drawText('گزارش نمونه', { x: 180, y: 250, size: 16, font });
  sourcePage.drawText('English test 42', { x: 20, y: 200, size: 16, font });

  sourcePage.drawText('اللغة', { x: 180, y: 150, size: 16, font });

  const convert = await selectPdf(page, source);
  await convert.click();
  const link = page.getByRole('link', { name: 'دانلود فایل Word' });
  await expect(link).toBeVisible({ timeout: 30_000 });
  const [download] = await Promise.all([page.waitForEvent('download'), link.click()]);
  expect(download.suggestedFilename()).toBe('conversion-fixture.docx');
  const archive = await JSZip.loadAsync(await readFile(await download.path()));
  const xml = await archive.file('word/document.xml')?.async('string');
  expect(xml).toContain('اللغة');
  expect(xml).toMatch(
    /<w:bidi[\s/>][\s\S]*?<w:t[^>]*>گزارش نمونه<\/w:t>[\s\S]*?<w:t[^>]*>English test 42<\/w:t>/,
  );
});

test('PDF to Word reports no selectable text for a multi-page document without a text layer', async ({
  page,
}) => {
  const source = await PDFDocument.create();
  source.addPage([200, 200]).drawRectangle({ x: 30, y: 30, width: 80, height: 80 });
  source.addPage([200, 200]);
  const convert = await selectPdf(page, source);
  const downloads: string[] = [];
  page.on('download', (file) => downloads.push(file.suggestedFilename()));
  await convert.click();
  await expect(page.getByRole('alert').filter({ hasText: 'متن قابل انتخاب' })).toBeVisible();
  expect(downloads).toEqual([]);
  await expect(page.getByRole('button', { name: 'فایل جدید' })).toBeEnabled();
});

test('PDF to Word preserves mixed Latin and predefined Japanese text in DOCX', async ({ page }) => {
  const source = await readFile('tests/e2e/fixtures/predefined-japanese-cmap.pdf');
  await (await selectPdf(page, source)).click();
  const link = page.locator('a[download="conversion-fixture.docx"]');
  await expect(link).toBeVisible();
  await link.evaluate((element) =>
    element.scrollIntoView({ block: 'center', behavior: 'instant' }),
  );
  const [download] = await Promise.all([page.waitForEvent('download'), link.click()]);
  const archive = await JSZip.loadAsync(await readFile(await download.path()), {
    checkCRC32: true,
  });
  const xml = await archive.file('word/document.xml')?.async('string');
  expect(xml).toMatch(/Latin reference[\s\S]*日本語のテスト/);
});

test('canceling PDF to Word discards a late worker load', async ({ page }) => {
  const source = await PDFDocument.create();
  source.addPage().drawText('Must never download');
  const convert = await selectPdf(page, source);
  let workerRequested = false;
  let releaseWorker = () => {};
  const workerGate = new Promise<void>((resolve) => {
    releaseWorker = resolve;
  });
  await page.route('**/pdf.worker.min.mjs', async (route) => {
    workerRequested = true;
    await workerGate;
    await route.continue().catch(() => {});
  });
  const downloads: string[] = [];
  page.on('download', (file) => downloads.push(file.suggestedFilename()));

  try {
    await convert.click();
    await expect.poll(() => workerRequested).toBe(true);
    await page.getByRole('button', { name: 'لغو پردازش' }).click();
    await expect(page.getByLabel('انتخاب فایل PDF')).toBeVisible();
  } finally {
    releaseWorker();
    await page.unrouteAll({ behavior: 'wait' });
  }
  await expect(page.getByRole('main').getByRole('alert')).toHaveCount(0);
  expect(downloads).toEqual([]);
});
