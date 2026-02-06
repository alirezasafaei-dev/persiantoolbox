import { describe, it, expect } from 'vitest';
import {
  formatMoneyFa,
  formatNumberFa,
  numberToWordsFa,
  parseLooseNumber,
  toEnglishDigits,
} from './number';

describe('number utils', () => {
  it('converts Persian digits to English', () => {
    expect(toEnglishDigits('۱۲۳٬۴۵۶٫۷۸')).toBe('123,456.78');
  });

  it('converts Arabic-Indic digits to English', () => {
    expect(toEnglishDigits('١٢٣٬٤٥٦٫٧٨')).toBe('123,456.78');
  });

  it('parses loose Persian numbers with separators', () => {
    expect(parseLooseNumber('۱۲٬۳۴۵٬۶۷۸')).toBe(12345678);
    expect(parseLooseNumber(' ۱۲۳۴۵ ')).toBe(12345);
    expect(parseLooseNumber('\u200f۱۲۳')).toBe(123);
  });

  it('returns null for invalid input', () => {
    expect(parseLooseNumber('۱۲a۳')).toBeNull();
    expect(parseLooseNumber('')).toBeNull();
    expect(parseLooseNumber('--12')).toBeNull();
    expect(parseLooseNumber('.')).toBeNull();
    expect(parseLooseNumber('9'.repeat(400))).toBeNull();
  });

  it('parses negative numbers', () => {
    expect(parseLooseNumber('-۱۲۳۴')).toBe(-1234);
  });

  it('converts numbers to Persian words', () => {
    expect(numberToWordsFa(0)).toBe('صفر');
    expect(numberToWordsFa(12)).toBe('دوازده');
    expect(numberToWordsFa(1001)).toBe('یک هزار و یک');
    expect(numberToWordsFa(12345)).toBe('دوازده هزار و سیصد و چهل و پنج');
  });

  it('handles negative and fractional numbers in words', () => {
    expect(numberToWordsFa(-12.5)).toBe('منفی دوازده ممیز پنج');
    expect(numberToWordsFa(12.5)).toBe('دوازده ممیز پنج');
    expect(numberToWordsFa(-12)).toBe('منفی دوازده');
  });

  it('ignores tiny fractional rounding', () => {
    expect(numberToWordsFa(1.0000001)).toBe('یک');
    expect(numberToWordsFa(-1.0000001)).toBe('منفی یک');
  });

  it('formats numbers with Persian digits', () => {
    expect(formatNumberFa(1234.56)).toContain('۱');
    expect(formatMoneyFa(1234.56)).not.toContain('٫');
  });

  it('returns empty for non-finite input', () => {
    expect(numberToWordsFa(Number.NaN)).toBe('');
    expect(numberToWordsFa(Number.POSITIVE_INFINITY)).toBe('');
  });
});
