import { describe, expect, it } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { encryptPDF } from '@pdfsmaller/pdf-encrypt-lite';

async function createPdf(): Promise<Uint8Array> {
  const document = await PDFDocument.create();
  const page = document.addPage([300, 200]);
  page.drawText('PersianToolbox PDF encryption regression');
  return document.save({ useObjectStreams: false });
}

function expectEncryptedPdf(bytes: Uint8Array, plain: Uint8Array): void {
  const output = Buffer.from(bytes);
  const source = Buffer.from(plain);
  const text = output.toString('latin1');

  expect(output.subarray(0, 5).toString('ascii')).toBe('%PDF-');
  expect(output.equals(source)).toBe(false);
  expect(text.includes('/Encrypt') || text.includes('/Filter /Standard')).toBe(true);
}

describe('PDF encryption dependency regression', () => {
  it('encrypts a PDF when only the required user password is provided', async () => {
    const plain = await createPdf();
    const encrypted = await encryptPDF(plain, 'user-pass', null);

    expectEncryptedPdf(encrypted, plain);
  });

  it('encrypts a PDF when both user and owner passwords are provided', async () => {
    const plain = await createPdf();
    const encrypted = await encryptPDF(plain, 'user-pass', 'owner-pass');

    expectEncryptedPdf(encrypted, plain);
  });
});
