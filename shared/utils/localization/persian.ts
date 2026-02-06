/**
 * Utilities for Persian language support including number formatting and RTL helpers.
 */

import { toEnglishDigits } from '@/shared/utils/numbers';

const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'] as const;
const englishDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'] as const;

const enToFaMap: Record<(typeof englishDigits)[number], (typeof persianDigits)[number]> = {
  '0': '۰',
  '1': '۱',
  '2': '۲',
  '3': '۳',
  '4': '۴',
  '5': '۵',
  '6': '۶',
  '7': '۷',
  '8': '۸',
  '9': '۹',
};

const enDigitRegex = /[0-9]/g;
const persianRegex = /[\u0600-\u06FF]/;

const persianDateFormatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

const fallbackPersianDateFormatter = new Intl.DateTimeFormat('fa-IR', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

const persianNumberFormatter = new Intl.NumberFormat('fa-IR');

const persianSuffixes = ['ترین', 'تر', 'های', 'ها', 'ی', 'ام', 'ای', 'است'];
const suffixPattern = new RegExp(
  `([\u0600-\u06FF]+)(\u200C)?(${persianSuffixes.join('|')})(?![\u0600-\u06FF])`,
  'g',
);

const arabicCharMap: Record<string, string> = {
  ك: 'ک',
  ي: 'ی',
  ى: 'ی',
  ئ: 'ی',
  ؤ: 'و',
  ة: 'ه',
  ۀ: 'ه',
  أ: 'ا',
  إ: 'ا',
  ٱ: 'ا',
};

const arabicCharRegex = /[كيىئؤةۀأإٱء]/g;
const arabicDiacriticsRegex = /[\u064B-\u065F\u0670\u06D6-\u06ED]/g;
const tatweelRegex = /\u0640/g;
const zwnjRegex = /\u200C/g;

/**
 * Converts English numbers to Persian numbers.
 * Complexity: O(n) where n is input length.
 */
export function toPersianNumbers(input: string | number): string {
  const str = input.toString();
  return str.replace(enDigitRegex, (digit) => enToFaMap[digit as keyof typeof enToFaMap]);
}

/**
 * Formats a number with Persian thousands separator.
 */
export function formatPersianNumber(num: number): string {
  return persianNumberFormatter.format(num);
}

/**
 * Formats currency in Persian format.
 */
export function formatPersianCurrency(amount: number, currency = 'تومان'): string {
  return `${formatPersianNumber(amount)} ${currency}`;
}

/**
 * Adds proper RTL attributes for components.
 */
export function rtlAttributes(): { dir: 'rtl'; 'aria-orientation': 'horizontal' } {
  return {
    dir: 'rtl',
    'aria-orientation': 'horizontal',
  };
}

/**
 * Checks if a string contains Persian characters.
 */
export function isPersianText(text: string): boolean {
  return persianRegex.test(text);
}

/**
 * Converts a date to Persian (Jalali) format.
 */
export function formatPersianDate(date: Date | number): string {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) {
    return '';
  }
  try {
    return persianDateFormatter.format(d);
  } catch {
    return fallbackPersianDateFormatter.format(d);
  }
}

/**
 * Adds proper spacing for Persian text (using half-space for suffixes).
 */
export function fixPersianSpacing(text: string): string {
  return text.replace(suffixPattern, (match, stem, zwnj, suffix) => {
    if (zwnj) {
      return match;
    }
    return `${stem}\u200C${suffix}`;
  });
}

/**
 * Normalize Arabic variants of Persian characters and remove tatweel.
 */
export function normalizePersianChars(text: string): string {
  return text
    .replace(arabicCharRegex, (char) => arabicCharMap[char] ?? char)
    .replace(tatweelRegex, '');
}

/**
 * Remove Arabic diacritics from Persian text.
 */
export function stripPersianDiacritics(text: string): string {
  return text.replace(arabicDiacriticsRegex, '');
}

/**
 * Clean Persian text by normalizing characters, removing diacritics,
 * trimming, and fixing common spacing.
 */
export function cleanPersianText(text: string): string {
  const normalized = stripPersianDiacritics(normalizePersianChars(text));
  const collapsed = normalized.replace(/\s+/g, ' ').trim();
  return fixPersianSpacing(collapsed);
}

/**
 * Create a URL-friendly slug for Persian text.
 */
export function slugifyPersian(text: string): string {
  const normalized = toEnglishDigits(stripPersianDiacritics(normalizePersianChars(text)))
    .replace(zwnjRegex, ' ')
    .toLowerCase();
  const cleaned = normalized
    .replace(/[^\u0600-\u06FF0-9a-z\s-]/g, ' ')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
  return cleaned;
}
