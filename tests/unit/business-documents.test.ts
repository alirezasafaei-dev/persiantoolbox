import { describe, it, expect, beforeEach } from 'vitest';
import {
  calculateTotals,
  generateDocumentNumber,
  toPersianDigits,
  formatCurrency,
  toJalali,
  getDocumentTitle,
} from '@/lib/business-documents/calculations';
import {
  validateParty,
  validateItems,
  DISCLAIMER,
  WATERMARK_TEXT,
} from '@/lib/business-documents/types';
import { DOCUMENT_TYPES, FEATURE_GATES, FREE_MAX_DRAFTS } from '@/lib/business-documents/schemas';
import { renderDocument } from '@/lib/business-documents/render';
import {
  saveDraft,
  loadDrafts,
  deleteDraft,
  canSaveDraft,
  createDraftId,
} from '@/lib/business-documents/draft-storage';
import { isDocxAvailable } from '@/lib/business-documents/export';
import type { BusinessDocumentDraft, BusinessLineItem } from '@/lib/business-documents/types';

function makeDraft(overrides?: Partial<BusinessDocumentDraft>): BusinessDocumentDraft {
  return {
    id: 'test-draft-1',
    documentType: 'invoice',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    seller: { name: 'فروشنده تست', nationalId: '1234567890' },
    buyer: { name: 'خریدار تست', nationalId: '0987654321' },
    items: [{ id: '1', description: 'کالای تست', quantity: 2, unitPrice: 100000 }],
    templateId: 'invoice',
    ...overrides,
  };
}

function makeTotals() {
  return { subtotal: 200000, discountAmount: 20000, taxAmount: 18000, grandTotal: 198000 };
}

describe('Business Documents - Calculations', () => {
  describe('calculateTotals', () => {
    it('calculates subtotal, discount, tax, grand total', () => {
      const items: BusinessLineItem[] = [
        { id: '1', description: 'A', quantity: 2, unitPrice: 100000 },
        { id: '2', description: 'B', quantity: 1, unitPrice: 50000 },
      ];
      const totals = calculateTotals(items, 10, 9);
      expect(totals.subtotal).toBe(250000);
      expect(totals.discountAmount).toBe(25000);
      expect(totals.taxAmount).toBe(20250);
      expect(totals.grandTotal).toBe(245250);
    });

    it('returns zeros when no discount or tax', () => {
      const items: BusinessLineItem[] = [
        { id: '1', description: 'A', quantity: 3, unitPrice: 10000 },
      ];
      const totals = calculateTotals(items);
      expect(totals.subtotal).toBe(30000);
      expect(totals.discountAmount).toBe(0);
      expect(totals.taxAmount).toBe(0);
      expect(totals.grandTotal).toBe(30000);
    });

    it('handles both discount and tax correctly', () => {
      const items: BusinessLineItem[] = [
        { id: '1', description: 'A', quantity: 1, unitPrice: 1000000 },
      ];
      const totals = calculateTotals(items, 20, 10);
      expect(totals.subtotal).toBe(1000000);
      expect(totals.discountAmount).toBe(200000);
      expect(totals.taxAmount).toBe(80000);
      expect(totals.grandTotal).toBe(880000);
    });
  });

  describe('generateDocumentNumber', () => {
    it('returns correct prefix for invoice', () => {
      const num = generateDocumentNumber('invoice');
      expect(num).toMatch(/^INV-/);
    });

    it('returns correct prefix for proforma', () => {
      const num = generateDocumentNumber('proforma');
      expect(num).toMatch(/^PRO-/);
    });

    it('returns correct prefix for receipt', () => {
      const num = generateDocumentNumber('receipt');
      expect(num).toMatch(/^REC-/);
    });

    it('includes Persian digits in year', () => {
      const num = generateDocumentNumber('invoice');
      const yearPart = num.split('-')[1];
      expect(yearPart).toMatch(/^[۰-۹]+$/);
    });
  });

  describe('toPersianDigits', () => {
    it('converts 0-9 to Persian digits', () => {
      expect(toPersianDigits('0123456789')).toBe('۰۱۲۳۴۵۶۷۸۹');
    });

    it('converts a number', () => {
      expect(toPersianDigits(42)).toBe('۴۲');
    });

    it('preserves mixed content', () => {
      expect(toPersianDigits('ABC123')).toBe('ABC۱۲۳');
    });

    it('handles empty string', () => {
      expect(toPersianDigits('')).toBe('');
    });
  });

  describe('formatCurrency', () => {
    it('formats amount with تومان suffix', () => {
      expect(formatCurrency(1000000)).toContain('تومان');
      expect(formatCurrency(1000000)).toContain('۱');
    });

    it('formats zero correctly', () => {
      expect(formatCurrency(0)).toBe('۰ تومان');
    });

    it('rounds fractional amounts', () => {
      const result = formatCurrency(99999.5);
      expect(result).toContain('تومان');
      expect(result).toContain('۱۰۰');
    });
  });

  describe('toJalali', () => {
    it('converts Gregorian to Jalali', () => {
      const jalali = toJalali(new Date(2025, 0, 1));
      expect(jalali).toContain('/');
      const parts = jalali.split('/');
      expect(parts).toHaveLength(3);
      expect(parts.length).toBe(3);
    });
  });

  describe('getDocumentTitle', () => {
    it('returns correct title for invoice', () => {
      expect(getDocumentTitle('invoice')).toBe('فاکتور فروش');
    });

    it('returns correct title for proforma', () => {
      expect(getDocumentTitle('proforma')).toBe('پیش‌فاکتور');
    });

    it('returns correct title for receipt', () => {
      expect(getDocumentTitle('receipt')).toBe('رسید دریافت وجه');
    });
  });
});

