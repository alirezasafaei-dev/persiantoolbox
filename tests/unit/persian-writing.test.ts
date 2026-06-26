import { describe, it, expect, beforeEach } from 'vitest';
import { normalizeArabicToPersian } from '@/lib/persian-writing/normalizeCharacters';
import { normalizeDigits } from '@/lib/persian-writing/normalizeDigits';
import {
  removeExtraSpaces,
  normalizeLineBreaks,
  fixPunctuationSpacing,
} from '@/lib/persian-writing/normalizeSpacing';
import { normalizePunctuation } from '@/lib/persian-writing/normalizePunctuation';
import { normalizeZwnj } from '@/lib/persian-writing/normalizeZwnj';
import { detectIssues } from '@/lib/persian-writing/detectIssues';
import { applyFixes } from '@/lib/persian-writing/applyFixes';
import { calculateStats } from '@/lib/persian-writing/textStats';
import {
  saveDraft,
  loadDrafts,
  loadDraft,
  deleteDraft,
  canSaveDraft,
  createDraftId,
} from '@/lib/persian-writing/draft-storage';
import { DEFAULT_CONFIG, FREE_MAX_LENGTH, DISCLAIMER } from '@/lib/persian-writing/types';
import type { PersianWritingConfig } from '@/lib/persian-writing/types';

describe('Persian Writing - normalizeArabicToPersian', () => {
  it('converts Arabic ي to Persian ی', () => {
    const result = normalizeArabicToPersian('مي');
    expect(result).toBe('می');
  });

  it('converts Arabic ك to Persian ک', () => {
    const result = normalizeArabicToPersian('شكر');
    expect(result).not.toContain('ك');
    expect(result).toContain('ک');
  });

  it('converts ؤ to و', () => {
    expect(normalizeArabicToPersian('مؤدب')).toBe('مودب');
  });

  it('converts إ to ا', () => {
    const result = normalizeArabicToPersian('إيران');
    expect(result).not.toContain('إ');
    expect(result).toBe('ایران');
  });

  it('converts أ to ا', () => {
    expect(normalizeArabicToPersian('أحمد')).toBe('احمد');
  });

  it('converts ة to ه', () => {
    expect(normalizeArabicToPersian('شمسه')).toBe('شمسه');
  });

  it('preserves text with no Arabic characters', () => {
    expect(normalizeArabicToPersian('سلام دنیا')).toBe('سلام دنیا');
  });

  it('handles empty string', () => {
    expect(normalizeArabicToPersian('')).toBe('');
  });

  it('handles mixed Arabic and Persian characters', () => {
    const result = normalizeArabicToPersian('ميتكان');
    expect(result).toContain('ی');
    expect(result).toContain('ک');
  });
});

describe('Persian Writing - normalizeDigits', () => {
  it('converts Arabic digits to Persian', () => {
    expect(normalizeDigits('١٢٣')).toBe('۱۲۳');
    expect(normalizeDigits('٤٥٦')).toBe('۴۵۶');
  });

  it('converts Latin digits to Persian by default', () => {
    expect(normalizeDigits('123')).toBe('۱۲۳');
    expect(normalizeDigits('456')).toBe('۴۵۶');
  });

  it('preserves Latin digits when toPersian is false', () => {
    expect(normalizeDigits('123', false)).toBe('123');
  });

  it('handles mixed content', () => {
    expect(normalizeDigits('test 123')).toBe('test ۱۲۳');
  });

  it('handles empty string', () => {
    expect(normalizeDigits('')).toBe('');
  });

  it('handles all Arabic digits', () => {
    expect(normalizeDigits('٠١٢٣٤٥٦٧٨٩')).toBe('۰۱۲۳۴۵۶۷۸۹');
  });
});

