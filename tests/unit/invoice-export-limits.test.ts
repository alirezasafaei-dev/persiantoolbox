import { afterEach, describe, expect, it, vi } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { createInvoicePdfBytes, type InvoicePdfData } from '@/lib/invoice-tools/pdf';
import { InvoicePdfInputError } from '@/lib/invoice-tools/export-error';

// Exercise the real paginator without making this resource-boundary test depend
// on shaping thousands of identical glyphs or on wall-clock performance.
vi.mock('@/lib/invoice-tools/rtl-pdf', () => ({
  createInvoiceFont: async () => ({
    wrap: (value: string) => value.split('\n'),
    measure: () => 20,
    draw: vi.fn(),
  }),
  finishInvoiceFonts: vi.fn(),
}));

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const data = (count: number, description = 'item'): InvoicePdfData => ({
  invoiceNumber: 'INV-0001',
  clientName: '',
  taxRate: '',
  discount: '',
  paymentTerms: '',
  items: Array.from({ length: count }, () => ({ description, quantity: '1', unitPrice: '100' })),
});

describe('bounded invoice export', () => {
  it('rejects excessive item count before loading fonts or creating a PDF', async () => {
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    const create = vi.spyOn(PDFDocument, 'create');
    await expect(createInvoicePdfBytes(data(1001))).rejects.toBeInstanceOf(InvoicePdfInputError);
    expect(fetch).not.toHaveBeenCalled();
    expect(create).not.toHaveBeenCalled();
  });

  it('stops aggregate pagination before serializing a partial invoice', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: true, arrayBuffer: async () => new ArrayBuffer(0) })),
    );
    const save = vi.spyOn(PDFDocument.prototype, 'save');
    const addPage = vi.spyOn(PDFDocument.prototype, 'addPage');
    await expect(createInvoicePdfBytes(data(1000, 'a\nb\nc\nd\ne'))).rejects.toBeInstanceOf(
      InvoicePdfInputError,
    );
    expect(addPage).toHaveBeenCalledTimes(100);
    expect(save).not.toHaveBeenCalled();
  });

  it('allows a normal 1000-item invoice within the aggregate page budget', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: true, arrayBuffer: async () => new ArrayBuffer(0) })),
    );
    const save = vi.spyOn(PDFDocument.prototype, 'save').mockResolvedValue(new Uint8Array([1]));
    await expect(createInvoicePdfBytes(data(1000))).resolves.toEqual(new Uint8Array([1]));
    expect(save).toHaveBeenCalledOnce();
  });
});
