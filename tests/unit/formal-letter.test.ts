import { describe, it, expect, beforeEach } from 'vitest';
import {
  validateLetter,
  DISCLAIMER,
  PRIVACY_TEXT,
  WATERMARK_TEXT,
  LETTER_TYPE_LABELS,
  FREE_BODY_LIMIT,
  getSalutationForRecipient,
  getDefaultClosing,
  getDefaultSalutation,
} from '@/lib/formal-letter/types';
import type { FormalLetterData, LetterType } from '@/lib/formal-letter/types';
import { LETTER_TEMPLATES, FEATURE_GATES, FREE_TEMPLATES } from '@/lib/formal-letter/schemas';
import {
  toPersianDigits,
  formatDate,
  createLetterId,
  getCurrentDate,
  countWords,
  countChars,
} from '@/lib/formal-letter/calculations';
import { STANDARD_PARAGRAPHS, PREMIUM_PARAGRAPHS } from '@/lib/formal-letter/paragraphs';
import { renderLetter } from '@/lib/formal-letter/render';
import {
  saveDraft,
  loadDrafts,
  deleteDraft,
  getDraftCount,
  canSaveDraft,
  createDraftId,
} from '@/lib/formal-letter/draft-storage';

function makeValidData(overrides?: Partial<FormalLetterData>): FormalLetterData {
  return {
    senderName: 'علی محمدی',
    senderPosition: 'مدیر فناوری اطلاعات',
    senderOrganization: 'شرکت فناوری نوین',
    senderPhone: '۰۲۱۱۲۳۴۵۶۷۸',
    senderAddress: 'تهران، خیابان ولیعصر',
    recipientName: 'دکتر احمدی',
    recipientPosition: 'مدیر عامل',
    recipientOrganization: 'شرکت همکار',
    recipientAddress: 'تهران، خیابان انقلاب',
    letterType: 'request',
    subject: 'درخواست همکاری',
    salutation: 'با سلام و احترام',
    body: 'این نامه به منظور درخواست همکاری ارسال می‌گردد.',
    closing: 'با تشکر و قدردانی',
    referenceNumber: '۱۲۳/۴۵۶',
    letterDate: '2024-01-15',
    enclosures: 'مدارک هویتی',
    ccList: 'مدیر مالی',
    templateId: 'formal',
    additionalParagraphs: [],
    signatureDataUrl: '',
    ...overrides,
  };
}

describe('Formal Letter - Types & Validation', () => {
  it('accepts valid data', () => {
    const data = makeValidData();
    expect(validateLetter(data)).toEqual([]);
  });

  it('rejects missing senderName', () => {
    const data = makeValidData({ senderName: '' });
    expect(validateLetter(data)).toContain('نام فرستنده الزامی است');
  });

  it('rejects missing recipientName', () => {
    const data = makeValidData({ recipientName: '' });
    expect(validateLetter(data)).toContain('نام گیرنده الزامی است');
  });

  it('rejects missing subject', () => {
    const data = makeValidData({ subject: '' });
    expect(validateLetter(data)).toContain('موضوع نامه الزامی است');
  });

  it('rejects missing salutation', () => {
    const data = makeValidData({ salutation: '' });
    expect(validateLetter(data)).toContain('متن سلام و احترام الزامی است');
  });

  it('rejects missing body', () => {
    const data = makeValidData({ body: '' });
    expect(validateLetter(data)).toContain('متن نامه الزامی است');
  });

  it('rejects missing closing', () => {
    const data = makeValidData({ closing: '' });
    expect(validateLetter(data)).toContain('متن پایانی الزامی است');
  });

  it('rejects missing letterDate', () => {
    const data = makeValidData({ letterDate: '' });
    expect(validateLetter(data)).toContain('تاریخ نامه الزامی است');
  });

  it('returns all missing required fields', () => {
    const data = makeValidData({
      senderName: '',
      recipientName: '',
      subject: '',
      salutation: '',
      body: '',
      closing: '',
      letterDate: '',
    });
    const errors = validateLetter(data);
    expect(errors.length).toBe(7);
  });

  it('has non-empty constants', () => {
    expect(DISCLAIMER.length).toBeGreaterThan(0);
    expect(PRIVACY_TEXT.length).toBeGreaterThan(0);
    expect(WATERMARK_TEXT.length).toBeGreaterThan(0);
  });

  it('has all letter type labels', () => {
    const types: LetterType[] = [
      'request',
      'complaint',
      'inquiry',
      'introduction',
      'notification',
      'cover-letter',
    ];
    for (const t of types) {
      expect(LETTER_TYPE_LABELS[t]).toBeTruthy();
    }
  });

  it('has FREE_BODY_LIMIT', () => {
    expect(FREE_BODY_LIMIT).toBe(2000);
  });

  it('getDefaultSalutation returns greeting', () => {
    expect(getDefaultSalutation()).toBe('با سلام و احترام');
  });

  it('getDefaultClosing returns closing per type', () => {
    expect(getDefaultClosing('request')).toContain('سپاسگزاریم');
    expect(getDefaultClosing('complaint')).toContain('رسیدگی');
    expect(getDefaultClosing('cover-letter')).toContain('پیوست');
  });

  it('getSalutationForRecipient generates salutation', () => {
    const result = getSalutationForRecipient('رضا محمدی', 'مدیر');
    expect(result).toContain('رضا محمدی');
    expect(result).toContain('مدیر');
  });
});

