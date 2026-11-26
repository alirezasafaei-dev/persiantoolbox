import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import { degrees, PDFDocument, PDFName } from 'pdf-lib';
import { getDocument, OPS, Util } from 'pdfjs-dist/legacy/build/pdf.mjs';

test('page numbers align with the visible crop and rotation', async ({ page }) => {
  const source = await PDFDocument.create();
  source.setTitle('Page numbering fixture');
  const rotated = source.addPage([400, 300]);
  rotated.setCropBox(65, 55, 220, 150);
  rotated.setRotation(degrees(90));
  source.addPage([200, 250]);
  await page.goto('/pdf-tools/edit/add-page-numbers');
  const input = page.getByLabel('انتخاب فایل PDF');
  const fixture = {
    name: 'numbering.PDF',
    mimeType: 'application/pdf',
    buffer: Buffer.from(await source.save()),
  };
  await expect(async () => {
    if (await input.count()) {
      await input.setInputFiles(fixture);
    }
    await expect(page.getByText(fixture.name, { exact: true })).toBeVisible({ timeout: 1500 });
  }).toPass({ timeout: 10_000 });
  await page.getByRole('button', { name: 'افزودن شماره صفحه', exact: true }).click();
  const link = page.getByRole('link', { name: 'دانلود فایل شماره‌گذاری‌شده' });
  await expect(link).toBeVisible();
  const [download] = await Promise.all([page.waitForEvent('download'), link.click()]);
  const bytes = await readFile(await download.path());
  const document = await PDFDocument.load(bytes);
  expect(document.getTitle()).toBe('Page numbering fixture');
  expect(document.getPage(0).getRotation().angle).toBe(90);
  expect(document.getPage(0).getCropBox()).toEqual({ x: 65, y: 55, width: 220, height: 150 });
  const loading = getDocument({ data: Uint8Array.from(bytes), isEvalSupported: false });
  try {
    const pdf = await loading.promise;
    for (const number of [1, 2]) {
      const renderedPage = await pdf.getPage(number);
      const operators = await renderedPage.getOperatorList();
      const artifactStart = operators.fnArray.findIndex(
        (op, index) =>
          op === OPS.beginMarkedContentProps && operators.argsArray[index]?.[0] === 'Artifact',
      );
      const textStart = operators.fnArray.indexOf(OPS.beginText);
      const artifactEnd = operators.fnArray.indexOf(OPS.endMarkedContent, textStart);
      expect(artifactStart).toBeGreaterThanOrEqual(0);
      expect(textStart).toBeGreaterThan(artifactStart);
      expect(artifactEnd).toBeGreaterThan(operators.fnArray.indexOf(OPS.endText));
      const viewport = renderedPage.getViewport({ scale: 1 });
      const contents = await renderedPage.getTextContent();
      const label = contents.items.find((item) => 'str' in item && item.str === `${number} / 2`);
      if (!label || !('transform' in label)) {
        throw new Error('Page number was missing from the text layer');
      }
      const [a, b, , , x, y] = Util.transform(viewport.transform, label.transform);
      expect(a).toBeGreaterThan(0);
      expect(b).toBeCloseTo(0);
      expect(x + label.width / 2).toBeCloseTo(viewport.width / 2, 0);
      expect(y).toBeCloseTo(viewport.height - 30, 0);
    }
  } finally {
    await loading.destroy();
  }
  expect(download.suggestedFilename()).toBe('numbering_numbered.pdf');
});

test('page numbering refuses to rewrite a document with a signature field', async ({ page }) => {
  const source = await PDFDocument.create();
  const pdfPage = source.addPage();
  const field = source.getForm().createTextField('synthetic-signature-field');
  field.addToPage(pdfPage);
  field.acroField.dict.set(PDFName.of('FT'), PDFName.of('Sig'));
  const name = 'signature-field.pdf';
  const buffer = Buffer.from(await source.save({ updateFieldAppearances: false }));
  await page.goto('/pdf-tools/edit/add-page-numbers');
  const input = page.getByLabel('انتخاب فایل PDF');
  await expect(async () => {
    if (await input.count()) {
      await input.setInputFiles({ name, buffer, mimeType: 'application/pdf' });
    }
    await expect(page.getByText(name, { exact: true })).toBeVisible({ timeout: 1_500 });
  }).toPass({ timeout: 10_000 });
  await page.getByRole('button', { name: 'افزودن شماره صفحه', exact: true }).click();
  await expect(page.getByRole('main').getByRole('alert')).toContainText('امضای دیجیتال');
  await expect(page.getByRole('link', { name: 'دانلود فایل شماره‌گذاری‌شده' })).toHaveCount(0);
});
