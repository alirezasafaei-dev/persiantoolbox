import { describe, it, expect } from 'vitest';
import { calculateLoan, calculateLoanResult } from './loan.logic';

describe('loan logic', () => {
  it('calculates installment for regular loan', () => {
    const result = calculateLoan({
      calculationType: 'installment',
      loanType: 'regular',
      principal: 1_000_000,
      annualInterestRatePercent: 12,
      months: 12,
    });

    expect(result.monthlyPayment).toBeCloseTo(88848.79, 2);
    expect(result.totalPayment).toBeCloseTo(result.monthlyPayment * 12, 5);
  });

  it('solves rate from payment', () => {
    const result = calculateLoan({
      calculationType: 'rate',
      loanType: 'regular',
      principal: 1_000_000,
      annualInterestRatePercent: 0,
      months: 12,
      monthlyPayment: 88848.79,
    });

    expect(result.annualInterestRatePercent).toBeCloseTo(12, 1);
  });

  it('handles stepped loans with step details', () => {
    const result = calculateLoan({
      calculationType: 'installment',
      loanType: 'stepped',
      principal: 5_000_000,
      annualInterestRatePercent: 18,
      months: 24,
      stepMonths: 6,
      stepRateIncrease: 2,
    });

    expect(result.stepDetails?.length).toBeGreaterThan(0);
  });

  it('clamps rate for qarzolhasaneh loans', () => {
    const result = calculateLoan({
      calculationType: 'installment',
      loanType: 'qarzolhasaneh',
      principal: 1_000_000,
      annualInterestRatePercent: 12,
      months: 12,
    });

    expect(result.annualInterestRatePercent).toBeLessThanOrEqual(4);
  });

  it('solves principal from payment', () => {
    const result = calculateLoan({
      calculationType: 'principal',
      loanType: 'regular',
      principal: 0,
      annualInterestRatePercent: 10,
      months: 12,
      monthlyPayment: 100000,
    });

    expect(result.principal).toBeGreaterThan(0);
  });

  it('solves principal when rate is zero', () => {
    const result = calculateLoan({
      calculationType: 'principal',
      loanType: 'regular',
      principal: 0,
      annualInterestRatePercent: 0,
      months: 12,
      monthlyPayment: 100000,
    });

    expect(result.principal).toBe(1_200_000);
  });

  it('solves months from payment', () => {
    const result = calculateLoan({
      calculationType: 'months',
      loanType: 'regular',
      principal: 1_000_000,
      annualInterestRatePercent: 10,
      months: 12,
      monthlyPayment: 100000,
    });

    expect(result.months).toBeGreaterThan(0);
  });

  it('solves months with zero rate', () => {
    const result = calculateLoan({
      calculationType: 'months',
      loanType: 'regular',
      principal: 1_200_000,
      annualInterestRatePercent: 0,
      months: 12,
      monthlyPayment: 100000,
    });

    expect(result.months).toBe(12);
  });

  it('handles zero rate installment', () => {
    const result = calculateLoan({
      calculationType: 'installment',
      loanType: 'regular',
      principal: 1_200_000,
      annualInterestRatePercent: 0,
      months: 12,
    });

    expect(result.monthlyPayment).toBeCloseTo(100000, 2);
  });

  it('throws on invalid inputs', () => {
    expect(() =>
      calculateLoan({
        calculationType: 'installment',
        loanType: 'regular',
        principal: -1,
        annualInterestRatePercent: 10,
        months: 12,
      }),
    ).toThrow('مبلغ وام نامعتبر است.');

    expect(() =>
      calculateLoan({
        calculationType: 'installment',
        loanType: 'regular',
        principal: 1_000_000,
        annualInterestRatePercent: 10,
        months: -1,
      }),
    ).toThrow('مدت بازپرداخت نامعتبر است.');

    expect(() =>
      calculateLoan({
        calculationType: 'installment',
        loanType: 'regular',
        principal: 1_000_000,
        annualInterestRatePercent: 10,
        months: 0,
      }),
    ).toThrow('مدت بازپرداخت باید بیشتر از صفر باشد.');

    expect(() =>
      calculateLoan({
        calculationType: 'rate',
        loanType: 'regular',
        principal: 1_000_000,
        annualInterestRatePercent: 10,
        months: 12,
      }),
    ).toThrow('قسط ماهانه برای محاسبه نرخ لازم است.');

    expect(() =>
      calculateLoan({
        calculationType: 'principal',
        loanType: 'regular',
        principal: 1_000_000,
        annualInterestRatePercent: 10,
        months: 12,
      }),
    ).toThrow('قسط ماهانه برای محاسبه مبلغ وام لازم است.');

    expect(() =>
      calculateLoan({
        calculationType: 'months',
        loanType: 'regular',
        principal: 1_000_000,
        annualInterestRatePercent: 10,
        months: 12,
      }),
    ).toThrow('قسط ماهانه برای محاسبه مدت لازم است.');

    expect(() =>
      calculateLoan({
        calculationType: 'installment',
        loanType: 'stepped',
        principal: 1_000_000,
        annualInterestRatePercent: 10,
        months: 12,
        stepMonths: 0,
        stepRateIncrease: 1,
      }),
    ).toThrow('تعداد ماه هر مرحله باید بیشتر از صفر باشد.');

    expect(() =>
      calculateLoan({
        calculationType: 'months',
        loanType: 'regular',
        principal: 1_000_000,
        annualInterestRatePercent: 10,
        months: 12,
        monthlyPayment: 100,
      }),
    ).toThrow('ورودی‌ها باعث محاسبه نامعتبر شدند.');

    expect(() =>
      calculateLoan({
        calculationType: 'months',
        loanType: 'regular',
        principal: 0,
        annualInterestRatePercent: 10,
        months: 12,
        monthlyPayment: 10000,
      }),
    ).toThrow('مبلغ وام باید بیشتر از صفر باشد.');

    expect(() =>
      calculateLoan({
        calculationType: 'months',
        loanType: 'regular',
        principal: 1_000_000,
        annualInterestRatePercent: 10,
        months: 12,
        monthlyPayment: -1,
      }),
    ).toThrow('قسط ماهانه باید بیشتر از صفر باشد.');
  });

  it('throws on unknown calculation type', () => {
    expect(() =>
      calculateLoan({
        calculationType: 'unknown' as never,
        loanType: 'regular',
        principal: 1_000_000,
        annualInterestRatePercent: 10,
        months: 12,
      }),
    ).toThrow('نوع محاسبه نامعتبر است.');
  });

  it('returns ToolResult for calculation', () => {
    const result = calculateLoanResult({
      calculationType: 'installment',
      loanType: 'regular',
      principal: 1_000_000,
      annualInterestRatePercent: 12,
      months: 12,
    });
    expect(result.ok).toBe(true);
  });
});
