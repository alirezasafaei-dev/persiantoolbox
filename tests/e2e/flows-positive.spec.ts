import { test, expect } from '@playwright/test';
import { PDFDocument, StandardFonts } from 'pdf-lib';
const createPdfPayload = async (label: string) => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([400, 200]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const text = `Persian Tools ${label}`;
  page.drawText(text, { x: 40, y: 120, size: 18, font });
  const bytes = Buffer.from(await pdfDoc.save());
  return {
    name: `pt-${label}.pdf`,
    mimeType: 'application/pdf',
    buffer: bytes,
  };
};

const createPngPayload = () => {
  const pngBase64 =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==';
  return {
    name: 'pt-image.png',
    mimeType: 'image/png',
    buffer: Buffer.from(pngBase64, 'base64'),
  };
};

test.describe('Happy-path flows', () => {
  test('PDF merge accepts two files', async ({ page }) => {
    const fileA = await createPdfPayload('A');
    const fileB = await createPdfPayload('B');

    await page.goto('/pdf-tools/merge/merge-pdf');
    const fileInput = page.locator('#merge-pdf-files');
    await fileInput.setInputFiles([fileA, fileB]);
    const selectedCount = await fileInput.evaluate(
      (el) => (el as HTMLInputElement).files?.length ?? 0,
    );
    expect(selectedCount).toBe(2);
  });

  test('Image compress accepts upload file selection', async ({ page }) => {
    const imageFile = createPngPayload();

    await page.goto('/image-tools');
    const fileInput = page.locator('input[type="file"][accept="image/jpeg,image/png,image/webp"]');
    await fileInput.setInputFiles(imageFile);
    const selectedCount = await fileInput.evaluate(
      (el) => (el as HTMLInputElement).files?.length ?? 0,
    );
    expect(selectedCount).toBe(1);
  });
});
