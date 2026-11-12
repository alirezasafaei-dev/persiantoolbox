import { afterEach, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { PDFDocument, PDFName } from 'pdf-lib';
import { createBusinessPdfBytes } from '@/lib/business-documents/pdf';
import type { BusinessDocumentDraft } from '@/lib/business-documents/types';
const draft: BusinessDocumentDraft = {
  id: 'synthetic',
  documentType: 'invoice',
  templateId: 'invoice',
  createdAt: '2026-11-12',
  updatedAt: '2026-11-12',
  documentDate: '2026-11-12',
  seller: { name: 'فروشنده آزمایشی', email: 'seller@example.test' },
  buyer: { name: 'خریدار آزمایشی' },
  items: [{ id: '1', description: 'آزمون React 19', quantity: 1, unitPrice: 100000 }],
  notes: 'سند آزمایشی',
  footer: 'پایان سند',
};
const totals = { subtotal: 100000, discountAmount: 0, taxAmount: 0, grandTotal: 100000 };
afterEach(() => vi.unstubAllGlobals());
it('rejects missing fonts instead of producing a false successful export', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));
  await expect(createBusinessPdfBytes(draft, totals)).rejects.toThrow();
});
it('creates actual PDF bytes locally and paginates long tables', async () => {
  const bytes = readFileSync('public/fonts/Vazirmatn-Regular.ttf');
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: async () =>
        bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
    }),
  );
  const result = await createBusinessPdfBytes(
    {
      ...draft,
      documentNumber: 'INV-TEST',
      seller: { ...draft.seller, address: 'نشانی آزمایشی' },
      items: Array.from({ length: 65 }, (_, i) => ({
        ...draft.items[0]!,
        id: String(i),
        quantity: 1.5,
        description: 'طراحی سایت (React 19) و پشتیبانی؛ متن طولانی برای آزمون صفحه‌بندی',
      })),
    },
    { ...totals, taxAmount: 15000, discountAmount: 5000, grandTotal: 110000 },
    { watermark: true },
  );
  expect(new TextDecoder().decode(result.slice(0, 5))).toBe('%PDF-');
  const pdf = await PDFDocument.load(result);
  expect(pdf.getPageCount()).toBeGreaterThan(1);
  expect(pdf.getPages().every((p) => p.getWidth() === 595 && p.getHeight() === 842)).toBe(true);
  const { getDocument } = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const reader = await getDocument({ data: result, useSystemFonts: false }).promise;
  try {
    const pages: string[] = [];
    for (let number = 1; number <= reader.numPages; number++) {
      const content = await (await reader.getPage(number)).getTextContent();
      pages.push(content.items.flatMap((item) => ('str' in item ? [item.str] : [])).join(' '));
    }
    expect(pages.join(' ')).toContain('React 19');
    const totalsPage = pages.find((page) => page.includes('مبلغ قابل پرداخت'));
    expect(totalsPage).toContain('جمع کل');
    expect(pages.join(' ')).toContain('seller@example.test');
    expect(pages.join(' ')).toContain(draft.notes);
    expect(pages.join(' ')).toContain(draft.footer);
    expect(pages.every((page) => page.includes('PersianToolbox'))).toBe(true);
  } finally {
    await reader.destroy();
  }
}, 30000);

it.each(['invoice', 'proforma', 'receipt'] as const)(
  'preserves an embedded logo for %s',
  async (documentType) => {
    const bytes = readFileSync('public/fonts/Vazirmatn-Regular.ttf');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        arrayBuffer: async () =>
          bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
      }),
    );
    const logoDataUrl = `data:image/png;base64,${readFileSync('public/favicon-32.png').toString('base64')}`;
    const pdf = await PDFDocument.load(
      await createBusinessPdfBytes({ ...draft, documentType, logoDataUrl }, totals),
    );
    expect(pdf.getPages()[0]?.node.Resources()?.has(PDFName.of('XObject'))).toBe(true);
  },
);