describe('Persian Writing - removeExtraSpaces', () => {
  it('replaces double spaces with single', () => {
    expect(removeExtraSpaces('hello  world')).toBe('hello world');
  });

  it('removes trailing spaces from lines', () => {
    const result = removeExtraSpaces('hello  \nworld');
    expect(result).toBe('hello\nworld');
  });

  it('collapses triple+ newlines to double', () => {
    expect(removeExtraSpaces('a\n\n\n\nb')).toBe('a\n\nb');
  });

  it('trims the final result', () => {
    expect(removeExtraSpaces('  hello  ')).toBe('hello');
  });

  it('replaces tabs with spaces', () => {
    expect(removeExtraSpaces('a\t\tb')).toBe('a b');
  });

  it('handles empty string', () => {
    expect(removeExtraSpaces('')).toBe('');
  });
});

describe('Persian Writing - normalizeLineBreaks', () => {
  it('converts \\r\\n to \\n', () => {
    expect(normalizeLineBreaks('line1\r\nline2')).toBe('line1\nline2');
  });

  it('converts standalone \\r to \\n', () => {
    expect(normalizeLineBreaks('line1\rline2')).toBe('line1\nline2');
  });

  it('preserves existing \\n', () => {
    expect(normalizeLineBreaks('line1\nline2')).toBe('line1\nline2');
  });

  it('handles empty string', () => {
    expect(normalizeLineBreaks('')).toBe('');
  });
});

describe('Persian Writing - fixPunctuationSpacing', () => {
  it('removes space before Persian comma', () => {
    expect(fixPunctuationSpacing('سلام ،')).toBe('سلام،');
  });

  it('removes space before period', () => {
    expect(fixPunctuationSpacing('test .')).toBe('test.');
  });

  it('removes space before question mark', () => {
    expect(fixPunctuationSpacing('آیا ؟')).toBe('آیا؟');
  });

  it('adds space after Persian punctuation when missing', () => {
    expect(fixPunctuationSpacing('سلام،دنیا')).toBe('سلام، دنیا');
  });

  it('handles closing paren after punctuation', () => {
    expect(fixPunctuationSpacing('سلام. (متن)')).toBe('سلام. (متن)');
  });

  it('handles empty string', () => {
    expect(fixPunctuationSpacing('')).toBe('');
  });
});

describe('Persian Writing - normalizePunctuation', () => {
  it('converts comma to Persian comma', () => {
    expect(normalizePunctuation('سلام,')).toBe('سلام،');
  });

  it('converts question mark to Persian question mark', () => {
    expect(normalizePunctuation('آیا?')).toBe('آیا؟');
  });

  it('converts semicolon to Persian semicolon', () => {
    expect(normalizePunctuation('a;b')).toBe('a؛b');
  });

  it('handles multiple punctuation marks', () => {
    expect(normalizePunctuation('a,b;c?')).toBe('a،b؛c؟');
  });

  it('preserves text with no punctuation', () => {
    expect(normalizePunctuation('سلام')).toBe('سلام');
  });

  it('handles empty string', () => {
    expect(normalizePunctuation('')).toBe('');
  });
});

describe('Persian Writing - normalizeZwnj', () => {
  it('adds ZWNJ between می and verb', () => {
    expect(normalizeZwnj('می‌توان')).toBe('می‌توان');
    expect(normalizeZwnj('می‌خواهم')).toBe('می‌خواهم');
  });

  it('adds ZWNJ between نمی and verb', () => {
    expect(normalizeZwnj('نمی‌خواهم')).toBe('نمی‌خواهم');
  });

  it('removes double ZWNJ', () => {
    expect(normalizeZwnj('می‌‌توان')).toBe('می‌توان');
  });

  it('does not add ZWNJ when already present', () => {
    expect(normalizeZwnj('می‌توان')).toBe('می‌توان');
  });

  it('handles empty string', () => {
    expect(normalizeZwnj('')).toBe('');
  });
});

