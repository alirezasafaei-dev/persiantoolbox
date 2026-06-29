import { describe, it, expect, beforeEach } from 'vitest';
import {
  validateEmployment,
  DISCLAIMER,
  PRIVACY_TEXT,
  WATERMARK_TEXT,
  getDefaultBenefits,
} from '@/lib/business-employment/types';
import {
  EMPLOYMENT_TEMPLATES,
  FEATURE_GATES,
  FREE_TEMPLATES,
} from '@/lib/business-employment/schemas';
import {
  toPersianDigits,
  formatDate,
  createEmploymentId,
  getCurrentDate,
  calculateMonthlySalary,
} from '@/lib/business-employment/calculations';
import { STANDARD_CLAUSES, PREMIUM_CLAUSES } from '@/lib/business-employment/clauses';
import { EMPLOYMENT_THEMES, getEmploymentThemeById } from '@/lib/business-employment/themes';
import { renderEmployment } from '@/lib/business-employment/render';
import {
  saveDraft,
  loadDrafts,
  deleteDraft,
  getDraftCount,
  canSaveDraft,
  createDraftId,
} from '@/lib/business-employment/draft-storage';
import type { EmploymentData } from '@/lib/business-employment/types';

function makeValidData(overrides?: Partial<EmploymentData>): EmploymentData {
  return {
    employerName: 'شرکت فناوری نوین',
    employerNationalId: '۱۲۳۴۵۶۷۸۹۰',
    employerPhone: '۰۲۱۱۲۳۴۵۶۷۸',
    employerAddress: 'تهران، خیابان ولیعصر، خیابان مطهری',
    employerEconomicCode: '۱۲۳۴۵۶۷۸۹۰۱',
    employeeName: 'علی محمدی',
    employeeNationalId: '۰۹۸۷۶۵۴۳۲۱',
    employeePhone: '۰۹۱۲۱۲۳۴۵۶۷',
    employeeAddress: 'تهران، خیابان انقلاب',
    employeeFatherName: 'حسین',
    employeeBirthDate: '1990-05-15',
    jobTitle: 'کارشناس فناوری اطلاعات',
    department: 'فناوری اطلاعات',
    workplace: 'دفتر مرکزی تهران',
    startDate: '2024-01-01',
    endDate: '2026-12-31',
    contractType: 'fixed-term',
    probationaryPeriod: 'سه ماه',
    baseSalary: '۱۰۰۰۰۰۰۰۰',
    housingAllowance: '۱۰۰۰۰۰۰۰',
    foodAllowance: '۵۰۰۰۰۰۰',
    transportation: '۳۰۰۰۰۰۰',
    overtimeRate: '۱.۴ برابر',
    bonus: 'بر اساس عملکرد سالانه',
    insuranceType: 'تأمین اجتماعی',
    dailyWorkingHours: '۸',
    weeklyDaysOff: 'پنجشنبه و جمعه',
    annualLeave: '۳۰ روز',
    sickLeave: '۱۵ روز',
    templateId: 'standard',
    additionalClauses: [],
    description: 'این قرارداد بین طرفین امضا می‌گردد',
    employerSignature: '',
    employeeSignature: '',
    ...overrides,
  };
}

