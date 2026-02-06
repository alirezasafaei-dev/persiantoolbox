import { describe, it, expect, vi } from 'vitest';
import {
  toPersianNumbers,
  formatPersianCurrency,
  formatPersianNumber,
  formatPersianDate,
  fixPersianSpacing,
  isPersianText,
  rtlAttributes,
  normalizePersianChars,
  stripPersianDiacritics,
  cleanPersianText,
  slugifyPersian,
} from '@/shared/utils/localization';

describe('Persian Utils', () => {
  describe('toPersianNumbers', () => {
    it('should convert English numbers to Persian', () => {
      expect(toPersianNumbers('123')).toBe('۱۲۳');
      expect(toPersianNumbers(456)).toBe('۴۵۶');
    });

    it('should handle mixed strings', () => {
      expect(toPersianNumbers('Price: 100')).toBe('Price: ۱۰۰');
    });
  });

  describe('formatPersianCurrency', () => {
    it('should format number as currency', () => {
      const result = formatPersianCurrency(1000000);
      expect(result).toContain('تومان');
      expect(result).toContain('۱');
    });

    it('should support custom currency', () => {
      const result = formatPersianCurrency(500, 'ریال');
      expect(result).toContain('ریال');
    });
  });

  describe('formatPersianNumber', () => {
    it('should use Persian digits and separators', () => {
      const result = formatPersianNumber(12345);
      expect(result).toContain('۱۲');
      expect(result).toContain('٬');
    });
  });

  describe('formatPersianDate', () => {
    it('should format date using Persian calendar when available', () => {
      const date = new Date(2024, 2, 20);
      let expected = '';
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      };
      try {
        expected = new Intl.DateTimeFormat('fa-IR-u-ca-persian', options).format(date);
      } catch {
        expected = new Intl.DateTimeFormat('fa-IR', options).format(date);
      }
      expect(formatPersianDate(date)).toBe(expected);
    });

    it('should return empty string for invalid date', () => {
      expect(formatPersianDate(Number.NaN)).toBe('');
    });

    it('should fallback when persian calendar is unsupported', async () => {
      vi.resetModules();
      const originalIntl = Intl;

      vi.stubGlobal('Intl', {
        NumberFormat: originalIntl.NumberFormat,
        DateTimeFormat: function DateTimeFormat(
          locales: string | string[],
          options?: Intl.DateTimeFormatOptions,
        ) {
          if (locales === 'fa-IR-u-ca-persian') {
            return {
              format: () => {
                throw new Error('unsupported');
              },
            } as unknown as Intl.DateTimeFormat;
          }
          return new originalIntl.DateTimeFormat(locales, options);
        },
      });

      const { formatPersianDate: formatPersianDateDynamic } =
        await import('@/shared/utils/localization/persian');
      const date = new Date(2024, 2, 20);
      const expected = new originalIntl.DateTimeFormat('fa-IR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(date);

      expect(formatPersianDateDynamic(date)).toBe(expected);
      vi.unstubAllGlobals();
    });
  });

  describe('fixPersianSpacing', () => {
    it('should insert half-space before suffixes', () => {
      expect(fixPersianSpacing('کتابها')).toBe('کتاب\u200Cها');
      expect(fixPersianSpacing('بهترین')).toBe('به\u200Cترین');
    });

    it('should not duplicate half-space', () => {
      expect(fixPersianSpacing('کتاب\u200Cها')).toBe('کتاب\u200Cها');
    });
  });

  describe('normalizePersianChars', () => {
    it('should normalize Arabic variants of Persian letters', () => {
      expect(normalizePersianChars('كباب و يار')).toBe('کباب و یار');
      expect(normalizePersianChars('ۀ و ة')).toBe('ه و ه');
    });

    it('should map all supported Arabic variants', () => {
      expect(normalizePersianChars('ك ي ى ئ ؤ ة ۀ أ إ ٱ')).toBe('ک ی ی ی و ه ه ا ا ا');
    });

    it('should remove tatweel', () => {
      expect(normalizePersianChars('سلامـــ')).toBe('سلام');
    });

    it('should keep unsupported Arabic characters unchanged', () => {
      expect(normalizePersianChars('ء')).toBe('ء');
    });

    it('should keep already-normal characters unchanged', () => {
      expect(normalizePersianChars('سلام')).toBe('سلام');
    });
  });

  describe('stripPersianDiacritics', () => {
    it('should remove diacritics', () => {
      expect(stripPersianDiacritics('سَلام')).toBe('سلام');
    });
  });

  describe('cleanPersianText', () => {
    it('should normalize, trim, and fix spacing', () => {
      expect(cleanPersianText('  كتابها  ')).toBe('کتاب\u200Cها');
    });
  });

  describe('slugifyPersian', () => {
    it('should create slug for persian text', () => {
      expect(slugifyPersian('سلام دنیا')).toBe('سلام-دنیا');
    });

    it('should normalize digits and remove symbols', () => {
      expect(slugifyPersian('  شماره ۱۲۳! ')).toBe('شماره-123');
    });
  });

  describe('isPersianText', () => {
    it('should detect Persian text', () => {
      expect(isPersianText('سلام')).toBe(true);
      expect(isPersianText('hello')).toBe(false);
      expect(isPersianText('hello سلام')).toBe(true);
    });
  });

  describe('rtlAttributes', () => {
    it('should return RTL attributes', () => {
      expect(rtlAttributes()).toEqual({ dir: 'rtl', 'aria-orientation': 'horizontal' });
    });
  });
});
