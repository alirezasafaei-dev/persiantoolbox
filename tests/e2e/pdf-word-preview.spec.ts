import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import { Document, Packer, PageBreak, Paragraph } from 'docx';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

test('Word preview recovers from invalid input and cancellation and downloads a local PDF', async ({
  page,
}) => {
  test.skip(
    process.env['NEXT_PUBLIC_WORD_PDF_PREVIEW'] !== '1',
    'Requires the staged OpenDoc preview',
  );
  const route = '/pdf-tools/convert/word-to-pdf';
  await page.goto(route);
  const input = page.getByLabel('انتخاب فایل DOCX');
  const convert = page.getByRole('button', { name: 'تبدیل به PDF', exact: true });
  const download = page.getByRole('link', { name: 'دانلود PDF', exact: true });
  await input.setInputFiles({
    name: 'invalid.docx',
    mimeType: 'application/octet-stream',
    buffer: Buffer.from('Not a DOCX package'),
  });
  await convert.click();
  await expect(
    page.getByRole('alert').filter({ hasText: 'تبدیل این سند انجام نشد' }),
  ).toBeVisible();
  await expect(download).toHaveCount(0);

  const origin = new URL(page.url()).origin;
  const requests: string[] = [];
  page.context().on('request', (request) => {
    if (new URL(request.url()).origin !== origin || request.method() !== 'GET') {
      requests.push(request.method());
    }
  });
  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph('سند فارسی Persian Toolbox'),
          new Paragraph({ children: [new PageBreak()] }),
          new Paragraph('Second page marker'),
        ],
      },
    ],
  });
  await input.setInputFiles({
    name: 'preview.docx',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    buffer: await Packer.toBuffer(doc),
  });
  await page.evaluate(() => {
    const read = File.prototype.arrayBuffer;
    File.prototype.arrayBuffer = function () {
      if (this.name !== 'preview.docx') {
        return read.call(this);
      }
      File.prototype.arrayBuffer = read;
      return new Promise<ArrayBuffer>((resolve, reject) => {
        document.addEventListener(
          'release-preview-read',
          () => void read.call(this).then(resolve, reject),
          { once: true },
        );
        document.documentElement.dataset['previewReadPending'] = 'true';
      });
    };
  });
  await convert.click();
  await expect(page.locator('html')).toHaveAttribute('data-preview-read-pending', 'true');
  await page.getByRole('button', { name: 'لغو تبدیل', exact: true }).press('Enter');
  await expect(convert).toBeEnabled();
  await expect(convert).toBeFocused();
  await expect(download).toHaveCount(0);
  await page.evaluate(() => document.dispatchEvent(new Event('release-preview-read')));

  await page.keyboard.press('Enter');
  await expect(download).toBeVisible();
  const [file] = await Promise.all([page.waitForEvent('download'), download.click()]);
  expect(file.suggestedFilename()).toBe('preview.pdf');
  const task = getDocument({
    data: Uint8Array.from(await readFile(await file.path())),
    isEvalSupported: false,
  });
  try {
    const pdf = await task.promise;
    expect(pdf.numPages).toBe(2);
    const text = async (number: number) =>
      (await (await pdf.getPage(number)).getTextContent()).items
        .map((item) => ('str' in item ? item.str : ''))
        .join(' ')
        .normalize('NFKC');
    expect(await text(1)).toContain('Persian Toolbox');
    expect(await text(1)).toMatch(/[\u0600-\u06ff]/u);
    expect(await text(2)).toContain('Second page marker');
  } finally {
    await task.destroy();
  }
  expect(requests).toEqual([]);
  const worker = await page.request.get('/word-pdf/v1/worker.mjs');
  const response = await page.request.get(route);
  expect(worker.headers()['content-security-policy']).toContain("'wasm-unsafe-eval'");
  expect(response.headers()['content-security-policy']).not.toContain("'wasm-unsafe-eval'");
});