describe('Formal Letter - Schemas', () => {
  it('has 2 letter templates', () => {
    expect(LETTER_TEMPLATES).toHaveLength(2);
  });

  it('templates have correct structure', () => {
    for (const tpl of LETTER_TEMPLATES) {
      expect(tpl.id).toBeTruthy();
      expect(tpl.title).toBeTruthy();
      expect(tpl.description).toBeTruthy();
    }
  });

  it('free tier has formal template only', () => {
    const free = FEATURE_GATES.free;
    expect(free.availableTemplates).toEqual(['formal']);
    expect(free.hasWatermark).toBe(true);
    expect(free.canExportPdf).toBe(false);
    expect(free.canExportDocx).toBe(false);
    expect(free.canAddCustomParagraphs).toBe(false);
    expect(free.canUseSignature).toBe(false);
    expect(free.maxDrafts).toBe(2);
    expect(free.maxBodyLength).toBe(2000);
  });

  it('premium tier has all templates and features', () => {
    const premium = FEATURE_GATES.premium;
    expect(premium.availableTemplates).toHaveLength(2);
    expect(premium.hasWatermark).toBe(false);
    expect(premium.canExportPdf).toBe(true);
    expect(premium.canExportDocx).toBe(true);
    expect(premium.canAddCustomParagraphs).toBe(true);
    expect(premium.canUseSignature).toBe(true);
    expect(premium.maxDrafts).toBe(100);
    expect(premium.maxBodyLength).toBe(10000);
  });

  it('free templates are formal only', () => {
    expect(FREE_TEMPLATES).toEqual(['formal']);
  });
});

