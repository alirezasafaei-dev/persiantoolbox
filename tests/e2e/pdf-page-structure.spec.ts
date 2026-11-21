import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import { degrees, PDFArray, PDFDict, PDFDocument, PDFName } from 'pdf-lib';

test('reordering real pages keeps the same document form, metadata and attachment', async ({
  page,
}) => {
  const document = await PDFDocument.create();
  document.setTitle('Synthetic reorder fixture');
  const first = document.addPage([200, 170]);
  const second = document.addPage([280, 230]);
  second.setRotation(degrees(90));
  const field = document.getForm().createTextField('reference');
  field.addToPage(first, { x: 20, y: 30, width: 100, height: 20 });
  field.setText('Example 42');
  await document.attach(new Uint8Array([1, 3, 7]), 'fixture.bin');

  await page.goto('/pdf-tools/edit/reorder-pages');
  const input = page.getByLabel('انتخاب فایل PDF');
  const fixture = {
    name: 'reorder-fixture.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from(await document.save()),
  };
  await expect(async () => {
    await input.setInputFiles([]);
    await input.setInputFiles(fixture);
    await expect(page.getByText(fixture.name, { exact: false })).toBeVisible({ timeout: 1_000 });
  }).toPass({ timeout: 10_000 });
  await page.getByLabel('ترتیب جدید صفحات').fill('2,1');
  await page.getByRole('button', { name: 'جابجایی صفحات', exact: true }).click();

  const link = page.getByRole('link', { name: 'دانلود فایل', exact: true });
  const [download] = await Promise.all([page.waitForEvent('download'), link.click()]);
  const path = await download.path();
  if (!path) {
    throw new Error('The downloaded PDF has no local path.');
  }
  const output = await PDFDocument.load(await readFile(path));
  expect(output.getPages().map((item) => item.getWidth())).toEqual([280, 200]);
  expect(output.getPage(0).getRotation().angle).toBe(90);
  expect(output.getForm().getTextField('reference').getText()).toBe('Example 42');
  expect(output.getTitle()).toBe('Synthetic reorder fixture');
  const names = output.catalog.lookup(PDFName.of('Names'), PDFDict);
  const attachments = names.lookup(PDFName.of('EmbeddedFiles'), PDFDict);
  expect(attachments.lookup(PDFName.of('Names'), PDFArray).size()).toBe(2);
});
