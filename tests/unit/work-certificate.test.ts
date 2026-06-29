import { describe, it, expect, beforeEach } from 'vitest';
import {
  validateCertificate,
  DISCLAIMER,
  PRIVACY_TEXT,
  WATERMARK_TEXT,
} from '@/lib/work-certificate/types';
import {
  CERTIFICATE_TEMPLATES,
  FEATURE_GATES,
  FREE_TEMPLATES,
} from '@/lib/work-certificate/schemas';
import {
  toPersianDigits,
  formatDate,
  formatDateEn,
  createCertificateId,
  getCurrentDate,
} from '@/lib/work-certificate/calculations';
import { CERTIFICATE_THEMES, getCertificateThemeById } from '@/lib/work-certificate/themes';
import { renderCertificate } from '@/lib/work-certificate/render';
import {
  saveDraft,
  loadDrafts,
  deleteDraft,
  getDraftCount,
  canSaveDraft,
  createDraftId,
} from '@/lib/work-certificate/draft-storage';
import type { WorkCertificateData } from '@/lib/work-certificate/types';

function makeValidData(overrides?: Partial<WorkCertificateData>): WorkCertificateData {
  return {
    employeeName: 'علی محمدی',
    nationalId: '۱۲۳۴۵۶۷۸۹۰',
    position: 'کارشناس فناوری اطلاعات',
    department: 'فناوری اطلاعات',
    employerName: 'شرکت داده‌پرداز',
    employerRegistrationNo: '۱۲۳۴۵۶',
    startDate: '2020-01-01',
    endDate: '2024-12-31',
    isCurrent: false,
    salary: '۵۰۰۰۰۰۰۰۰',
    reasonForLeaving: 'اتمام قرارداد',
    description: 'توضیحات اضافی',
    issuerName: 'سارا احمدی',
    issuerPosition: 'مدیر منابع انسانی',
    certificateDate: '2024-12-31',
    templateId: 'formal',
    logoDataUrl: '',
    signatureDataUrl: '',
    ...overrides,
  };
}

describe('Work Certificate - Types & Validation', () => {
  it('accepts valid data', () => {
    const data = makeValidData();
    expect(validateCertificate(data)).toEqual([]);
  });

  it('rejects missing employeeName', () => {
    const data = makeValidData({ employeeName: '' });
    expect(validateCertificate(data)).toContain('نام کارمند الزامی است');
  });

  it('rejects missing position', () => {
    const data = makeValidData({ position: '' });
    expect(validateCertificate(data)).toContain('سمت شغلی الزامی است');
  });

  it('rejects missing employerName', () => {
    const data = makeValidData({ employerName: '' });
    expect(validateCertificate(data)).toContain('نام کارفرما / شرکت الزامی است');
  });

  it('rejects missing issuerName', () => {
    const data = makeValidData({ issuerName: '' });
    expect(validateCertificate(data)).toContain('نام صادرکننده الزامی است');
  });

  it('rejects missing issuerPosition', () => {
    const data = makeValidData({ issuerPosition: '' });
    expect(validateCertificate(data)).toContain('سمت صادرکننده الزامی است');
  });

  it('rejects missing certificateDate', () => {
    const data = makeValidData({ certificateDate: '' });
    expect(validateCertificate(data)).toContain('تاریخ صدور گواهی الزامی است');
  });

  it('rejects missing startDate', () => {
    const data = makeValidData({ startDate: '' });
    expect(validateCertificate(data)).toContain('تاریخ شروع الزامی است');
  });

  it('returns all missing required fields', () => {
    const data = makeValidData({
      employeeName: '',
      position: '',
      employerName: '',
      startDate: '',
      issuerName: '',
      issuerPosition: '',
      certificateDate: '',
    });
    const errors = validateCertificate(data);
    expect(errors.length).toBe(7);
  });

  it('has non-empty constants', () => {
    expect(DISCLAIMER.length).toBeGreaterThan(0);
    expect(PRIVACY_TEXT.length).toBeGreaterThan(0);
    expect(WATERMARK_TEXT.length).toBeGreaterThan(0);
  });
});

describe('Work Certificate - Schemas', () => {
  it('has 3 certificate templates', () => {
    expect(CERTIFICATE_TEMPLATES).toHaveLength(3);
  });

  it('templates have correct structure', () => {
    for (const tpl of CERTIFICATE_TEMPLATES) {
      expect(tpl.id).toBeTruthy();
      expect(tpl.title).toBeTruthy();
      expect(tpl.description).toBeTruthy();
      expect(typeof tpl.isRtl).toBe('boolean');
    }
  });

  it('free tier has formal template only', () => {
    const free = FEATURE_GATES.free;
    expect(free.availableTemplates).toEqual(['formal']);
    expect(free.hasWatermark).toBe(true);
    expect(free.canExportPdf).toBe(false);
    expect(free.canExportDocx).toBe(false);
    expect(free.canUseLogo).toBe(false);
    expect(free.canUseSignature).toBe(false);
    expect(free.maxDrafts).toBe(2);
  });

  it('premium tier has all templates and features', () => {
    const premium = FEATURE_GATES.premium;
    expect(premium.availableTemplates).toHaveLength(3);
    expect(premium.hasWatermark).toBe(false);
    expect(premium.canExportPdf).toBe(true);
    expect(premium.canExportDocx).toBe(true);
    expect(premium.canUseLogo).toBe(true);
    expect(premium.canUseSignature).toBe(true);
    expect(premium.maxDrafts).toBe(100);
  });

  it('free templates are formal only', () => {
    expect(FREE_TEMPLATES).toEqual(['formal']);
  });
});

