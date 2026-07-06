import { describe, it, expect, beforeEach } from 'vitest';
import {
  validateLease,
  DISCLAIMER,
  PRIVACY_TEXT,
  WATERMARK_TEXT,
} from '@/lib/contract-lease/types';
import type { LeaseData } from '@/lib/contract-lease/types';
import { LEASE_TEMPLATES, FEATURE_GATES, FREE_TEMPLATES } from '@/lib/contract-lease/schemas';
import {
  toPersianDigits,
  formatDate,
  createLeaseId,
  getCurrentDate,
} from '@/lib/contract-lease/calculations';
import { STANDARD_CLAUSES, PREMIUM_CLAUSES } from '@/lib/contract-lease/clauses';
import { renderLease } from '@/lib/contract-lease/render';
import {
  saveDraft,
  loadDrafts,
  deleteDraft,
  getDraftCount,
  canSaveDraft,
  createDraftId,
} from '@/lib/contract-lease/draft-storage';

function makeValidData(overrides?: Partial<LeaseData>): LeaseData {
  return {
    landlordName: 'رضا محمدی',
    landlordNationalId: '۱۲۳۴۵۶۷۸۹۰',
    landlordPhone: '۰۹۱۲۱۲۳۴۵۶۷',
    landlordAddress: 'تهران، خیابان ولیعصر',
    tenantName: 'سارا احمدی',
    tenantNationalId: '۰۹۸۷۶۵۴۳۲۱',
    tenantPhone: '۰۹۱۹۸۷۶۵۴۳۲',
    tenantAddress: 'تهران، خیابان انقلاب',
    propertyAddress: 'تهران، خیابان آزادی، پلاک ۱۲۳',
    propertyPostalCode: '۱۲۳۴۵۶۷۸۹۰',
    propertyArea: '۸۰',
    propertyDeedType: 'مالکیت',
    propertyFloor: 'سوم',
    propertyUnit: '۷',
    propertyUtilities: 'آب، برق، گاز',
    propertyFixtures: 'کولر، آشپزخانه',
    startDate: '2024-07-01',
    endDate: '2025-06-30',
    deliveryDate: '2024-06-30',
    depositAmount: '۲۰۰۰۰۰۰۰۰',
    monthlyRent: '۱۵۰۰۰۰۰۰',
    paymentDay: 'پنجم هر ماه',
    paymentMethod: 'واریز بانکی',
    utilityCosts: 'بر عهده مستأجر',
    municipalCharges: 'بر عهده مالک',
    taxFees: '',
    subleasePermission: 'ممنوع',
    latePaymentPenalty: '۰.۱٪ روزانه',
    lateVacatePenalty: '۲ برابر اجاره روزانه',
    templateId: 'standard',
    additionalClauses: [],
    description: '',
    witness1: 'احمد کریمی',
    witness2: 'مریم حسینی',
    landlordSignature: '',
    tenantSignature: '',
    ...overrides,
  };
}

describe('Contract Lease - Types & Validation', () => {
  it('accepts valid data', () => {
    const data = makeValidData();
    expect(validateLease(data)).toEqual([]);
  });

  it('rejects missing landlordName', () => {
    const data = makeValidData({ landlordName: '' });
    expect(validateLease(data)).toContain('نام موجر الزامی است');
  });

  it('rejects missing landlordNationalId', () => {
    const data = makeValidData({ landlordNationalId: '' });
    expect(validateLease(data)).toContain('کد ملی موجر الزامی است');
  });

  it('rejects missing tenantName', () => {
    const data = makeValidData({ tenantName: '' });
    expect(validateLease(data)).toContain('نام مستأجر الزامی است');
  });

  it('rejects missing propertyAddress', () => {
    const data = makeValidData({ propertyAddress: '' });
    expect(validateLease(data)).toContain('آدرس ملک الزامی است');
  });

  it('rejects missing depositAmount', () => {
    const data = makeValidData({ depositAmount: '' });
    expect(validateLease(data)).toContain('مبلغ ودیعه الزامی است');
  });

  it('rejects missing monthlyRent', () => {
    const data = makeValidData({ monthlyRent: '' });
    expect(validateLease(data)).toContain('اجاره ماهانه الزامی است');
  });

  it('rejects missing startDate', () => {
    const data = makeValidData({ startDate: '' });
    expect(validateLease(data)).toContain('تاریخ شروع الزامی است');
  });

  it('rejects missing endDate', () => {
    const data = makeValidData({ endDate: '' });
    expect(validateLease(data)).toContain('تاریخ پایان الزامی است');
  });

  it('rejects missing deliveryDate', () => {
    const data = makeValidData({ deliveryDate: '' });
    expect(validateLease(data)).toContain('تاریخ تحویل الزامی است');
  });

  it('returns all missing required fields', () => {
    const data = makeValidData({
      landlordName: '',
      landlordNationalId: '',
      landlordPhone: '',
      tenantName: '',
      tenantNationalId: '',
      tenantPhone: '',
      propertyAddress: '',
      propertyArea: '',
      startDate: '',
      endDate: '',
      deliveryDate: '',
      depositAmount: '',
      monthlyRent: '',
      paymentDay: '',
      paymentMethod: '',
    });
    expect(validateLease(data)).toHaveLength(15);
  });

  it('has non-empty constants', () => {
    expect(DISCLAIMER.length).toBeGreaterThan(0);
    expect(PRIVACY_TEXT.length).toBeGreaterThan(0);
    expect(WATERMARK_TEXT.length).toBeGreaterThan(0);
  });
});