describe('Persian Writing - detectIssues', () => {
  it('detects Arabic letters', () => {
    const issues = detectIssues('ميتكان', 'می‌تکان');
    const arabicIssue = issues.find((i) => i.category === 'حروف عربی');
    expect(arabicIssue).toBeDefined();
    expect(arabicIssue!.count).toBe(2);
  });

  it('detects extra spaces', () => {
    const issues = detectIssues('سلام  دنیا', 'سلام دنیا');
    const spaceIssue = issues.find((i) => i.category === 'فضاهای اضافی');
    expect(spaceIssue).toBeDefined();
  });

  it('detects punctuation spacing issues', () => {
    const issues = detectIssues('سلام ،دنیا', 'سلام، دنیا');
    const punctIssue = issues.find((i) => i.category === 'فاصله علائم نگارشی');
    expect(punctIssue).toBeDefined();
  });

  it('detects missing ZWNJ', () => {
    const issues = detectIssues('میتوان', 'می‌توان');
    const zwnjIssue = issues.find((i) => i.category === 'نیم‌فاصله');
    expect(zwnjIssue).toBeDefined();
    expect(zwnjIssue!.count).toBeGreaterThanOrEqual(1);
  });

  it('detects Arabic punctuation', () => {
    const issues = detectIssues('سلام, چطور?', 'سلام، چطور؟');
    const punctIssue = issues.find((i) => i.category === 'علائم نگارشی');
    expect(punctIssue).toBeDefined();
  });

  it('returns empty array for clean text', () => {
    const issues = detectIssues('سلام دنیا', 'سلام دنیا');
    expect(issues).toHaveLength(0);
  });
});

describe('Persian Writing - applyFixes', () => {
  it('full pipeline cleans text end-to-end', () => {
    const input =
      'سلام يك متن تستي است  كه  داراي  مشكلات  نگارشي  است. آيا  مي‌توانيد  آن  را  اصلاح  كنيد؟';
    const result = applyFixes(input, DEFAULT_CONFIG);
    expect(result.cleanedText).toContain('ی');
    expect(result.cleanedText).toContain('ک');
    expect(result.cleanedText).not.toMatch(/ {2}/);
    expect(result.originalText).toBe(input);
    expect(result.stats).toBeDefined();
  });

  it('respects config flags - disabling Arabic normalization', () => {
    const config: PersianWritingConfig = { ...DEFAULT_CONFIG, normalizeArabicLetters: false };
    const result = applyFixes('ميتكان', config);
    expect(result.cleanedText).toBe('ميتكان');
  });

  it('respects config flags - disabling digit normalization', () => {
    const config: PersianWritingConfig = { ...DEFAULT_CONFIG, normalizeDigits: false };
    const result = applyFixes('۱۲۳', config);
    expect(result.cleanedText).toBe('۱۲۳');
  });

  it('URLs in Persian text stay intact when fixPunctuationSpacing is disabled', () => {
    const config: PersianWritingConfig = {
      ...DEFAULT_CONFIG,
      fixPunctuationSpacing: false,
      normalizePunctuation: false,
    };
    const input = 'visit https://example.com for more';
    const result = applyFixes(input, config);
    expect(result.cleanedText).toContain('https://example.com');
  });

  it('emails in Persian text stay intact when fixPunctuationSpacing is disabled', () => {
    const config: PersianWritingConfig = {
      ...DEFAULT_CONFIG,
      fixPunctuationSpacing: false,
      normalizePunctuation: false,
    };
    const input = 'test@example.com is my email';
    const result = applyFixes(input, config);
    expect(result.cleanedText).toContain('test@example.com');
  });

  it('returns stats with the cleaned text', () => {
    const result = applyFixes('سلام دنیا', DEFAULT_CONFIG);
    expect(result.stats.characters).toBeGreaterThan(0);
    expect(result.stats.words).toBeGreaterThan(0);
    expect(result.stats.sentences).toBeGreaterThan(0);
  });
});

