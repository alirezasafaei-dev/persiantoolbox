import { readFile } from 'node:fs/promises';
import { expect, test, type Page } from '@playwright/test';
import {
  Document,
  Footer,
  Header,
  ImageRun,
  Packer,
  PageBreak,
  PageNumber,
  Paragraph,
  Table,
  TableCell,
  TableLayoutType,
  TableRow,
  TextRun,
} from 'docx';
import { getDocument, OPS } from 'pdfjs-dist/legacy/build/pdf.mjs';

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

test('Word preview preserves the mixed-script table, image, headers and numbered footers', async ({
  page,
}) => {
  await checkWordLayout(page, 42);
});

test('Word preview preserves a table that continues across pages', async ({ page }) => {
  await checkWordLayout(page, 84);
});

async function checkWordLayout(page: Page, rowCount: number) {
  test.skip(
    process.env['NEXT_PUBLIC_WORD_PDF_PREVIEW'] !== '1',
    'Requires the staged OpenDoc preview',
  );
  const values = Array.from({ length: rowCount }, (_, index) => (index + 1) * 125_000);
  const image = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAE0lEQVR4nGP4z8DwHwwZGP6DAQBJyAn3FGMynQAAAABJRU5ErkJggg==',
    'base64',
  );
  const doc = new Document({
    sections: [
      {
        headers: { default: new Header({ children: [new Paragraph('PT RUNNING HEADER')] }) },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                children: [
                  new TextRun('صفحه PT FOOTER '),
                  new TextRun({ children: [PageNumber.CURRENT] }),
                ],
              }),
            ],
          }),
        },
        children: [
          new Table({
            layout: TableLayoutType.AUTOFIT,
            rows: values.map(
              (value, index) =>
                new TableRow({
                  children: [
                    `ردیف ${index + 1}`,
                    `Mixed English ${index + 1} - متن فارسی`,
                    String(value),
                  ].map((text) => new TableCell({ children: [new Paragraph(text)] })),
                }),
            ),
          }),
          new Paragraph({ children: [new PageBreak()] }),
          new Paragraph('PT AFTER PAGE BREAK'),
          new Paragraph({
            children: [
              new ImageRun({ type: 'png', data: image, transformation: { width: 32, height: 32 } }),
            ],
          }),
        ],
      },
    ],
  });
  await page.goto('/pdf-tools/convert/word-to-pdf');
  await page.getByLabel('انتخاب فایل DOCX').setInputFiles({
    name: 'mixed-layout.docx',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    buffer: await Packer.toBuffer(doc),
  });
  await page.getByRole('button', { name: 'تبدیل به PDF', exact: true }).click();
  const link = page.getByRole('link', { name: 'دانلود PDF', exact: true });
  const [file] = await Promise.all([page.waitForEvent('download'), link.click()]);
  const task = getDocument({
    data: Uint8Array.from(await readFile(await file.path())),
    isEvalSupported: false,
  });
  try {
    const pdf = await task.promise;
    if (rowCount === 42) {
      expect(pdf.numPages).toBe(2);
    } else {
      expect(pdf.numPages).toBeGreaterThanOrEqual(3);
    }
    const observedRows: number[] = [];
    for (let number = 1; number <= pdf.numPages; number += 1) {
      const pdfPage = await pdf.getPage(number);
      const content = await pdfPage.getTextContent();
      const runs = content.items.flatMap((item) => ('str' in item ? [item.str] : []));
      const text = runs.join(' ').normalize('NFKC');
      expect(text).toContain('PT RUNNING HEADER');
      const footer = content.items.find((item) => 'str' in item && item.str === 'PT FOOTER');
      expect(footer).toBeDefined();
      if (!footer || !('str' in footer)) throw new Error('Missing text at the footer anchor');
      expect(footer.transform[4]).toBeGreaterThanOrEqual(pdfPage.view[0]);
      expect(footer.transform[4] + footer.width).toBeLessThanOrEqual(pdfPage.view[2]);
      const footerText = text.slice(text.lastIndexOf('PT FOOTER'));
      expect(footerText).toMatch(new RegExp(`^PT FOOTER\\s+صفحه\\s+${number}\\s*$`, 'u'));
      const rows = runs.filter((run) => /^\d{6,}$/.test(run)).map(Number);
      if (number < pdf.numPages) {
        expect(rows.length).toBeGreaterThan(0);
        expect(text).not.toContain('PT AFTER PAGE BREAK');
        observedRows.push(...rows);
      } else {
        expect(rows).toEqual([]);
        expect(text).toContain('PT AFTER PAGE BREAK');
        const operators = await pdfPage.getOperatorList();
        expect(
          operators.fnArray.some((operator) =>
            [OPS.paintImageXObject, OPS.paintInlineImageXObject].includes(operator),
          ),
        ).toBe(true);
      }
    }
    expect(observedRows).toEqual(values);
  } finally {
    await task.destroy();
  }
}