describe('Business Documents - Validation', () => {
  describe('validateParty', () => {
    it('requires name for seller', () => {
      const errors = validateParty({ name: '' }, 'فروشنده');
      expect(errors).toContain('نام فروشنده الزامی است');
    });

    it('requires name for buyer', () => {
      const errors = validateParty({ name: '' }, 'خریدار');
      expect(errors).toContain('نام خریدار الزامی است');
    });

    it('validates 10-digit national ID', () => {
      const errors = validateParty({ name: 'Test', nationalId: '123' }, 'فروشنده');
      expect(errors.some((e) => e.includes('۱۰ رقمی'))).toBe(true);
    });

    it('accepts valid 10-digit national ID', () => {
      const errors = validateParty({ name: 'Test', nationalId: '1234567890' }, 'فروشنده');
      expect(errors.some((e) => e.includes('۱۰ رقمی'))).toBe(false);
    });

    it('validates phone format', () => {
      const errors = validateParty({ name: 'Test', phone: '123' }, 'خریدار');
      expect(errors.some((e) => e.includes('تلفن'))).toBe(true);
    });

    it('accepts valid phone', () => {
      const errors = validateParty({ name: 'Test', phone: '09121234567' }, 'خریدار');
      expect(errors.some((e) => e.includes('تلفن'))).toBe(false);
    });

    it('validates email format', () => {
      const errors = validateParty({ name: 'Test', email: 'not-an-email' }, 'فروشنده');
      expect(errors.some((e) => e.includes('ایمیل'))).toBe(true);
    });

    it('accepts valid email', () => {
      const errors = validateParty({ name: 'Test', email: 'a@b.com' }, 'فروشنده');
      expect(errors.some((e) => e.includes('ایمیل'))).toBe(false);
    });

    it('returns empty array for valid party', () => {
      const errors = validateParty(
        { name: 'Test', nationalId: '1234567890', phone: '09121234567', email: 'a@b.com' },
        'فروشنده',
      );
      expect(errors).toHaveLength(0);
    });
  });

  describe('validateItems', () => {
    it('requires at least one item', () => {
      const errors = validateItems([]);
      expect(errors).toContain('حداقل یک ردیف کالا/خدمت الزامی است');
    });

    it('requires description for each item', () => {
      const errors = validateItems([{ id: '1', description: '', quantity: 1, unitPrice: 100 }]);
      expect(errors.some((e) => e.includes('شرح'))).toBe(true);
    });

    it('requires quantity > 0', () => {
      const errors = validateItems([{ id: '1', description: 'Test', quantity: 0, unitPrice: 100 }]);
      expect(errors.some((e) => e.includes('تعداد'))).toBe(true);
    });

    it('requires unitPrice > 0', () => {
      const errors = validateItems([{ id: '1', description: 'Test', quantity: 1, unitPrice: 0 }]);
      expect(errors.some((e) => e.includes('قیمت واحد'))).toBe(true);
    });

    it('returns empty array for valid items', () => {
      const errors = validateItems([{ id: '1', description: 'Test', quantity: 1, unitPrice: 100 }]);
      expect(errors).toHaveLength(0);
    });
  });
});

