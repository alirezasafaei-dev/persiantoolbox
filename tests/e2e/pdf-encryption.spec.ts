import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { expect, test } from '@playwright/test';
import { PDFDict, PDFDocument, PDFName, PDFNumber } from 'pdf-lib';
import { getDocument, PasswordResponses } from 'pdfjs-dist/legacy/build/pdf.mjs';

test('encryption can retry before a canceled file read settles', async ({ page }) => {
  const source = await PDFDocument.create();
  const firstPage = source.addPage([271, 184]);
  firstPage.drawText('Encryption cancellation fixture', { x: 20, y: 120, size: 12 });
  const password = 'synthetic-reader-password';
  await page.addInitScript(() => {
    const read = File.prototype.arrayBuffer;
    let reads = 0;
    File.prototype.arrayBuffer = async function (this: File) {
      if (this.name === 'encrypt-cancel.pdf' && ++reads === 2) {
        await new Promise<void>((resolve) => {
          window.addEventListener('release-encrypt-read', () => resolve(), { once: true });
          document.documentElement.dataset['encryptReadPending'] = 'true';
        });
        throw new Error('Late failure from canceled encryption');
      }
      return read.call(this);
    };
  });
  await page.goto('/pdf-tools/security/encrypt-pdf');
  await page
    .getByRole('dialog', { name: 'cookie consent' })
    .getByRole('button', { name: 'رد همه کوکی‌ها', exact: true })
    .click();
  await page.getByLabel('انتخاب فایل PDF').setInputFiles({
    name: 'encrypt-cancel.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from(await source.save()),
  });
  await page.getByRole('main').locator('input[type="password"]').first().fill(password);
  const submit = page.getByRole('button', { name: 'پردازش و دانلود', exact: true });
  await submit.click();
  await expect(page.locator('html')).toHaveAttribute('data-encrypt-read-pending', 'true');
  await page.getByRole('button', { name: 'لغو پردازش', exact: true }).click({ timeout: 5_000 });
  await expect(submit).toBeEnabled();

  const downloads: string[] = [];
  page.on('download', (file) => downloads.push(file.suggestedFilename()));
  const [download] = await Promise.all([page.waitForEvent('download'), submit.click()]);
  const path = await download.path();
  if (!path) throw new Error('Missing encrypted download');
  const loadingTask = getDocument({
    data: new Uint8Array(await readFile(path)),
    password,
    isEvalSupported: false,
    standardFontDataUrl: `${resolve('node_modules/pdfjs-dist/standard_fonts').replaceAll('\\', '/')}/`,
  });
  try {
    const output = await loadingTask.promise;
    expect(output.numPages).toBe(1);
    const outputPage = await output.getPage(1);
    expect(outputPage.view).toEqual([0, 0, 271, 184]);
    const content = await outputPage.getTextContent();
    expect(
      content.items.some((item) => 'str' in item && item.str === 'Encryption cancellation fixture'),
    ).toBe(true);
  } finally {
    await loadingTask.destroy();
  }
  await page.evaluate(async () => {
    window.dispatchEvent(new Event('release-encrypt-read'));
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  });
  await expect(page.getByText('Late failure from canceled encryption')).toHaveCount(0);
  expect(downloads).toEqual(['encrypt-cancel_protected.pdf']);
});

test('encryption refuses a PDF with a digital signature marker', async ({ page }) => {
  const pdf = await PDFDocument.create();
  pdf.addPage().node.set(PDFName.of('Fixture'), pdf.context.obj({ ByteRange: [0, 10, 20, 30] }));
  await page.goto('/pdf-tools/security/encrypt-pdf', { waitUntil: 'domcontentloaded' });
  const consent = page.getByRole('dialog', { name: 'cookie consent' });
  await consent.getByRole('button', { name: 'رد همه کوکی‌ها', exact: true }).click();
  await page.getByLabel('انتخاب فایل PDF').setInputFiles({
    name: 'signature-marker.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from(await pdf.save()),
  });
  const downloads: string[] = [];
  page.on('download', (file) => downloads.push(file.suggestedFilename()));
  await page.getByRole('main').locator('input[type="password"]').first().fill('fixture-user-42');
  await page.getByRole('button', { name: 'پردازش و دانلود', exact: true }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'امضای دیجیتال' })).toBeVisible();
  expect(downloads).toEqual([]);
});

test('encryption recovers from a malformed PDF and produces readable AES-256', async ({ page }) => {
  const original = await PDFDocument.create();
  original.setTitle('Encryption fixture');
  const one = original.addPage([220, 160]);
  one.drawText('Synthetic encryption text', { x: 20, y: 120, size: 12 });
  const fixture = {
    name: 'encryption-fixture.PDF',
    mimeType: 'application/pdf',
    buffer: Buffer.from(await original.save()),
  };
  await page.goto('/pdf-tools/security/encrypt-pdf');
  const consent = page.getByRole('dialog', { name: 'cookie consent' });
  await consent.getByRole('button', { name: 'رد همه کوکی‌ها', exact: true }).click();
  await expect(consent).toBeHidden();
  const input = page.getByLabel('انتخاب فایل PDF');
  await input.setInputFiles({
    name: 'malformed.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF-1.7\n1 0 obj\n<< /Type /Catalog >>\nendobj\n%%EOF'),
  });
  const error = page.getByRole('main').locator('[role="alert"].text-danger');
  await expect(error).toBeVisible({ timeout: 10_000 });
  await page.getByRole('button', { name: 'انتخاب فایل دیگر', exact: true }).click();
  await expect(async () => {
    if (!(await input.count())) {
      await expect(page.getByText(fixture.name, { exact: true })).toBeVisible({ timeout: 1_000 });
      return;
    }
    await input.setInputFiles([]);
    await input.setInputFiles(fixture);
    await expect(page.getByText(fixture.name, { exact: true })).toBeVisible({ timeout: 1_000 });
  }).toPass({ timeout: 10_000 });

  await page.getByPlaceholder('رمز عبور را وارد کنید').fill('fixture-user-42');
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'پردازش و دانلود' }).click(),
  ]);
  const path = await download.path();
  if (!path) {
    throw new Error('The downloaded PDF has no local path.');
  }
  const bytes = await readFile(path);
  const encrypted = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const dictionary = encrypted.context.lookup(encrypted.context.trailerInfo.Encrypt, PDFDict);
  expect(dictionary.lookup(PDFName.of('V'), PDFNumber).asNumber()).toBe(5);
  expect(dictionary.lookup(PDFName.of('R'), PDFNumber).asNumber()).toBe(6);
  expect(download.suggestedFilename()).toBe('encryption-fixture_protected.pdf');

  const wrong = getDocument({
    data: Uint8Array.from(bytes),
    password: 'fixture-wrong',
    isEvalSupported: false,
  });
  try {
    await expect(wrong.promise).rejects.toMatchObject({
      name: 'PasswordException',
      code: PasswordResponses.INCORRECT_PASSWORD,
    });
  } finally {
    await wrong.destroy();
  }

  const valid = getDocument({
    data: Uint8Array.from(bytes),
    password: 'fixture-user-42',
    isEvalSupported: false,
    standardFontDataUrl: `${resolve('node_modules/pdfjs-dist/standard_fonts').replaceAll('\\', '/')}/`,
  });
  try {
    const opened = await valid.promise;
    expect(opened.numPages).toBe(1);
    const contents = await (await opened.getPage(1)).getTextContent();
    expect(
      contents.items.some((item) => 'str' in item && item.str === 'Synthetic encryption text'),
    ).toBe(true);
  } finally {
    await valid.destroy();
  }
});