describe('Formal Letter - Calculations', () => {
  it('toPersianDigits converts digits', () => {
    expect(toPersianDigits(123)).toBe('۱۲۳');
    expect(toPersianDigits('456')).toBe('۴۵۶');
    expect(toPersianDigits('')).toBe('');
  });

  it('formatDate formats date correctly', () => {
    const result = formatDate('2024-01-15');
    expect(result).toBeTruthy();
    expect(result).not.toContain('2024');
  });

  it('formatDate returns empty for empty input', () => {
    expect(formatDate('')).toBe('');
  });

  it('createLetterId returns unique IDs', () => {
    const id1 = createLetterId();
    const id2 = createLetterId();
    expect(id1).not.toBe(id2);
    expect(id1).toContain('ltr_');
  });

  it('getCurrentDate returns valid date', () => {
    const date = getCurrentDate();
    expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('countWords counts correctly', () => {
    expect(countWords('سلام این یک متن تستی است')).toBe(6);
    expect(countWords('')).toBe(0);
  });

  it('countChars counts without whitespace', () => {
    expect(countChars('سلام دنیا')).toBe(8);
    expect(countChars('')).toBe(0);
  });
});

describe('Formal Letter - Paragraphs', () => {
  it('has 5 standard paragraphs', () => {
    expect(STANDARD_PARAGRAPHS).toHaveLength(5);
  });

  it('has 5 premium paragraphs', () => {
    expect(PREMIUM_PARAGRAPHS).toHaveLength(5);
  });

  it('standard paragraphs are default enabled', () => {
    for (const p of STANDARD_PARAGRAPHS) {
      expect(p.defaultEnabled).toBe(true);
      expect(p.id).toBeTruthy();
      expect(p.title).toBeTruthy();
      expect(p.text).toBeTruthy();
    }
  });

  it('premium paragraphs are not default enabled', () => {
    for (const p of PREMIUM_PARAGRAPHS) {
      expect(p.defaultEnabled).toBe(false);
    }
  });

  it('paragraphs have applicableTypes', () => {
    for (const p of [...STANDARD_PARAGRAPHS, ...PREMIUM_PARAGRAPHS]) {
      expect(p.applicableTypes.length).toBeGreaterThan(0);
    }
  });
});

describe('Formal Letter - Render', () => {
  it('renders valid HTML', () => {
    const data = makeValidData();
    const html = renderLetter(data, { watermark: true });
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('درخواست همکاری');
    expect(html).toContain('علی محمدی');
    expect(html).toContain(WATERMARK_TEXT);
  });

  it('renders without watermark when requested', () => {
    const data = makeValidData();
    const html = renderLetter(data, { watermark: false });
    expect(html).not.toContain(WATERMARK_TEXT);
  });

  it('includes subject in output', () => {
    const data = makeValidData();
    const html = renderLetter(data, { watermark: false });
    expect(html).toContain('درخواست همکاری');
  });

  it('includes letter body', () => {
    const data = makeValidData();
    const html = renderLetter(data, { watermark: false });
    expect(html).toContain('این نامه به منظور درخواست همکاری ارسال می‌گردد');
  });

  it('includes sender and recipient info', () => {
    const data = makeValidData();
    const html = renderLetter(data, { watermark: false });
    expect(html).toContain('علی محمدی');
    expect(html).toContain('دکتر احمدی');
  });

  it('includes reference number', () => {
    const data = makeValidData();
    const html = renderLetter(data, { watermark: false });
    expect(html).toContain('۱۲۳/۴۵۶');
  });

  it('includes enclosures and cc', () => {
    const data = makeValidData();
    const html = renderLetter(data, { watermark: false });
    expect(html).toContain('مدارک هویتی');
    expect(html).toContain('مدیر مالی');
  });

  it('renders with premium paragraphs', () => {
    const data = makeValidData();
    const html = renderLetter(data, {
      watermark: false,
      premiumParagraphs: ['confidentiality', 'urgency'],
    });
    expect(html).toContain('اطلاعات محرمانه');
    expect(html).toContain('اسرع وقت');
  });

  it('renders with additional custom paragraphs', () => {
    const data = makeValidData({ additionalParagraphs: ['بند سفارشی'] });
    const html = renderLetter(data, { watermark: false });
    expect(html).toContain('بند سفارشی');
  });

  it('renders without optional fields when absent', () => {
    const data = makeValidData({
      senderPosition: '',
      senderOrganization: '',
      senderPhone: '',
      senderAddress: '',
      recipientPosition: '',
      recipientOrganization: '',
      recipientAddress: '',
      referenceNumber: '',
      enclosures: '',
      ccList: '',
    });
    const html = renderLetter(data, { watermark: false });
    expect(html).not.toContain('شماره نامه');
    expect(html).not.toContain('رونوشت');
  });

  it('includes disclaimer', () => {
    const data = makeValidData();
    const html = renderLetter(data, { watermark: false });
    expect(html).toContain(DISCLAIMER);
  });

  it('renders all letter types', () => {
    const types: LetterType[] = [
      'request',
      'complaint',
      'inquiry',
      'introduction',
      'notification',
      'cover-letter',
    ];
    for (const letterType of types) {
      const data = makeValidData({ letterType, body: `متن نامه ${letterType}` });
      const html = renderLetter(data, { watermark: false });
      expect(html).toContain(LETTER_TYPE_LABELS[letterType]);
    }
  });
});

describe('Formal Letter - Draft Storage', () => {
  beforeEach(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('persian-tools.formal-letter.v1');
    }
  });

  it('saves and loads drafts', () => {
    const draft = {
      id: createDraftId(),
      data: makeValidData(),
      selectedPremiumParagraphs: [],
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
      data: makeValidData({ senderName: 'نام اولیه' }),
      selectedPremiumParagraphs: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveDraft(draft);
    draft.data.senderName = 'نام به‌روز';
    saveDraft(draft);
    const drafts = loadDrafts();
    expect(drafts).toHaveLength(1);
    expect(drafts[0]?.data.senderName).toBe('نام به‌روز');
  });

  it('deletes draft', () => {
    const draft = {
      id: createDraftId(),
      data: makeValidData(),
      selectedPremiumParagraphs: [],
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
      selectedPremiumParagraphs: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const draft2 = {
      id: createDraftId(),
      data: makeValidData(),
      selectedPremiumParagraphs: [],
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