describe('Business Documents - Schemas', () => {
  it('DOCUMENT_TYPES has exactly 3 entries', () => {
    expect(DOCUMENT_TYPES).toHaveLength(3);
  });

  it('each DOCUMENT_TYPE has id, title, description', () => {
    for (const dt of DOCUMENT_TYPES) {
      expect(dt.id).toBeTruthy();
      expect(dt.title).toBeTruthy();
      expect(dt.description).toBeTruthy();
    }
  });

  it('FEATURE_GATES has entries for all 3 document types', () => {
    expect(FEATURE_GATES.invoice).toBeDefined();
    expect(FEATURE_GATES.proforma).toBeDefined();
    expect(FEATURE_GATES.receipt).toBeDefined();
  });

  it('FEATURE_GATES free canExportDocx is false', () => {
    expect(FEATURE_GATES.invoice.free.canExportDocx).toBe(false);
    expect(FEATURE_GATES.proforma.free.canExportDocx).toBe(false);
    expect(FEATURE_GATES.receipt.free.canExportDocx).toBe(false);
  });

  it('FEATURE_GATES free canExportPdf is false', () => {
    expect(FEATURE_GATES.invoice.free.canExportPdf).toBe(false);
    expect(FEATURE_GATES.proforma.free.canExportPdf).toBe(false);
    expect(FEATURE_GATES.receipt.free.canExportPdf).toBe(false);
  });

  it('FEATURE_GATES free canUseLogo is false', () => {
    expect(FEATURE_GATES.invoice.free.canUseLogo).toBe(false);
    expect(FEATURE_GATES.proforma.free.canUseLogo).toBe(false);
    expect(FEATURE_GATES.receipt.free.canUseLogo).toBe(false);
  });

  it('FEATURE_GATES free hasWatermark is true', () => {
    expect(FEATURE_GATES.invoice.free.hasWatermark).toBe(true);
    expect(FEATURE_GATES.proforma.free.hasWatermark).toBe(true);
    expect(FEATURE_GATES.receipt.free.hasWatermark).toBe(true);
  });

  it('FEATURE_GATES free maxDrafts is 3', () => {
    expect(FEATURE_GATES.invoice.free.maxDrafts).toBe(3);
    expect(FEATURE_GATES.proforma.free.maxDrafts).toBe(3);
    expect(FEATURE_GATES.receipt.free.maxDrafts).toBe(3);
  });

  it('FEATURE_GATES premium canExportDocx is true', () => {
    expect(FEATURE_GATES.invoice.premium.canExportDocx).toBe(true);
    expect(FEATURE_GATES.proforma.premium.canExportDocx).toBe(true);
    expect(FEATURE_GATES.receipt.premium.canExportDocx).toBe(true);
  });

  it('FEATURE_GATES premium canExportPdf is true', () => {
    expect(FEATURE_GATES.invoice.premium.canExportPdf).toBe(true);
    expect(FEATURE_GATES.proforma.premium.canExportPdf).toBe(true);
    expect(FEATURE_GATES.receipt.premium.canExportPdf).toBe(true);
  });

  it('FEATURE_GATES premium canUseLogo is true', () => {
    expect(FEATURE_GATES.invoice.premium.canUseLogo).toBe(true);
    expect(FEATURE_GATES.proforma.premium.canUseLogo).toBe(true);
    expect(FEATURE_GATES.receipt.premium.canUseLogo).toBe(true);
  });

  it('FEATURE_GATES premium hasWatermark is false', () => {
    expect(FEATURE_GATES.invoice.premium.hasWatermark).toBe(false);
    expect(FEATURE_GATES.proforma.premium.hasWatermark).toBe(false);
    expect(FEATURE_GATES.receipt.premium.hasWatermark).toBe(false);
  });

  it('FEATURE_GATES premium maxDrafts is 100', () => {
    expect(FEATURE_GATES.invoice.premium.maxDrafts).toBe(100);
    expect(FEATURE_GATES.proforma.premium.maxDrafts).toBe(100);
    expect(FEATURE_GATES.receipt.premium.maxDrafts).toBe(100);
  });

  it('FREE_MAX_DRAFTS is 3', () => {
    expect(FREE_MAX_DRAFTS).toBe(3);
  });
});

