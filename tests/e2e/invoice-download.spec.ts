import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { PDFDocument } from 'pdf-lib';

test('downloads a mixed Persian/Latin invoice using both real release fonts', async ({
  page,
}, testInfo) => {
  await page.goto('/tools/invoice-generator');
  await page.getByRole('textbox', { name: 'نام مشتری', exact: true }).fill('شرکت آزمایشی ASDEV');
  await page
    .getByRole('textbox', { name: 'شرح', exact: true })
    .fill('طراحی سایت (React 19) و پشتیبانی');
  await page.getByLabel('تعداد', { exact: true }).fill('1.5');
  await page.getByLabel('قیمت واحد', { exact: true }).fill('100000');
  await page.getByLabel('نرخ مالیات', { exact: true }).fill('10');
  await page.getByLabel('تخفیف', { exact: true }).fill('5000');

  const fonts = ['Regular', 'Bold'].map((weight) =>
    page.waitForResponse(
      (response) => new URL(response.url()).pathname === `/fonts/Vazirmatn-${weight}.ttf`,
    ),
  );
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'دانلود فاکتور PDF', exact: true }).click();
  const download = await downloadPromise;
  expect(await download.failure()).toBeNull();
  expect(download.suggestedFilename()).toMatch(/^invoice-INV-\d+\.pdf$/);
  const filename = testInfo.outputPath('invoice-mixed-script.pdf');
  await download.saveAs(filename);
  const bytes = readFileSync(filename);
  expect(bytes.subarray(0, 5).toString()).toBe('%PDF-');
  expect(bytes.length).toBeGreaterThan(10000);
  expect((await PDFDocument.load(bytes)).getPageCount()).toBeGreaterThan(0);
  const { getDocument } = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const reader = await getDocument({ data: Uint8Array.from(bytes), useSystemFonts: false }).promise;
  try {
    const content = await (await reader.getPage(1)).getTextContent();
    const text = content.items.flatMap((item) => ('str' in item ? [item.str] : [])).join(' ');
    expect(text).toContain('React 19');
    expect(text).toContain('INV-0001');
    expect(text).toContain('۱۶۰٬۰۰۰');
  } finally {
    await reader.destroy();
  }

  for (const response of await Promise.all(fonts)) {
    expect(response.status()).toBe(200);
    const fontName = new URL(response.url()).pathname.split('/').at(-1);
    const digest = (data: Uint8Array) => createHash('sha256').update(data).digest('hex');
    expect(digest(await response.body())).toBe(digest(readFileSync(`public/fonts/${fontName}`)));
  }
  await expect(
    page.getByText('ساخت فایل PDF انجام نشد. دوباره تلاش کنید.', { exact: true }),
  ).toHaveCount(0);
});
