import { describe, it, expect, beforeEach } from 'vitest';
import {
  toPersianDigits,
  formatDate,
  formatDateEn,
  generateResumeId,
  getDocumentTitle,
  createEmptyExperience,
  createEmptyEducation,
  createEmptySkill,
  createEmptyLanguage,
  createEmptyProject,
  createEmptyCertification,
} from '@/lib/career-documents/calculations';
import {
  validateProfile,
  validateExperiences,
  validateCoverLetter,
  DISCLAIMER,
  PRIVACY_TEXT,
  WATERMARK_TEXT,
} from '@/lib/career-documents/types';
import { DOCUMENT_TYPES, FEATURE_GATES, FREE_MAX_DRAFTS } from '@/lib/career-documents/schemas';
import { renderDocument } from '@/lib/career-documents/render';
import {
  saveDraft,
  loadDrafts,
  deleteDraft,
  canSaveDraft,
  createDraftId,
} from '@/lib/career-documents/draft-storage';
import { isDocxAvailable } from '@/lib/career-documents/export';
import type { ResumeDraft, ResumeExperience } from '@/lib/career-documents/types';

function makeDraft(overrides?: Partial<ResumeDraft>): ResumeDraft {
  return {
    id: 'test-draft-1',
    documentType: 'resume-fa',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    profile: { fullName: 'علی رضایی', email: 'ali@example.com', phone: '09121234567' },
    experiences: [],
    education: [],
    skills: [],
    languages: [],
    projects: [],
    certifications: [],
    templateId: 'persian-resume',
    ...overrides,
  };
}

describe('Career Documents - Calculations', () => {
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

  describe('formatDate', () => {
    it('formats date string to Persian', () => {
      const result = formatDate('2025-01-15');
      expect(result).toBeTruthy();
      expect(result).not.toBe('');
    });

    it('returns empty string for empty input', () => {
      expect(formatDate('')).toBe('');
    });
  });

  describe('formatDateEn', () => {
    it('formats date string to English', () => {
      const result = formatDateEn('2025-01-15');
      expect(result).toContain('2025');
    });

    it('returns empty string for empty input', () => {
      expect(formatDateEn('')).toBe('');
    });
  });

  describe('generateResumeId', () => {
    it('returns unique IDs starting with resume_', () => {
      const id1 = generateResumeId();
      const id2 = generateResumeId();
      expect(id1).toMatch(/^resume_/);
      expect(id2).toMatch(/^resume_/);
      expect(id1).not.toBe(id2);
    });
  });

  describe('getDocumentTitle', () => {
    it('returns correct Persian title for resume-fa', () => {
      expect(getDocumentTitle('resume-fa')).toBe('رزومه فارسی');
    });

    it('returns correct Persian title for resume-en', () => {
      expect(getDocumentTitle('resume-en')).toBe('رزومه انگلیسی');
    });

    it('returns correct Persian title for cover-letter', () => {
      expect(getDocumentTitle('cover-letter')).toBe('کاورلتر');
    });
  });

  describe('createEmptyExperience', () => {
    it('returns object with id and empty strings', () => {
      const exp = createEmptyExperience();
      expect(exp.id).toMatch(/^exp_/);
      expect(exp.company).toBe('');
      expect(exp.position).toBe('');
      expect(exp.startDate).toBe('');
      expect(exp.endDate).toBe('');
      expect(exp.description).toBe('');
      expect(exp.isCurrent).toBe(false);
    });
  });

  describe('createEmptyEducation', () => {
    it('returns object with id and empty strings', () => {
      const edu = createEmptyEducation();
      expect(edu.id).toMatch(/^edu_/);
      expect(edu.institution).toBe('');
      expect(edu.degree).toBe('');
      expect(edu.field).toBe('');
      expect(edu.startDate).toBe('');
      expect(edu.endDate).toBe('');
      expect(edu.description).toBe('');
    });
  });

  describe('createEmptySkill', () => {
    it('returns object with id, empty name, default level', () => {
      const skill = createEmptySkill();
      expect(skill.id).toMatch(/^skill_/);
      expect(skill.name).toBe('');
      expect(skill.level).toBe('متوسط');
    });
  });

  describe('createEmptyLanguage', () => {
    it('returns object with id, empty name, default level', () => {
      const lang = createEmptyLanguage();
      expect(lang.id).toMatch(/^lang_/);
      expect(lang.name).toBe('');
      expect(lang.level).toBe('متوسط');
    });
  });

  describe('createEmptyProject', () => {
    it('returns object with id and empty strings', () => {
      const proj = createEmptyProject();
      expect(proj.id).toMatch(/^proj_/);
      expect(proj.name).toBe('');
      expect(proj.description).toBe('');
      expect(proj.url).toBe('');
      expect(proj.technologies).toBe('');
    });
  });

  describe('createEmptyCertification', () => {
    it('returns object with id and empty strings', () => {
      const cert = createEmptyCertification();
      expect(cert.id).toMatch(/^cert_/);
      expect(cert.name).toBe('');
      expect(cert.issuer).toBe('');
      expect(cert.date).toBe('');
      expect(cert.url).toBe('');
    });
  });
});