describe('Business Documents - Render', () => {
  const totals = makeTotals();

  it('returns HTML containing seller name', () => {
    const html = renderDocument(makeDraft(), totals, { watermark: false });
    expect(html).toContain('فروشنده تست');
  });

  it('returns HTML containing buyer name', () => {
    const html = renderDocument(makeDraft(), totals, { watermark: false });
    expect(html).toContain('خریدار تست');
  });

  it('returns HTML containing item descriptions', () => {
    const html = renderDocument(makeDraft(), totals, { watermark: false });
    expect(html).toContain('کالای تست');
  });

  it('returns HTML containing totals', () => {
    const html = renderDocument(makeDraft(), totals, { watermark: false });
    expect(html).toContain('جمع کل');
    expect(html).toContain('مبلغ قابل پرداخت');
  });

  it('includes DISCLAIMER text', () => {
    const html = renderDocument(makeDraft(), totals, { watermark: false });
    expect(html).toContain(DISCLAIMER);
  });

  it('with watermark includes WATERMARK_TEXT', () => {
    const html = renderDocument(makeDraft(), totals, { watermark: true });
    expect(html).toContain(WATERMARK_TEXT);
  });

  it('without watermark excludes WATERMARK_TEXT', () => {
    const html = renderDocument(makeDraft(), totals, { watermark: false });
    expect(html).not.toContain(WATERMARK_TEXT);
  });

  it('receipt type shows پرداخت‌کننده/دریافت‌کننده labels', () => {
    const html = renderDocument(makeDraft({ documentType: 'receipt' }), totals, {
      watermark: false,
    });
    expect(html).toContain('دریافت‌کننده');
    expect(html).toContain('پرداخت‌کننده');
  });

  it('invoice type shows فروشنده/خریدار labels', () => {
    const html = renderDocument(makeDraft({ documentType: 'invoice' }), totals, {
      watermark: false,
    });
    expect(html).toContain('فروشنده');
    expect(html).toContain('خریدار');
  });
});

describe('Business Documents - Draft Storage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('saveDraft + loadDrafts round-trip serialization', () => {
    const draft = makeDraft();
    saveDraft(draft);
    const loaded = loadDrafts();
    expect(loaded).toHaveLength(1);
    const first = loaded[0] as NonNullable<(typeof loaded)[number]>;
    expect(first.id).toBe(draft.id);
    expect(first.seller.name).toBe('فروشنده تست');
  });

  it('loadDrafts with no data returns empty array', () => {
    const loaded = loadDrafts();
    expect(loaded).toHaveLength(0);
  });

  it('deleteDraft removes draft by id', () => {
    saveDraft(makeDraft({ id: 'd1' }));
    saveDraft(makeDraft({ id: 'd2' }));
    deleteDraft('d1');
    const loaded = loadDrafts();
    expect(loaded).toHaveLength(1);
    const first = loaded[0] as NonNullable<(typeof loaded)[number]>;
    expect(first.id).toBe('d2');
  });

  it('canSaveDraft returns true when under limit', () => {
    saveDraft(makeDraft({ id: 'd1', documentType: 'invoice' }));
    expect(canSaveDraft('invoice')).toBe(true);
  });

  it('canSaveDraft returns false when at limit', () => {
    for (let i = 0; i < 3; i++) {
      saveDraft(makeDraft({ id: `d${i}`, documentType: 'invoice' }));
    }
    expect(canSaveDraft('invoice')).toBe(false);
  });

  it('createDraftId returns unique IDs', () => {
    const id1 = createDraftId();
    const id2 = createDraftId();
    expect(id1).toMatch(/^bdoc_/);
    expect(id2).toMatch(/^bdoc_/);
    expect(id1).not.toBe(id2);
  });
});

describe('Business Documents - Export', () => {
  it('isDocxAvailable returns true', () => {
    expect(isDocxAvailable()).toBe(true);
  });
});