describe('Contract Lease - Schemas', () => {
  it('has 2 lease templates', () => {
    expect(LEASE_TEMPLATES).toHaveLength(2);
  });

  it('templates have correct structure', () => {
    for (const tpl of LEASE_TEMPLATES) {
      expect(tpl.id).toBeTruthy();
      expect(tpl.title).toBeTruthy();
      expect(tpl.description).toBeTruthy();
    }
  });

  it('free tier has standard template only', () => {
    const free = FEATURE_GATES.free;
    expect(free.availableTemplates).toEqual(['standard']);
    expect(free.hasWatermark).toBe(true);
    expect(free.canExportPdf).toBe(false);
    expect(free.canExportDocx).toBe(false);
    expect(free.canAddCustomClauses).toBe(false);
    expect(free.canUseSignature).toBe(false);
    expect(free.maxDrafts).toBe(2);
  });

  it('premium tier has all templates and features', () => {
    const premium = FEATURE_GATES.premium;
    expect(premium.availableTemplates).toHaveLength(2);
    expect(premium.hasWatermark).toBe(false);
    expect(premium.canExportPdf).toBe(true);
    expect(premium.canExportDocx).toBe(true);
    expect(premium.canAddCustomClauses).toBe(true);
    expect(premium.canUseSignature).toBe(true);
    expect(premium.maxDrafts).toBe(100);
  });

  it('free templates are standard only', () => {
    expect(FREE_TEMPLATES).toEqual(['standard']);
  });
});