describe('Career Documents - Validation', () => {
  describe('validateProfile', () => {
    it('requires fullName', () => {
      const errors = validateProfile({ fullName: '' });
      expect(errors).toContain('نام و نام خانوادگی الزامی است');
    });

    it('validates email format', () => {
      const errors = validateProfile({ fullName: 'Test', email: 'not-an-email' });
      expect(errors).toContain('ایمیل نامعتبر است');
    });

    it('returns empty array for valid profile', () => {
      const errors = validateProfile({ fullName: 'Test', email: 'test@example.com' });
      expect(errors).toHaveLength(0);
    });
  });

  describe('validateExperiences', () => {
    it('requires company for each experience', () => {
      const errors = validateExperiences([
        { id: '1', company: '', position: 'Dev', startDate: '', description: '' },
      ]);
      expect(errors.some((e) => e.includes('نام شرکت'))).toBe(true);
    });

    it('requires position for each experience', () => {
      const errors = validateExperiences([
        { id: '1', company: 'Test Co', position: '', startDate: '', description: '' },
      ]);
      expect(errors.some((e) => e.includes('سمت شغلی'))).toBe(true);
    });

    it('returns empty array for valid experiences', () => {
      const errors = validateExperiences([
        {
          id: '1',
          company: 'Test Co',
          position: 'Developer',
          startDate: '2024-01-01',
          description: 'Work',
        },
      ]);
      expect(errors).toHaveLength(0);
    });
  });

  describe('validateCoverLetter', () => {
    it('requires fullName', () => {
      const errors = validateCoverLetter({ fullName: '' }, 'Body text');
      expect(errors).toContain('نام فرستنده الزامی است');
    });

    it('requires body', () => {
      const errors = validateCoverLetter({ fullName: 'Test' }, '');
      expect(errors).toContain('متن نامه الزامی است');
    });

    it('returns empty array for valid input', () => {
      const errors = validateCoverLetter({ fullName: 'Test' }, 'Letter body');
      expect(errors).toHaveLength(0);
    });
  });

  it('DISCLAIMER contains جایگزین مشاوره شغلی', () => {
    expect(DISCLAIMER).toContain('جایگزین مشاوره شغلی');
  });

  it('PRIVACY_TEXT contains مرورگر شما', () => {
    expect(PRIVACY_TEXT).toContain('مرورگر شما');
  });

  it('WATERMARK_TEXT equals ساخته‌شده با PersianToolbox', () => {
    expect(WATERMARK_TEXT).toBe('ساخته‌شده با PersianToolbox');
  });
});

