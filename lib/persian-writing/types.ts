export type CleanupMode = 'safe' | 'standard' | 'strict';

export interface PersianWritingConfig {
  mode: CleanupMode;
  normalizeArabicLetters: boolean;
  normalizeDigits: boolean;
  removeExtraSpaces: boolean;
  normalizeLineBreaks: boolean;
  fixPunctuationSpacing: boolean;
  normalizePunctuation: boolean;
  detectRepeatedWords: boolean;
  detectRepeatedPunctuation: boolean;
  normalizeZwnj: boolean;
  preserveUrls: boolean;
  preserveEmails: boolean;
  preservePhones: boolean;
}

export interface CleanupIssue {
  category: string;
  count: number;
  description: string;
}

export interface CleanupResult {
  originalText: string;
  cleanedText: string;
  issues: CleanupIssue[];
  totalChanges: number;
  stats: TextStats;
}

export interface TextStats {
  characters: number;
  words: number;
  sentences: number;
  paragraphs: number;
  readingTimeMinutes: number;
}

export interface WritingDraft {
  id: string;
  createdAt: string;
  updatedAt: string;
  originalText: string;
  config: PersianWritingConfig;
}

export const DISCLAIMER =
  'این ابزار برای پاک‌سازی، استانداردسازی و بهبود نگارش فارسی بر اساس قواعد زبانی و تنظیمات انتخاب‌شده توسط کاربر طراحی شده است و جایگزین ویراستار انسانی، مشاوره تخصصی، داوری علمی یا تضمین کیفیت نهایی متن نیست. مسئولیت بررسی نهایی و استفاده از خروجی بر عهده کاربر است.';

export const PRIVACY_TEXT =
  'متن شما به‌صورت پیش‌فرض در مرورگر پردازش می‌شود و برای پاک‌سازی و استانداردسازی نیازی به ارسال متن به سرور نیست.';

export const WATERMARK_TEXT = 'ساخته‌شده با PersianToolbox';

export const DEFAULT_CONFIG: PersianWritingConfig = {
  mode: 'standard',
  normalizeArabicLetters: true,
  normalizeDigits: true,
  removeExtraSpaces: true,
  normalizeLineBreaks: true,
  fixPunctuationSpacing: true,
  normalizePunctuation: true,
  detectRepeatedWords: true,
  detectRepeatedPunctuation: true,
  normalizeZwnj: true,
  preserveUrls: true,
  preserveEmails: true,
  preservePhones: true,
};

export const FREE_MAX_LENGTH = 5000;