describe('Business Employment - Types & Validation', () => {
  it('accepts valid data', () => {
    const data = makeValidData();
    expect(validateEmployment(data)).toEqual([]);
  });

  it('rejects missing employerName', () => {
    const data = makeValidData({ employerName: '' });
    expect(validateEmployment(data)).toContain('نام کارفرما الزامی است');
  });

  it('rejects missing employerNationalId', () => {
    const data = makeValidData({ employerNationalId: '' });
    expect(validateEmployment(data)).toContain('کد ملی / شماره ثبت کارفرما الزامی است');
  });

  it('rejects missing employeeName', () => {
    const data = makeValidData({ employeeName: '' });
    expect(validateEmployment(data)).toContain('نام کارمند الزامی است');
  });

  it('rejects missing employeeNationalId', () => {
    const data = makeValidData({ employeeNationalId: '' });
    expect(validateEmployment(data)).toContain('کد ملی کارمند الزامی است');
  });

  it('rejects missing jobTitle', () => {
    const data = makeValidData({ jobTitle: '' });
    expect(validateEmployment(data)).toContain('عنوان شغلی الزامی است');
  });

  it('rejects missing workplace', () => {
    const data = makeValidData({ workplace: '' });
    expect(validateEmployment(data)).toContain('محل کار الزامی است');
  });

  it('rejects missing startDate', () => {
    const data = makeValidData({ startDate: '' });
    expect(validateEmployment(data)).toContain('تاریخ شروع کار الزامی است');
  });

  it('rejects missing baseSalary', () => {
    const data = makeValidData({ baseSalary: '' });
    expect(validateEmployment(data)).toContain('حقوق پایه الزامی است');
  });

  it('rejects missing insuranceType', () => {
    const data = makeValidData({ insuranceType: '' });
    expect(validateEmployment(data)).toContain('نوع بیمه الزامی است');
  });

  it('rejects missing dailyWorkingHours', () => {
    const data = makeValidData({ dailyWorkingHours: '' });
    expect(validateEmployment(data)).toContain('ساعت کار روزانه الزامی است');
  });

  it('rejects missing weeklyDaysOff', () => {
    const data = makeValidData({ weeklyDaysOff: '' });
    expect(validateEmployment(data)).toContain('روزهای تعطیل هفتگی الزامی است');
  });

  it('rejects missing annualLeave', () => {
    const data = makeValidData({ annualLeave: '' });
    expect(validateEmployment(data)).toContain('مرخصی سالانه الزامی است');
  });

  it('returns all missing required fields', () => {
    const data = makeValidData({
      employerName: '',
      employerNationalId: '',
      employerPhone: '',
      employeeName: '',
      employeeNationalId: '',
      employeePhone: '',
      jobTitle: '',
      workplace: '',
      startDate: '',
      baseSalary: '',
      insuranceType: '',
      dailyWorkingHours: '',
      weeklyDaysOff: '',
      annualLeave: '',
    });
    const errors = validateEmployment(data);
    expect(errors.length).toBe(14);
  });

  it('has non-empty constants', () => {
    expect(DISCLAIMER.length).toBeGreaterThan(0);
    expect(PRIVACY_TEXT.length).toBeGreaterThan(0);
    expect(WATERMARK_TEXT.length).toBeGreaterThan(0);
  });

  it('getDefaultBenefits returns list', () => {
    const benefits = getDefaultBenefits();
    expect(benefits).toContain('بیمه تأمین اجتماعی');
    expect(benefits.length).toBeGreaterThanOrEqual(4);
  });
});