describe('Contract Lease - Calculations', () => {
  it('toPersianDigits converts digits', () => {
    expect(toPersianDigits(123)).toBe('۱۲۳');
    expect(toPersianDigits('456')).toBe('۴۵۶');
    expect(toPersianDigits('')).toBe('');
  });

  it('formatDate formats date correctly', () => {
    const result = formatDate('2024-07-01');
    expect(result).toBeTruthy();
    expect(result).not.toContain('2024');
  });

  it('formatDate returns empty for empty input', () => {
    expect(formatDate('')).toBe('');
  });

  it('createLeaseId returns unique IDs', () => {
    const id1 = createLeaseId();
    const id2 = createLeaseId();
    expect(id1).not.toBe(id2);
    expect(id1).toContain('lse_');
  });

  it('getCurrentDate returns valid date', () => {
    const date = getCurrentDate();
    expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('Contract Lease - Clauses', () => {
  it('has 6 standard clauses', () => {
    expect(STANDARD_CLAUSES).toHaveLength(6);
  });

  it('has 6 premium clauses', () => {
    expect(PREMIUM_CLAUSES).toHaveLength(6);
  });

  it('standard clauses are default enabled', () => {
    for (const c of STANDARD_CLAUSES) {
      expect(c.defaultEnabled).toBe(true);
    }
  });

  it('premium clauses are not default enabled', () => {
    for (const c of PREMIUM_CLAUSES) {
      expect(c.defaultEnabled).toBe(false);
    }
  });

  it('has pet policy clause', () => {
    const clause = PREMIUM_CLAUSES.find((c) => c.id === 'pet-policy');
    expect(clause).toBeTruthy();
    expect(clause?.title).toBe('نگهداری حیوان خانگی');
  });
});

describe('Contract Lease - Render', () => {
  it('renders valid HTML', () => {
    const data = makeValidData();
    const html = renderLease(data, { watermark: true });
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('اجاره‌نامه');
    expect(html).toContain('رضا محمدی');
    expect(html).toContain('سارا احمدی');
    expect(html).toContain(WATERMARK_TEXT);
  });

  it('renders without watermark when requested', () => {
    const data = makeValidData();
    const html = renderLease(data, { watermark: false });
    expect(html).not.toContain(WATERMARK_TEXT);
  });

  it('includes property and financial details', () => {
    const data = makeValidData();
    const html = renderLease(data, { watermark: false });
    expect(html).toContain('۸۰ متر مربع');
    expect(html).toContain('۲۰۰۰۰۰۰۰۰');
    expect(html).toContain('پنجم هر ماه');
  });

  it('includes optional property fields when present', () => {
    const data = makeValidData();
    const html = renderLease(data, { watermark: false });
    expect(html).toContain('طبقه');
    expect(html).toContain('واحد');
    expect(html).toContain('انشعابات');
    expect(html).toContain('لوازم');
  });

  it('includes witnesses when provided', () => {
    const data = makeValidData();
    const html = renderLease(data, { watermark: false });
    expect(html).toContain('احمد کریمی');
    expect(html).toContain('مریم حسینی');
  });

  it('renders without optional fields when absent', () => {
    const data = makeValidData({
      propertyFloor: '',
      propertyUnit: '',
      propertyUtilities: '',
      propertyFixtures: '',
      witness1: '',
      witness2: '',
      taxFees: '',
    });
    const html = renderLease(data, { watermark: false });
    expect(html).not.toContain('شاهد اول');
    expect(html).not.toContain('شاهد دوم');
  });

  it('renders with premium clauses', () => {
    const data = makeValidData();
    const html = renderLease(data, { watermark: false, premiumClauses: ['pet-policy', 'parking'] });
    expect(html).toContain('نگهداری حیوان خانگی');
    expect(html).toContain('پارکینگ');
  });

  it('renders with additional custom clauses', () => {
    const data = makeValidData({ additionalClauses: ['شرط سفارشی'] });
    const html = renderLease(data, { watermark: false });
    expect(html).toContain('شرط سفارشی');
  });

  it('includes disclaimer', () => {
    const data = makeValidData();
    const html = renderLease(data, { watermark: false });
    expect(html).toContain(DISCLAIMER);
  });

  it('includes contract number', () => {
    const data = makeValidData();
    const html = renderLease(data, { watermark: false });
    expect(html).toContain('RL-');
  });

  it('renders comprehensive template', () => {
    const data = makeValidData({ templateId: 'comprehensive' });
    const html = renderLease(data, { watermark: false });
    expect(html).toContain('اجاره‌نامه');
  });
});

describe('Contract Lease - Draft Storage', () => {
  beforeEach(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('persian-tools.contract-lease.v1');
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
    const drafts = loadDrafts();
    expect(drafts).toHaveLength(1);
    expect(drafts[0]?.id).toBe(draft.id);
  });

  it('updates existing draft', () => {
    const draft = {
      id: createDraftId(),
      data: makeValidData({ landlordName: 'نام اولیه' }),
      selectedPremiumClauses: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveDraft(draft);
    draft.data.landlordName = 'نام به‌روز';
    saveDraft(draft);
    const drafts = loadDrafts();
    expect(drafts).toHaveLength(1);
    expect(drafts[0]?.data.landlordName).toBe('نام به‌روز');
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
    const draft1 = {
      id: createDraftId(),
      data: makeValidData(),
      selectedPremiumClauses: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const draft2 = {
      id: createDraftId(),
      data: makeValidData(),
      selectedPremiumClauses: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    expect(getDraftCount()).toBe(0);
    saveDraft(draft1);
    expect(getDraftCount()).toBe(1);
    saveDraft(draft2);
    expect(getDraftCount()).toBe(2);
  });

  it('canSaveDraft returns true when under limit', () => {
    expect(canSaveDraft()).toBe(true);
  });
});