describe('Persian Writing - calculateStats', () => {
  it('counts characters correctly', () => {
    const stats = calculateStats('سلام دنیا');
    expect(stats.characters).toBe('سلام دنیا'.length);
  });

  it('counts words correctly', () => {
    const stats = calculateStats('یک دو سه');
    expect(stats.words).toBe(3);
  });

  it('counts sentences correctly', () => {
    const stats = calculateStats('جمله اول. جمله دوم؟ جمله سوم!');
    expect(stats.sentences).toBe(3);
  });

  it('counts paragraphs correctly', () => {
    const stats = calculateStats('پاراگراف اول\n\nپاراگراف دوم');
    expect(stats.paragraphs).toBe(2);
  });

  it('calculates reading time', () => {
    const stats = calculateStats('کلمه '.repeat(200).trim());
    expect(stats.readingTimeMinutes).toBeGreaterThanOrEqual(1);
  });

  it('handles empty text', () => {
    const stats = calculateStats('');
    expect(stats.characters).toBe(0);
    expect(stats.words).toBe(0);
  });

  it('minimum reading time is 1 minute', () => {
    const stats = calculateStats('کوتاه');
    expect(stats.readingTimeMinutes).toBeGreaterThanOrEqual(1);
  });
});

describe('Persian Writing - Draft Storage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('saveDraft + loadDrafts round-trip', () => {
    const draft = {
      id: 'test-draft-1',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
      originalText: 'سلام دنیا',
      config: DEFAULT_CONFIG,
    };
    saveDraft(draft);
    const loaded = loadDrafts();
    expect(loaded).toHaveLength(1);
    expect(loaded[0]!.originalText).toBe('سلام دنیا');
  });

  it('loadDrafts with no data returns empty array', () => {
    expect(loadDrafts()).toHaveLength(0);
  });

  it('loadDraft returns specific draft by id', () => {
    const draft = {
      id: 'draft-abc',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
      originalText: 'test',
      config: DEFAULT_CONFIG,
    };
    saveDraft(draft);
    expect(loadDraft('draft-abc')).toBeDefined();
    expect(loadDraft('nonexistent')).toBeUndefined();
  });

  it('deleteDraft removes draft by id', () => {
    saveDraft({
      id: 'd1',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
      originalText: 'a',
      config: DEFAULT_CONFIG,
    });
    saveDraft({
      id: 'd2',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
      originalText: 'b',
      config: DEFAULT_CONFIG,
    });
    deleteDraft('d1');
    expect(loadDrafts()).toHaveLength(1);
    expect(loadDrafts()[0]!.id).toBe('d2');
  });

  it('canSaveDraft returns true when under limit', () => {
    expect(canSaveDraft()).toBe(true);
  });

  it('canSaveDraft returns false when at limit (5)', () => {
    for (let i = 0; i < 5; i++) {
      saveDraft({
        id: `d${i}`,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
        originalText: `text ${i}`,
        config: DEFAULT_CONFIG,
      });
    }
    expect(canSaveDraft()).toBe(false);
  });

  it('createDraftId returns unique IDs with draft_ prefix', () => {
    const id1 = createDraftId();
    const id2 = createDraftId();
    expect(id1).toMatch(/^draft_/);
    expect(id2).toMatch(/^draft_/);
    expect(id1).not.toBe(id2);
  });
});

describe('Persian Writing - Constants', () => {
  it('FREE_MAX_LENGTH is 5000', () => {
    expect(FREE_MAX_LENGTH).toBe(5000);
  });

  it('DEFAULT_CONFIG has correct default values', () => {
    expect(DEFAULT_CONFIG.mode).toBe('standard');
    expect(DEFAULT_CONFIG.normalizeArabicLetters).toBe(true);
    expect(DEFAULT_CONFIG.normalizeDigits).toBe(true);
    expect(DEFAULT_CONFIG.removeExtraSpaces).toBe(true);
    expect(DEFAULT_CONFIG.normalizeLineBreaks).toBe(true);
    expect(DEFAULT_CONFIG.fixPunctuationSpacing).toBe(true);
    expect(DEFAULT_CONFIG.normalizePunctuation).toBe(true);
    expect(DEFAULT_CONFIG.normalizeZwnj).toBe(true);
    expect(DEFAULT_CONFIG.preserveUrls).toBe(true);
    expect(DEFAULT_CONFIG.preserveEmails).toBe(true);
    expect(DEFAULT_CONFIG.preservePhones).toBe(true);
  });

  it('DISCLAIMER mentions responsible usage', () => {
    expect(DISCLAIMER).toContain('کاربر');
  });
});
