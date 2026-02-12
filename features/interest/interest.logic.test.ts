import { describe, expect, it } from 'vitest';
import { calculateInterest, calculateInterestResult } from './interest.logic';

describe('interest logic', () => {
  it('calculates simple interest', () => {
    const result = calculateInterest({
      principal: 100_000_000,
      annualRatePercent: 20,
      months: 12,
      mode: 'simple',
    });

    expect(result.interest).toBeCloseTo(20_000_000, 2);
    expect(result.finalAmount).toBeCloseTo(120_000_000, 2);
    expect(result.monthlyProfit).toBeCloseTo(1_666_666.67, 2);
  });

  it('calculates compound interest', () => {
    const result = calculateInterest({
      principal: 100_000_000,
      annualRatePercent: 20,
      months: 12,
      mode: 'compound',
      timesPerYear: 12,
    });

    expect(result.finalAmount).toBeGreaterThan(120_000_000);
    expect(result.interest).toBeGreaterThan(20_000_000);
  });

  it('rejects invalid inputs', () => {
    expect(() =>
      calculateInterest({
        principal: -1,
        annualRatePercent: 10,
        months: 12,
        mode: 'simple',
      }),
    ).toThrow('مبلغ سپرده نمی‌تواند منفی باشد.');

    expect(() =>
      calculateInterest({
        principal: 1_000_000,
        annualRatePercent: 10,
        months: 0,
        mode: 'simple',
      }),
    ).toThrow('مدت سپرده‌گذاری باید بیشتر از صفر باشد.');
  });

  it('returns ToolResult wrapper', () => {
    const result = calculateInterestResult({
      principal: 1_000_000,
      annualRatePercent: 10,
      months: 6,
      mode: 'simple',
    });

    expect(result.ok).toBe(true);
  });
});
