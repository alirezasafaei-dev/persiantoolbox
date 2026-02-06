import { describe, it, expect } from 'vitest';
import {
  calculateTax,
  calculateCompoundInterest,
  convertRialToToman,
  convertTomanToRial,
} from '@/shared/utils/finance';

describe('finance utils', () => {
  it('calculates tax correctly', () => {
    const result = calculateTax(1000, 9);
    expect(result.taxAmount).toBe(90);
    expect(result.totalWithTax).toBe(1090);
  });

  it('calculates compound interest', () => {
    const result = calculateCompoundInterest({
      principal: 1000,
      annualRatePercent: 12,
      years: 1,
      timesPerYear: 12,
    });
    expect(result.total).toBeGreaterThan(1000);
    expect(result.interest).toBeGreaterThan(0);
  });

  it('handles non-finite inputs safely', () => {
    const taxResult = calculateTax(Number.NaN, Number.POSITIVE_INFINITY);
    expect(taxResult).toEqual({
      baseAmount: 0,
      ratePercent: 0,
      taxAmount: 0,
      totalWithTax: 0,
    });

    const interestResult = calculateCompoundInterest({
      principal: Number.NaN,
      annualRatePercent: Number.POSITIVE_INFINITY,
      years: Number.NaN,
      timesPerYear: 0,
    });
    expect(interestResult.principal).toBe(0);
    expect(interestResult.annualRatePercent).toBe(0);
    expect(interestResult.years).toBe(0);
    expect(interestResult.timesPerYear).toBe(1);
    expect(interestResult.total).toBe(0);
    expect(interestResult.interest).toBe(0);
  });

  it('converts rial and toman', () => {
    expect(convertRialToToman(100)).toBe(10);
    expect(convertTomanToRial(10)).toBe(100);
  });

  it('converts invalid amounts to zero', () => {
    expect(convertRialToToman(Number.NaN)).toBe(0);
    expect(convertTomanToRial(Number.NaN)).toBe(0);
  });
});