describe('Career Documents - Schemas', () => {
  it('DOCUMENT_TYPES has exactly 3 entries', () => {
    expect(DOCUMENT_TYPES).toHaveLength(3);
  });

  it('each DOCUMENT_TYPE has id, title, description, isRtl', () => {
    for (const dt of DOCUMENT_TYPES) {
      expect(dt.id).toBeTruthy();
      expect(dt.title).toBeTruthy();
      expect(dt.description).toBeTruthy();
      expect(typeof dt.isRtl).toBe('boolean');
    }
  });

  it('type/template mapping: persian-resume maps to resume-fa', () => {
    const pr = DOCUMENT_TYPES.find((t) => t.id === 'persian-resume');
    expect(pr).toBeDefined();
    expect(pr?.documentType).toBe('resume-fa');
  });

  it('type/template mapping: english-resume maps to resume-en', () => {
    const er = DOCUMENT_TYPES.find((t) => t.id === 'english-resume');
    expect(er).toBeDefined();
    expect(er?.documentType).toBe('resume-en');
  });

  it('type/template mapping: cover-letter maps to cover-letter', () => {
    const cl = DOCUMENT_TYPES.find((t) => t.id === 'cover-letter');
    expect(cl).toBeDefined();
    expect(cl?.documentType).toBe('cover-letter');
  });

  it('persian-resume is RTL, english-resume is LTR', () => {
    const pr = DOCUMENT_TYPES.find((t) => t.id === 'persian-resume');
    const er = DOCUMENT_TYPES.find((t) => t.id === 'english-resume');
    expect(pr?.isRtl).toBe(true);
    expect(er?.isRtl).toBe(false);
  });

  it('cover-letter is RTL', () => {
    const cl = DOCUMENT_TYPES.find((t) => t.id === 'cover-letter');
    expect(cl?.isRtl).toBe(true);
  });

  it('FEATURE_GATES has entries for all 3 document types', () => {
    expect(FEATURE_GATES['resume-fa']).toBeDefined();
    expect(FEATURE_GATES['resume-en']).toBeDefined();
    expect(FEATURE_GATES['cover-letter']).toBeDefined();
  });

  it('FEATURE_GATES.free.canExportDocx is false', () => {
    expect(FEATURE_GATES['resume-fa'].free.canExportDocx).toBe(false);
    expect(FEATURE_GATES['resume-en'].free.canExportDocx).toBe(false);
    expect(FEATURE_GATES['cover-letter'].free.canExportDocx).toBe(false);
  });

  it('FEATURE_GATES.premium.hasWatermark is false', () => {
    expect(FEATURE_GATES['resume-fa'].premium.hasWatermark).toBe(false);
    expect(FEATURE_GATES['resume-en'].premium.hasWatermark).toBe(false);
    expect(FEATURE_GATES['cover-letter'].premium.hasWatermark).toBe(false);
  });

  it('FEATURE_GATES free.canExportPdf is false for all types', () => {
    expect(FEATURE_GATES['resume-fa'].free.canExportPdf).toBe(false);
    expect(FEATURE_GATES['resume-en'].free.canExportPdf).toBe(false);
    expect(FEATURE_GATES['cover-letter'].free.canExportPdf).toBe(false);
  });

  it('FEATURE_GATES premium.canExportPdf is true for all types', () => {
    expect(FEATURE_GATES['resume-fa'].premium.canExportPdf).toBe(true);
    expect(FEATURE_GATES['resume-en'].premium.canExportPdf).toBe(true);
    expect(FEATURE_GATES['cover-letter'].premium.canExportPdf).toBe(true);
  });

  it('FEATURE_GATES free.hasWatermark is true for all types', () => {
    expect(FEATURE_GATES['resume-fa'].free.hasWatermark).toBe(true);
    expect(FEATURE_GATES['resume-en'].free.hasWatermark).toBe(true);
    expect(FEATURE_GATES['cover-letter'].free.hasWatermark).toBe(true);
  });

  it('FEATURE_GATES free.maxDrafts is 2 for all types', () => {
    expect(FEATURE_GATES['resume-fa'].free.maxDrafts).toBe(2);
    expect(FEATURE_GATES['resume-en'].free.maxDrafts).toBe(2);
    expect(FEATURE_GATES['cover-letter'].free.maxDrafts).toBe(2);
  });

  it('FEATURE_GATES premium.maxDrafts is 100 for all types', () => {
    expect(FEATURE_GATES['resume-fa'].premium.maxDrafts).toBe(100);
    expect(FEATURE_GATES['resume-en'].premium.maxDrafts).toBe(100);
    expect(FEATURE_GATES['cover-letter'].premium.maxDrafts).toBe(100);
  });

  it('FREE_MAX_DRAFTS is 2', () => {
    expect(FREE_MAX_DRAFTS).toBe(2);
  });

  it('DISCLAIMER does not contain positive guarantee wording', () => {
    expect(DISCLAIMER).not.toMatch(/تضمین.*استخدام(?! نیست)/);
    expect(DISCLAIMER).not.toMatch(/تضمین.*گرفتن.*شغل/);
    expect(DISCLAIMER).not.toMatch(/ضمانت.*کاریابی/);
    expect(DISCLAIMER).toContain('جایگزین');
    expect(DISCLAIMER).toContain('مشاوره شغلی');
    expect(DISCLAIMER).toContain('نیست');
  });
});

