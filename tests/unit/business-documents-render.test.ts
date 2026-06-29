import { describe, it, expect } from 'vitest';
import { renderDocument } from '@/lib/business-documents/render';
import type { BusinessDocumentDraft, BusinessDocumentTotals } from '@/lib/business-documents/types';

function makeDraft(overrides?: Partial<BusinessDocumentDraft>): BusinessDocumentDraft {
  return {
    id: 'test-1',
    documentType: 'invoice',
    createdAt: '2026-06-01T00:00:00.000Z',
    updatedAt: '2026-06-01T00:00:00.000Z',
    templateId: 'invoice',
    seller: {
      name: 'شرکت آزمون',
      phone: '02112345678',
      nationalId: '1234567890',
    },
    buyer: {
      name: 'مشتری آزمون',
      phone: '09121234567',
    },
    items: [
      { id: 'i1', description: 'خدمات طراحی سایت', quantity: 1, unitPrice: 5000000, unit: 'پروژه' },
      { id: 'i2', description: 'پشتیبانی ماهانه', quantity: 3, unitPrice: 1000000, unit: 'ماه' },
    ],
    documentNumber: 'INV-001',
    documentDate: '2026-06-15',
    notes: 'توضیحات تکمیلی',
    footer: 'با تشکر از همکاری شما',
    ...overrides,
  };
}

function makeTotals(overrides?: Partial<BusinessDocumentTotals>): BusinessDocumentTotals {
  return {
    subtotal: 8000000,
    discountAmount: 500000,
    taxAmount: 0,
    grandTotal: 7500000,
    ...overrides,
  };
}

describe('renderDocument', () => {
  it('returns a complete HTML document', () => {
    const html = renderDocument(makeDraft(), makeTotals());
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('</html>');
  });

  it('includes the document title in the title tag', () => {
    const html = renderDocument(makeDraft(), makeTotals());
    expect(html).toContain('<title>');
    expect(html).toContain('فاکتور فروش');
  });

  it('includes item rows in the table', () => {
    const html = renderDocument(makeDraft(), makeTotals());
    expect(html).toContain('خدمات طراحی سایت');
    expect(html).toContain('پشتیبانی ماهانه');
    expect(html).toContain('۵,۰۰۰,۰۰۰');
    expect(html).toContain('۱,۰۰۰,۰۰۰');
  });

  it('shows discount row when discount exists', () => {
    const html = renderDocument(makeDraft(), makeTotals({ discountAmount: 500000 }));
    expect(html).toContain('تخفیف');
    expect(html).toContain('۵۰۰,۰۰۰');
  });

  it('hides discount row when discount is zero', () => {
    const html = renderDocument(makeDraft(), makeTotals({ discountAmount: 0 }));
    expect(html).not.toContain('تخفیف');
  });

  it('shows tax row when tax exists', () => {
    const html = renderDocument(makeDraft(), makeTotals({ taxAmount: 900000 }));
    expect(html).toContain('مالیات');
    expect(html).toContain('۹۰۰,۰۰۰');
  });

  it('shows notes section when notes are present', () => {
    const html = renderDocument(makeDraft(), makeTotals());
    expect(html).toContain('توضیحات');
    expect(html).toContain('توضیحات تکمیلی');
  });

  it('omits notes section when notes are empty', () => {
    const draft = makeDraft() as unknown as BusinessDocumentDraft;
    const withoutNotes = { ...draft };
    delete (withoutNotes as { notes?: string }).notes;
    const html = renderDocument(withoutNotes as BusinessDocumentDraft, makeTotals());
    expect(html).not.toContain('توضیحات');
  });

  it('includes footer when provided', () => {
    const html = renderDocument(makeDraft(), makeTotals());
    expect(html).toContain('با تشکر از همکاری شما');
  });

  it('includes watermark when option is true', () => {
    const html = renderDocument(makeDraft(), makeTotals(), { watermark: true });
    expect(html).toContain('ساخته‌شده با PersianToolbox');
  });

  it('omits watermark when option is false', () => {
    const html = renderDocument(makeDraft(), makeTotals(), { watermark: false });
    expect(html).not.toContain('ساخته‌شده با PersianToolbox');
  });

  it('includes logo when logoDataUrl is present', () => {
    const html = renderDocument(
      makeDraft({ logoDataUrl: 'data:image/png;base64,abc' }),
      makeTotals(),
    );
    expect(html).toContain('data:image/png;base64,abc');
  });

  it('renders buyer and seller names', () => {
    const html = renderDocument(makeDraft(), makeTotals());
    expect(html).toContain('شرکت آزمون');
    expect(html).toContain('مشتری آزمون');
  });

  it('shows grand total', () => {
    const html = renderDocument(makeDraft(), makeTotals());
    expect(html).toContain('مبلغ قابل پرداخت');
    expect(html).toContain('۷,۵۰۰,۰۰۰');
  });

  it('uses RTL direction by default', () => {
    const html = renderDocument(makeDraft(), makeTotals());
    expect(html).toContain('dir="rtl"');
  });

  it('uses LTR direction when option is set', () => {
    const html = renderDocument(makeDraft(), makeTotals(), { rtl: false });
    expect(html).toContain('dir="ltr"');
  });

  it('escapes HTML in user-provided fields', () => {
    const draft = makeDraft({
      notes: '<script>alert("xss")</script>',
      seller: { name: '<b>Company</b>', phone: '02112345678', nationalId: '1234567890' },
    });
    const html = renderDocument(draft, makeTotals());
    expect(html).toContain('&lt;script&gt;');
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;b&gt;Company&lt;/b&gt;');
  });

  it('handles proforma document type', () => {
    const draft = makeDraft({ documentType: 'proforma' });
    const html = renderDocument(draft, makeTotals());
    expect(html).toContain('پیش‌فاکتور');
  });

  it('handles receipt document type', () => {
    const draft = makeDraft({ documentType: 'receipt' });
    const html = renderDocument(draft, makeTotals());
    expect(html).toContain('رسید');
  });

  it('adds the disclaimer to the output', () => {
    const html = renderDocument(makeDraft(), makeTotals());
    expect(html).toContain('این ابزار صرفاً برای ساخت پیش‌نویس');
  });
});
