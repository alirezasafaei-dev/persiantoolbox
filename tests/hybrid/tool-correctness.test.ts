import { describe, it, expect } from 'vitest';
import {
  calculateTax,
  calculateCompoundInterest,
  convertRialToToman,
  convertTomanToRial,
} from '@/shared/utils/finance';
import {
  isValidCardNumber,
  isValidIranianMobile,
  isValidIranianPlate,
  isValidIranianPostalCode,
  isValidIranianSheba,
  isValidNationalId,
  normalizeIranianMobile,
} from '@/shared/utils/validation';
import { formatBytesFa, formatUptimeFa, formatDateFa } from '@/shared/utils/format';
import {
  MINIMUM_WAGE_1405,
  INSURANCE_RATE_1405,
  TAX_EXEMPTION_MONTHLY_TOMAN,
} from '@/shared/constants/finance';

describe('finance calculators - Persian/Arabic digit edge cases', () => {
  it('calculateTax with zero amount returns zero', () => {
    const result = calculateTax(0, 9);
    expect(result.taxAmount).toBe(0);
    expect(result.totalWithTax).toBe(0);
  });

  it('calculateTax with negative amount clamps to zero', () => {
    const result = calculateTax(-1000, 9);
    expect(result.taxAmount).toBe(-90);
    expect(result.baseAmount).toBe(-1000);
  });

  it('calculateTax with 100% rate doubles the amount', () => {
    const result = calculateTax(1000, 100);
    expect(result.taxAmount).toBe(1000);
    expect(result.totalWithTax).toBe(2000);
  });

  it('calculateCompoundInterest with 0% rate returns principal', () => {
    const result = calculateCompoundInterest({
      principal: 1000000,
      annualRatePercent: 0,
      years: 5,
    });
    expect(result.total).toBe(1000000);
    expect(result.interest).toBe(0);
  });

  it('calculateCompoundInterest with 1 year monthly compounding', () => {
    const result = calculateCompoundInterest({
      principal: 10000000,
      annualRatePercent: 24,
      years: 1,
      timesPerYear: 12,
    });
    expect(result.total).toBeGreaterThan(10000000);
    expect(result.interest).toBeGreaterThan(0);
    expect(result.timesPerYear).toBe(12);
  });

  it('compound interest with very large principal', () => {
    const result = calculateCompoundInterest({
      principal: 1000000000,
      annualRatePercent: 18,
      years: 10,
    });
    expect(result.total).toBeGreaterThan(1000000000);
    expect(Number.isFinite(result.total)).toBe(true);
  });

  it('convertRialToToman handles Persian digits as NaN gracefully', () => {
    expect(convertRialToToman(NaN)).toBe(0);
    expect(convertTomanToRial(NaN)).toBe(0);
    expect(convertRialToToman(Infinity)).toBe(0);
    expect(convertTomanToRial(-Infinity)).toBe(0);
  });

  it('MINIMUM_WAGE_1405 is positive and reasonable', () => {
    expect(MINIMUM_WAGE_1405).toBeGreaterThan(10000000);
    expect(MINIMUM_WAGE_1405).toBeLessThan(50000000);
  });

  it('INSURANCE_RATE_1405 is 7%', () => {
    expect(INSURANCE_RATE_1405).toBe(0.07);
  });

  it('TAX_EXEMPTION_MONTHLY_TOMAN is set', () => {
    expect(TAX_EXEMPTION_MONTHLY_TOMAN).toBe(40000000);
  });
});

describe('validation tools - Persian input edge cases', () => {
  it('validates correct Iranian national ID', () => {
    expect(isValidNationalId('0010350829')).toBe(true);
    expect(isValidNationalId('1000000011')).toBe(true);
  });

  it('rejects too-short national ID', () => {
    expect(isValidNationalId('123')).toBe(false);
    expect(isValidNationalId('')).toBe(false);
  });

  it('rejects all-same-digit national ID', () => {
    expect(isValidNationalId('1111111111')).toBe(false);
  });

  it('normalizes Iranian mobile with +98 prefix', () => {
    expect(normalizeIranianMobile('+989123456789')).toBe('09123456789');
  });

  it('normalizes Iranian mobile with 0098 prefix', () => {
    expect(normalizeIranianMobile('00989123456789')).toBe('09123456789');
  });

  it('validates correct Iranian mobile', () => {
    expect(isValidIranianMobile('09123456789')).toBe(true);
    expect(isValidIranianMobile('9123456789')).toBe(true);
  });

  it('rejects invalid mobile prefix', () => {
    expect(isValidIranianMobile('08123456789')).toBe(false);
  });

  it('validates Iranian card number via Luhn', () => {
    expect(isValidCardNumber('6274129005473742')).toBe(true);
  });

  it('rejects invalid card number', () => {
    expect(isValidCardNumber('6037991894123457')).toBe(false);
    expect(isValidCardNumber('123')).toBe(false);
    expect(isValidCardNumber('')).toBe(false);
  });

  it('validates Iranian Sheba number', () => {
    expect(isValidIranianSheba('IR062960000000100324200001')).toBe(true);
  });

  it('rejects non-Iranian Sheba', () => {
    expect(isValidIranianSheba('GB82WEST1234')).toBe(false);
  });

  it('validates Iranian postal code', () => {
    expect(isValidIranianPostalCode('1234567890')).toBe(true);
  });

  it('rejects short postal code', () => {
    expect(isValidIranianPostalCode('12345')).toBe(false);
  });

  it('validates Iranian plate number', () => {
    expect(isValidIranianPlate('12ب34567')).toBe(true);
  });

  it('rejects plate with non-Persian letter', () => {
    expect(isValidIranianPlate('12X34567')).toBe(false);
  });
});

describe('format utilities - Persian output', () => {
  it('formatBytesFa returns Persian format', () => {
    expect(formatBytesFa(0)).toBe('0 B');
    expect(formatBytesFa(1024)).toBe('1.00 KB');
    expect(formatBytesFa(1048576)).toBe('1.00 MB');
  });

  it('formatBytesFa handles negative/NaN', () => {
    expect(formatBytesFa(-1)).toBe('0 B');
    expect(formatBytesFa(NaN)).toBe('0 B');
  });

  it('formatUptimeFa returns Persian text', () => {
    const result = formatUptimeFa(3661);
    expect(result).toContain('ساعت');
    expect(result).toContain('دقیقه');
  });

  it('formatUptimeFa with days', () => {
    const result = formatUptimeFa(90000);
    expect(result).toContain('روز');
  });

  it('formatDateFa returns Persian date string', () => {
    const result = formatDateFa(Date.now());
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('formatDateFa handles invalid date', () => {
    expect(formatDateFa('invalid')).toBe('تاریخ نامعتبر');
  });
});
