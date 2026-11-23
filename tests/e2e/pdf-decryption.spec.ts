import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import { encrypt as encryptWithQpdf } from '@arshad-shah/qpdf-wasm';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { encryptPDF } from '@pdfsmaller/pdf-encrypt-lite';
import { degrees, PDFDocument } from 'pdf-lib';

test.use({ serviceWorkers: 'block' });

for (const algorithm of ['RC4', 'AES-256'] as const) {
  test(`${algorithm} decryption rejects a wrong password and keeps structure after retry`, async ({
    page,
  }) => {
    const password = 'synthetic-reader-password';
    const document = await PDFDocument.create();
    document.setTitle('Synthetic protected document');
    const sourcePage = document.addPage([271, 184]);
    sourcePage.setRotation(degrees(90));
    sourcePage.drawText('Searchable text', { x: 30, y: 90 });
    const field = document.getForm().createTextField('reference');
    field.addToPage(sourcePage, { x: 20, y: 25, width: 110, height: 20 });
    field.setText('Example 42');
    const source = await document.save();
    const encrypted =
      algorithm === 'RC4'
        ? await encryptPDF(source, password, null)
        : (
            await encryptWithQpdf(source, {
              userPassword: password,
              ownerPassword: 'synthetic-owner',
            })
          ).bytes;
    const fixture = {
      name: 'protected-fixture.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from(encrypted),
    };

    await page.goto('/pdf-tools/security/decrypt-pdf');
    await page.route('**/api/history', (route) => route.fulfill({ json: {} }));
    await page
      .context()
      .addCookies([
        { name: 'pt_session', value: 'synthetic-history-fixture', url: new URL(page.url()).origin },
      ]);
    const outbound: string[] = [];
    page.on('request', (request) => {
      if (/^https?:/.test(request.url())) {
        outbound.push(`${request.url()}\n${request.postData() ?? ''}`);
      }
    });
    const fileInput = page.getByLabel('انتخاب فایل PDF');
    await expect(async () => {
      await fileInput.setInputFiles([]);
      await fileInput.setInputFiles(fixture);
      await expect(page.getByText(fixture.name, { exact: false })).toBeVisible({
        timeout: 1_000,
      });
    }).toPass({ timeout: 10_000 });
    const passwordInput = page.locator('#decrypt-pdf-password');
    const submit = page.getByRole('button', { name: 'حذف رمز', exact: true });
    await passwordInput.fill('wrong-synthetic-password');
    await submit.click();
    await expect(
      page.getByRole('alert').filter({ hasText: /رمز.*اشتباه|رمز.*نادرست/ }),
    ).toBeVisible({
      timeout: 8_000,
    });
    await expect(submit).toBeEnabled();
    await expect(page.getByRole('link', { name: 'دانلود فایل', exact: true })).toHaveCount(0);

    await passwordInput.fill(password);
    await submit.click();
    const link = page.getByRole('link', { name: 'دانلود فایل', exact: true });
    const [download, historyRequest] = await Promise.all([
      page.waitForEvent('download'),
      page.waitForRequest(
        (request) =>
          request.method() === 'POST' && new URL(request.url()).pathname === '/api/history',
      ),
      link.click(),
    ]);
    expect(historyRequest.postDataJSON()).toEqual({
      tool: 'pdf-decrypt',
      inputSummary: 'حذف رمز یک فایل PDF',
      outputSummary: expect.stringMatching(/^دانلود فایل با حجم /),
    });
    for (const value of [
      password,
      'wrong-synthetic-password',
      fixture.name,
      'Synthetic protected document',
    ]) {
      expect(
        outbound.some(
          (request) => request.includes(encodeURIComponent(value)) || request.includes(value),
        ),
      ).toBe(false);
    }
    const downloadPath = await download.path();
    if (!downloadPath) {
      throw new Error('The downloaded PDF has no local path.');
    }
    const bytes = await readFile(downloadPath);
    const output = await PDFDocument.load(bytes);
    expect(output.getTitle()).toBe('Synthetic protected document');
    expect(output.getPageCount()).toBe(1);
    expect(output.getPage(0).getSize()).toEqual({ width: 271, height: 184 });
    expect(output.getPage(0).getRotation().angle).toBe(90);
    expect(output.getForm().getTextField('reference').getText()).toBe('Example 42');
    const task = getDocument({ data: Uint8Array.from(bytes), isEvalSupported: false });
    try {
      const pdf = await task.promise;
      const content = await (await pdf.getPage(1)).getTextContent();
      expect(content.items.some((item) => 'str' in item && item.str === 'Searchable text')).toBe(
        true,
      );
    } finally {
      await task.destroy();
    }
  });
}
