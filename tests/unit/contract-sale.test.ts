import { describe, it, expect, beforeEach } from 'vitest';
import {
  validateSaleAgreement,
  DISCLAIMER,
  PRIVACY_TEXT,
  WATERMARK_TEXT,
} from '@/lib/contract-sale/types';
import { SALE_TEMPLATES, FEATURE_GATES, FREE_TEMPLATES } from '@/lib/contract-sale/schemas';
import { STANDARD_CLAUSES, PREMIUM_CLAUSES } from '@/lib/contract-sale/clauses';
import {
  toPersianDigits,
  formatDate,
  numberToWords,
  createContractId,
  getCurrentDate,
} from '@/lib/contract-sale/calculations';
import { renderSaleAgreement } from '@/lib/contract-sale/render';
import {
  saveDraft,
  loadDrafts,
  deleteDraft,
  getDraftCount,
  canSaveDraft,
  createDraftId,
} from '@/lib/contract-sale/draft-storage';
import type { SaleAgreementData } from '@/lib/contract-sale/types';

function makeValidData(overrides?: Partial<SaleAgreementData>): SaleAgreementData {
  return {
    sellerName: 'رضا محمدی',
    sellerNationalId: '۱۲۳۴۵۶۷۸۹۰',
    sellerPhone: '۰۹۱۲۱۲۳۴۵۶۷',
    sellerAddress: 'تهران، خیابان ولیعصر',
    buyerName: 'سارا احمدی',
    buyerNationalId: '۰۹۸۷۶۵۴۳۲۱',
    buyerPhone: '۰۹۱۹۸۷۶۵۴۳۲',
    buyerAddress: 'تهران، خیابان انقلاب',
    propertyAddress: 'تهران، خیابان آزادی، پلاک ۱۲۳',
    propertyParcelId: '۱۲۳۴',
    propertyArea: '۸۰',
    propertyDeedNo: '۱۲۳۴۵۶',
    propertyRegistryNo: '۷۸۹۰',
    salePrice: '۵۰۰۰۰۰۰۰۰۰',
    depositAmount: '۵۰۰۰۰۰۰۰۰',
    paymentMethod: 'نقدی',
    deliveryDate: '2025-01-01',
    contractDate: '2024-12-01',
    possessionDate: '2025-01-15',
    templateId: 'standard',
    additionalClauses: [],
    description: '',
    signatureSeller: '',
    signatureBuyer: '',
    ...overrides,
  };
}

describe('Contract Sale - Types & Validation', () => {
  it('accepts valid data', () => {
    expect(validateSaleAgreement(makeValidData())).toEqual([]);
  });

  it('rejects missing sellerName', () => {
    expect(validateSaleAgreement(makeValidData({ sellerName: '' }))).toContain(
      'نام فروشنده الزامی است',
    );
  });

  it('rejects missing buyerName', () => {
    expect(validateSaleAgreement(makeValidData({ buyerName: '' }))).toContain(
      'نام خریدار الزامی است',
    );
  });

  it('rejects missing propertyAddress', () => {
    expect(validateSaleAgreement(makeValidData({ propertyAddress: '' }))).toContain(
      'آدرس ملک الزامی است',
    );
  });

  it('rejects missing salePrice', () => {
    expect(validateSaleAgreement(makeValidData({ salePrice: '' }))).toContain(
      'قیمت فروش الزامی است',
    );
  });

  it('rejects missing depositAmount', () => {
    expect(validateSaleAgreement(makeValidData({ depositAmount: '' }))).toContain(
      'مبلغ بیعانه الزامی است',
    );
  });

  it('has non-empty constants', () => {
    expect(DISCLAIMER.length).toBeGreaterThan(0);
    expect(PRIVACY_TEXT.length).toBeGreaterThan(0);
    expect(WATERMARK_TEXT.length).toBeGreaterThan(0);
  });
});

describe('Contract Sale - Schemas', () => {
  it('has 3 templates', () => {
    expect(SALE_TEMPLATES).toHaveLength(3);
  });

  it('free tier limited', () => {
    expect(FEATURE_GATES.free.availableTemplates).toEqual(['standard']);
    expect(FEATURE_GATES.free.hasWatermark).toBe(true);
    expect(FEATURE_GATES.free.canExportPdf).toBe(false);
    expect(FEATURE_GATES.free.canAddCustomClauses).toBe(false);
  });

  it('premium tier has all features', () => {
    expect(FEATURE_GATES.premium.availableTemplates).toHaveLength(3);
    expect(FEATURE_GATES.premium.hasWatermark).toBe(false);
    expect(FEATURE_GATES.premium.canExportPdf).toBe(true);
    expect(FEATURE_GATES.premium.canAddCustomClauses).toBe(true);
  });

  it('free templates are standard only', () => {
    expect(FREE_TEMPLATES).toEqual(['standard']);
  });
});