describe('Work Certificate - Calculations', () => {
  it('toPersianDigits converts digits', () => {
    expect(toPersianDigits(123)).toBe('۱۲۳');
    expect(toPersianDigits('456')).toBe('۴۵۶');
    expect(toPersianDigits('')).toBe('');
  });

  it('formatDate formats date correctly', () => {
    const result = formatDate('2024-01-01');
    expect(result).toBeTruthy();
    expect(result).not.toContain('2024');
  });

  it('formatDateEn formats date in English', () => {
    const result = formatDateEn('2024-06-15');
    expect(result).toContain('2024');
    expect(result).toContain('Jun');
  });

  it('formatDateEn returns empty for empty input', () => {
    expect(formatDateEn('')).toBe('');
  });

  it('formatDate returns empty for empty input', () => {
    expect(formatDate('')).toBe('');
  });

  it('createCertificateId returns unique IDs', () => {
    const id1 = createCertificateId();
    const id2 = createCertificateId();
    expect(id1).not.toBe(id2);
    expect(id1).toContain('cert_');
  });

  it('getCurrentDate returns valid date', () => {
    const date = getCurrentDate();
    expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('Work Certificate - Themes', () => {
  it('has 3 themes', () => {
    expect(CERTIFICATE_THEMES).toHaveLength(3);
  });

  it('themes have required color properties', () => {
    for (const theme of CERTIFICATE_THEMES) {
      expect(theme.colors.primary).toBeTruthy();
      expect(theme.colors.secondary).toBeTruthy();
      expect(theme.colors.surface).toBeTruthy();
      expect(theme.colors.text).toBeTruthy();
      expect(theme.colors.seal).toBeTruthy();
    }
  });

  it('getCertificateThemeById returns matching theme', () => {
    const theme = getCertificateThemeById('modern');
    expect(theme.id).toBe('modern');
    expect(theme.name).toBe('مدرن');
  });

  it('getCertificateThemeById returns formal for unknown id', () => {
    const theme = getCertificateThemeById('unknown');
    expect(theme.id).toBe('formal');
  });
});

describe('Work Certificate - Render', () => {
  it('renders valid HTML', () => {
    const data = makeValidData();
    const html = renderCertificate(data, { watermark: true });
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('گواهی سابقه کار');
    expect(html).toContain('علی محمدی');
    expect(html).toContain('شرکت داده‌پرداز');
    expect(html).toContain(WATERMARK_TEXT);
  });

  it('renders without watermark when requested', () => {
    const data = makeValidData();
    const html = renderCertificate(data, { watermark: false });
    expect(html).not.toContain(WATERMARK_TEXT);
  });

  it('renders bilingual template', () => {
    const data = makeValidData({ templateId: 'bilingual' });
    const html = renderCertificate(data, { watermark: false });
    expect(html).toContain('Work Experience Certificate');
    expect(html).toContain('علی محمدی');
  });

  it('renders with logo', () => {
    const data = makeValidData({ logoDataUrl: 'data:image/png;base64,test' });
    const html = renderCertificate(data, { watermark: false });
    expect(html).toContain('data:image/png;base64,test');
  });

  it('renders modern template', () => {
    const data = makeValidData({ templateId: 'modern' });
    const html = renderCertificate(data, { watermark: false, templateId: 'modern' });
    expect(html).toContain('گواهی سابقه کار');
  });

  it('includes disclaimer', () => {
    const data = makeValidData();
    const html = renderCertificate(data, { watermark: false });
    expect(html).toContain(DISCLAIMER);
  });
});

describe('Work Certificate - Draft Storage', () => {
  beforeEach(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('persian-tools.work-certificate.v1');
    }
  });

  it('saves and loads drafts', () => {
    const draft = {
      id: createDraftId(),
      data: makeValidData(),
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
      data: makeValidData({ employeeName: 'نام اولیه' }),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveDraft(draft);
    draft.data.employeeName = 'نام به‌روز';
    saveDraft(draft);
    const drafts = loadDrafts();
    expect(drafts).toHaveLength(1);
    expect(drafts[0]?.data.employeeName).toBe('نام به‌روز');
  });

  it('deletes draft', () => {
    const draft = {
      id: createDraftId(),
      data: makeValidData(),
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const draft2 = {
      id: createDraftId(),
      data: makeValidData(),
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
