import { afterEach, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { PDFDocument } from 'pdf-lib';
import { downloadPdf as downloadCertificate } from '@/lib/work-certificate/export';
import { downloadPdf as downloadLetter } from '@/lib/formal-letter/export';
import { createDocumentPdf } from '@/lib/document-pdf/download';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it.each([downloadCertificate, downloadLetter])(
  'rejects an unavailable PDF font without opening a print window',
  async (download) => {
    const popup = vi.spyOn(window, 'open').mockReturnValue(null);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    await expect(
      download('<div class="container"><h1>آزمون</h1></div>', 'test.pdf'),
    ).rejects.toThrow('Document font unavailable');
    expect(click).not.toHaveBeenCalled();
    expect(popup).not.toHaveBeenCalled();
  },
);

it('generates a paginated PDF with embedded Persian fonts and no remote image requests', async () => {
  const fetchFont = vi.fn(async (url: string) => {
    if (!/^\/fonts\/Vazirmatn-(Regular|Bold)\.ttf$/.test(url)) {
      throw new Error(`Unexpected request: ${url}`);
    }
    const bytes = new Uint8Array(readFileSync(`public${url}`));
    return { ok: true, arrayBuffer: async () => bytes.buffer };
  });
  vi.stubGlobal('fetch', fetchFont);
  const html = `<div class="watermark">پیش‌نویس</div><div class="container">
    <h1>گواهی اشتغال</h1>${'<p>آزمون متن فارسی React 19</p>'.repeat(80)}</div>`;
  const document = await PDFDocument.load(await createDocumentPdf(html));
  expect(document.getPageCount()).toBeGreaterThan(1);
  expect(fetchFont).toHaveBeenCalledTimes(2);
  await expect(
    createDocumentPdf('<div class="container"><img src="https://example.test/logo"></div>'),
  ).rejects.toThrow('Unsupported document image');
  expect(fetchFont.mock.calls.every(([url]) => url.startsWith('/fonts/'))).toBe(true);
});