describe('Contract Sale - Clauses', () => {
  it('has 6 standard clauses', () => {
    expect(STANDARD_CLAUSES).toHaveLength(6);
  });

  it('has 4 premium clauses', () => {
    expect(PREMIUM_CLAUSES).toHaveLength(4);
  });

  it('all clauses have required fields', () => {
    for (const c of [...STANDARD_CLAUSES, ...PREMIUM_CLAUSES]) {
      expect(c.id).toBeTruthy();
      expect(c.title).toBeTruthy();
      expect(c.text).toBeTruthy();
    }
  });
});

describe('Contract Sale - Calculations', () => {
  it('toPersianDigits works', () => {
    expect(toPersianDigits(123)).toBe('۱۲۳');
    expect(toPersianDigits('')).toBe('');
  });

  it('formatDate works', () => {
    const result = formatDate('2024-06-15');
    expect(result).toBeTruthy();
  });

  it('numberToWords converts numbers', () => {
    expect(numberToWords('۰')).toBe('صفر');
    expect(numberToWords('۱۰۰')).toBe('صد');
    expect(numberToWords('۱۰۰۰')).toBe('یک هزار');
    expect(numberToWords('۱۰۰۰۰۰۰')).toBe('یک میلیون');
  });

  it('createContractId returns unique IDs', () => {
    const id1 = createContractId();
    const id2 = createContractId();
    expect(id1).not.toBe(id2);
    expect(id1).toContain('sale_');
  });

  it('getCurrentDate returns valid date', () => {
    expect(getCurrentDate()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('Contract Sale - Render', () => {
  it('renders valid HTML', () => {
    const data = makeValidData();
    const html = renderSaleAgreement(data, { watermark: true });
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('مبایعه‌نامه');
    expect(html).toContain('رضا محمدی');
    expect(html).toContain('سارا احمدی');
    expect(html).toContain(WATERMARK_TEXT);
  });

  it('renders without watermark', () => {
    const html = renderSaleAgreement(makeValidData(), { watermark: false });
    expect(html).not.toContain(WATERMARK_TEXT);
  });

  it('renders with premium clauses', () => {
    const html = renderSaleAgreement(makeValidData(), {
      watermark: false,
      premiumClauses: ['arbitration', 'tax'],
    });
    expect(html).toContain('داوری');
    expect(html).toContain('مالیات و عوارض');
  });

  it('includes disclaimer', () => {
    const html = renderSaleAgreement(makeValidData(), { watermark: false });
    expect(html).toContain(DISCLAIMER);
  });

  it('renders custom additional clauses', () => {
    const data = makeValidData({ additionalClauses: ['شرط اضافی تست'] });
    const html = renderSaleAgreement(data, { watermark: false });
    expect(html).toContain('شرط اضافی تست');
  });

  it('renders with signatures', () => {
    const data = makeValidData({
      signatureSeller: 'data:image/png;base64,sig1',
      signatureBuyer: 'data:image/png;base64,sig2',
    });
    const html = renderSaleAgreement(data, { watermark: false });
    expect(html).toContain('data:image/png;base64,sig1');
    expect(html).toContain('data:image/png;base64,sig2');
  });
});

describe('Contract Sale - Draft Storage', () => {
  beforeEach(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('persian-tools.contract-sale.v1');
    }
  });

  it('saves and loads drafts', () => {
    const draft = {
      id: createDraftId(),
      data: makeValidData(),
      selectedPremiumClauses: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveDraft(draft);
    expect(loadDrafts()).toHaveLength(1);
  });

  it('updates existing draft', () => {
    const draft = {
      id: createDraftId(),
      data: makeValidData({ sellerName: 'نام اولیه' }),
      selectedPremiumClauses: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveDraft(draft);
    draft.data.sellerName = 'نام جدید';
    saveDraft(draft);
    expect(loadDrafts()[0]?.data.sellerName).toBe('نام جدید');
  });

  it('deletes draft', () => {
    const draft = {
      id: createDraftId(),
      data: makeValidData(),
      selectedPremiumClauses: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveDraft(draft);
    deleteDraft(draft.id);
    expect(loadDrafts()).toHaveLength(0);
  });

  it('tracks draft count', () => {
    expect(getDraftCount()).toBe(0);
    saveDraft({
      id: createDraftId(),
      data: makeValidData(),
      selectedPremiumClauses: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    expect(getDraftCount()).toBe(1);
  });

  it('canSaveDraft returns true when under limit', () => {
    expect(canSaveDraft()).toBe(true);
  });
});