describe('Career Documents - Render', () => {
  it('returns HTML string', () => {
    const html = renderDocument(makeDraft(), { watermark: false });
    expect(typeof html).toBe('string');
    expect(html).toContain('<!DOCTYPE html>');
  });

  it('for resume-fa: contains RTL direction', () => {
    const html = renderDocument(makeDraft({ documentType: 'resume-fa' }), { watermark: false });
    expect(html).toContain('dir="rtl"');
  });

  it('for resume-en: contains LTR direction', () => {
    const html = renderDocument(makeDraft({ documentType: 'resume-en' }), {
      watermark: false,
      rtl: false,
    });
    expect(html).toContain('dir="ltr"');
  });

  it('for resume-fa: contains Persian title', () => {
    const html = renderDocument(makeDraft({ documentType: 'resume-fa' }), { watermark: false });
    expect(html).toContain('رزومه فارسی');
  });

  it('for resume-en: contains English text (LTR)', () => {
    const html = renderDocument(makeDraft({ documentType: 'resume-en' }), {
      watermark: false,
      rtl: false,
    });
    expect(html).toContain('Arial');
    expect(html).toContain('ltr');
  });

  it('for cover-letter: contains letter format', () => {
    const html = renderDocument(makeDraft({ documentType: 'cover-letter' }), { watermark: false });
    expect(html).toContain('letter');
  });

  it('with watermark: includes WATERMARK_TEXT', () => {
    const html = renderDocument(makeDraft(), { watermark: true });
    expect(html).toContain(WATERMARK_TEXT);
  });

  it('without watermark: excludes WATERMARK_TEXT', () => {
    const html = renderDocument(makeDraft(), { watermark: false });
    expect(html).not.toContain(WATERMARK_TEXT);
  });

  it('includes DISCLAIMER', () => {
    const html = renderDocument(makeDraft(), { watermark: false });
    expect(html).toContain(DISCLAIMER);
  });

  it('renders experiences when present', () => {
    const experiences: ResumeExperience[] = [
      {
        id: '1',
        company: 'Test Co',
        position: 'Developer',
        startDate: '2024-01-01',
        description: 'Built things',
      },
    ];
    const html = renderDocument(makeDraft({ experiences }), { watermark: false });
    expect(html).toContain('Test Co');
    expect(html).toContain('Developer');
  });

  it('renders education when present', () => {
    const html = renderDocument(
      makeDraft({
        education: [
          {
            id: '1',
            institution: 'Tehran Uni',
            degree: 'BS',
            field: 'CS',
            startDate: '2020-01-01',
          },
        ],
      }),
      { watermark: false },
    );
    expect(html).toContain('Tehran Uni');
    expect(html).toContain('BS');
  });

  it('renders skills when present', () => {
    const html = renderDocument(
      makeDraft({
        skills: [{ id: '1', name: 'TypeScript', level: 'پیشرفته' }],
      }),
      { watermark: false },
    );
    expect(html).toContain('TypeScript');
  });
});

describe('Career Documents - Draft Storage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('saveDraft + loadDrafts round-trip serialization', () => {
    const draft = makeDraft();
    saveDraft(draft);
    const loaded = loadDrafts();
    expect(loaded).toHaveLength(1);
    expect(loaded[0]?.id).toBe(draft.id);
    expect(loaded[0]?.profile.fullName).toBe('علی رضایی');
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
    expect(loaded[0]?.id).toBe('d2');
  });

  it('canSaveDraft returns true when under limit', () => {
    saveDraft(makeDraft({ id: 'd1', documentType: 'resume-fa' }));
    expect(canSaveDraft('resume-fa')).toBe(true);
  });

  it('canSaveDraft returns false when at limit', () => {
    saveDraft(makeDraft({ id: 'd1', documentType: 'resume-fa' }));
    saveDraft(makeDraft({ id: 'd2', documentType: 'resume-fa' }));
    expect(canSaveDraft('resume-fa')).toBe(false);
  });

  it('createDraftId returns unique IDs', () => {
    const id1 = createDraftId();
    const id2 = createDraftId();
    expect(id1).toMatch(/^cdoc_/);
    expect(id2).toMatch(/^cdoc_/);
    expect(id1).not.toBe(id2);
  });
});

describe('Career Documents - Export', () => {
  it('isDocxAvailable returns true', () => {
    expect(isDocxAvailable()).toBe(true);
  });
});