describe('Business Employment - Schemas', () => {
  it('has 2 employment templates', () => {
    expect(EMPLOYMENT_TEMPLATES).toHaveLength(2);
  });

  it('templates have correct structure', () => {
    for (const tpl of EMPLOYMENT_TEMPLATES) {
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

describe('Business Employment - Calculations', () => {
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

  it('formatDate returns empty for empty input', () => {
    expect(formatDate('')).toBe('');
  });

  it('createEmploymentId returns unique IDs', () => {
    const id1 = createEmploymentId();
    const id2 = createEmploymentId();
    expect(id1).not.toBe(id2);
    expect(id1).toContain('emp_');
  });

  it('getCurrentDate returns valid date', () => {
    const date = getCurrentDate();
    expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('calculateMonthlySalary sums base and allowances', () => {
    const result = calculateMonthlySalary('۱۰۰۰۰۰۰۰۰', [10000000, 5000000]);
    expect(result).toBe('115000000');
  });

  it('calculateMonthlySalary handles nonzero input', () => {
    const result = calculateMonthlySalary('۵۰۰۰۰۰۰۰', []);
    expect(result).toBe('50000000');
  });
});

describe('Business Employment - Clauses', () => {
  it('has 7 standard clauses', () => {
    expect(STANDARD_CLAUSES).toHaveLength(7);
  });

  it('has 6 premium clauses', () => {
    expect(PREMIUM_CLAUSES).toHaveLength(6);
  });

  it('standard clauses are default enabled', () => {
    for (const c of STANDARD_CLAUSES) {
      expect(c.defaultEnabled).toBe(true);
      expect(c.id).toBeTruthy();
      expect(c.title).toBeTruthy();
      expect(c.text).toBeTruthy();
    }
  });

  it('premium clauses are not default enabled', () => {
    for (const c of PREMIUM_CLAUSES) {
      expect(c.defaultEnabled).toBe(false);
    }
  });

  it('non-compete clause exists', () => {
    expect(PREMIUM_CLAUSES.find((c) => c.id === 'non-compete')).toBeTruthy();
  });

  it('confidentiality clause exists', () => {
    expect(PREMIUM_CLAUSES.find((c) => c.id === 'confidentiality')).toBeTruthy();
  });
});

describe('Business Employment - Themes', () => {
  it('has 2 themes', () => {
    expect(EMPLOYMENT_THEMES).toHaveLength(2);
  });

  it('themes have required color properties', () => {
    for (const theme of EMPLOYMENT_THEMES) {
      expect(theme.colors.primary).toBeTruthy();
      expect(theme.colors.secondary).toBeTruthy();
      expect(theme.colors.surface).toBeTruthy();
      expect(theme.colors.text).toBeTruthy();
    }
  });

  it('getEmploymentThemeById returns matching theme', () => {
    const theme = getEmploymentThemeById('comprehensive');
    expect(theme.id).toBe('comprehensive');
  });

  it('getEmploymentThemeById returns standard for unknown id', () => {
    const theme = getEmploymentThemeById('unknown');
    expect(theme.id).toBe('standard');
  });
});

describe('Business Employment - Render', () => {
  it('renders valid HTML', () => {
    const data = makeValidData();
    const html = renderEmployment(data, { watermark: true });
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('قرارداد کار');
    expect(html).toContain('علی محمدی');
    expect(html).toContain('شرکت فناوری نوین');
    expect(html).toContain(WATERMARK_TEXT);
  });

  it('renders without watermark when requested', () => {
    const data = makeValidData();
    const html = renderEmployment(data, { watermark: false });
    expect(html).not.toContain(WATERMARK_TEXT);
  });

  it('includes employment details', () => {
    const data = makeValidData();
    const html = renderEmployment(data, { watermark: false });
    expect(html).toContain('کارشناس فناوری اطلاعات');
    expect(html).toContain('۱۰۰۰۰۰۰۰۰');
    expect(html).toContain('تأمین اجتماعی');
    expect(html).toContain('۳۰ روز');
  });

  it('renders optional fields when present', () => {
    const data = makeValidData();
    const html = renderEmployment(data, { watermark: false });
    expect(html).toContain('حق مسکن');
    expect(html).toContain('حق تغذیه');
    expect(html).toContain('نام پدر');
    expect(html).toContain('دوره آزمایشی');
  });

  it('renders without optional fields when absent', () => {
    const data = makeValidData({
      employeeFatherName: '',
      probationaryPeriod: '',
      housingAllowance: '',
      foodAllowance: '',
    });
    const html = renderEmployment(data, { watermark: false });
    expect(html).not.toContain('نام پدر:');
    expect(html).not.toContain('حق مسکن:');
    expect(html).not.toContain('حق تغذیه:');
  });

  it('renders with premium clauses', () => {
    const data = makeValidData();
    const html = renderEmployment(data, {
      watermark: false,
      premiumClauses: ['non-compete', 'confidentiality'],
    });
    expect(html).toContain('عدم رقابت');
    expect(html).toContain('محرمانگی');
  });

  it('renders with additional custom clauses', () => {
    const data = makeValidData({ additionalClauses: ['شرط سفارشی'] });
    const html = renderEmployment(data, { watermark: false });
    expect(html).toContain('شرط سفارشی');
  });

  it('includes disclaimer', () => {
    const data = makeValidData();
    const html = renderEmployment(data, { watermark: false });
    expect(html).toContain(DISCLAIMER);
  });

  it('includes contract number', () => {
    const data = makeValidData();
    const html = renderEmployment(data, { watermark: false });
    expect(html).toContain('EC-');
  });

  it('renders comprehensive template with description', () => {
    const data = makeValidData({ templateId: 'comprehensive', description: 'توضیحات تکمیلی' });
    const html = renderEmployment(data, { watermark: false });
    expect(html).toContain('قرارداد کار');
    expect(html).toContain('توضیحات تکمیلی');
  });
});

describe('Business Employment - Draft Storage', () => {
  beforeEach(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('persian-tools.business-employment.v1');
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
      data: makeValidData({ employeeName: 'نام اولیه' }),
      selectedPremiumClauses: [],
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
