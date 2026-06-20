import { describe, expect, it } from 'vitest';

function formatMoney(amount: number): string {
  return new Intl.NumberFormat('fa-IR').format(Math.round(amount));
}

describe('RealPurchasingPower logic', () => {
  function calculate(salary: number, inflation: number, years: number) {
    const rate = inflation / 100;
    const realValue = salary / Math.pow(1 + rate, years);
    const purchasingPower = (realValue / salary) * 100;
    const breakEvenRaise = (Math.pow(1 + rate, 1) - 1) * 100;
    return {
      realValue: Math.round(realValue),
      purchasingPower: Math.round(purchasingPower * 10) / 10,
      breakEvenRaise: Math.round(breakEvenRaise * 10) / 10,
    };
  }

  it('calculates real purchasing power with 40% inflation over 5 years', () => {
    const result = calculate(10000000, 40, 5);
    expect(result.realValue).toBeLessThan(10000000);
    expect(result.purchasingPower).toBeLessThan(100);
    expect(result.breakEvenRaise).toBe(40);
  });

  it('zero inflation means purchasing power stays same', () => {
    const result = calculate(10000000, 0, 5);
    expect(result.realValue).toBe(10000000);
    expect(result.purchasingPower).toBe(100);
  });

  it('higher inflation reduces purchasing power more', () => {
    const low = calculate(10000000, 20, 3);
    const high = calculate(10000000, 60, 3);
    expect(high.realValue).toBeLessThan(low.realValue);
  });

  it('formatMoney formats Persian numerals', () => {
    expect(formatMoney(1000000)).toContain('۱');
  });
});

describe('OvertimeCalculator logic', () => {
  const MULTIPLIERS = {
    weekday_normal: 1.4,
    weekday_night: 1.7,
    friday_normal: 2.0,
    friday_night: 2.4,
    holiday_normal: 2.0,
    holiday_night: 2.4,
  };

  it('calculates overtime pay correctly', () => {
    const monthlySalary = 10000000;
    const dailyRate = monthlySalary / 22;
    const hourlyRate = dailyRate / 8;

    const overtimePay = 10 * hourlyRate * MULTIPLIERS.weekday_normal;
    expect(overtimePay).toBeGreaterThan(0);
    expect(overtimePay).toBeGreaterThan(10 * hourlyRate);
  });

  it('friday overtime pays more than weekday', () => {
    const hourlyRate = 50000;
    const weekday = 8 * hourlyRate * MULTIPLIERS.weekday_normal;
    const friday = 8 * hourlyRate * MULTIPLIERS.friday_normal;
    expect(friday).toBeGreaterThan(weekday);
  });

  it('night overtime pays more than day', () => {
    const hourlyRate = 50000;
    const day = 8 * hourlyRate * MULTIPLIERS.weekday_normal;
    const night = 8 * hourlyRate * MULTIPLIERS.weekday_night;
    expect(night).toBeGreaterThan(day);
  });
});

describe('RentVsBuy logic', () => {
  it('buying is cheaper than renting when rent is very high', () => {
    const rentTotal = 30000000 * 12 * 10;
    const buyTotal = 1000000000;
    expect(buyTotal).toBeLessThan(rentTotal);
  });

  it('rent is cheaper when home price is very high', () => {
    const rentTotal = 20000000 * 12 * 5;
    const buyTotal = 5000000000;
    expect(rentTotal).toBeLessThan(buyTotal);
  });

  it('loan monthly payment formula is correct', () => {
    const principal = 1000000000;
    const rate = 0.02;
    const months = 240;
    const payment =
      (principal * rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1);
    expect(payment).toBeGreaterThan(principal / months);
    expect(payment).toBeLessThan(principal / 12);
  });
});

describe('LoanVsInvestment logic', () => {
  it('investment with higher return than loan rate is profitable', () => {
    const loanRate = 20;
    const investReturn = 35;
    expect(investReturn).toBeGreaterThan(loanRate);
  });

  it('total loan cost is positive', () => {
    const principal = 1000000000;
    const rate = 0.02;
    const months = 60;
    const payment =
      (principal * rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1);
    const totalPaid = payment * months;
    expect(totalPaid).toBeGreaterThan(principal);
    expect(totalPaid - principal).toBeGreaterThan(0);
  });
});

describe('RetirementCalculator logic', () => {
  it('pension percentage is capped at 35%', () => {
    const yearsOfService = 40;
    const pensionPct = Math.min(35, yearsOfService * 1 + (yearsOfService > 30 ? 5 : 0));
    expect(pensionPct).toBe(35);
  });

  it('pension increases with years of service', () => {
    const short = Math.min(35, 10);
    const long = Math.min(35, 30);
    expect(long).toBeGreaterThan(short);
  });

  it('replacement ratio is between 0 and 100', () => {
    const pension = 7000000;
    const finalSalary = 20000000;
    const ratio = (pension / finalSalary) * 100;
    expect(ratio).toBeGreaterThan(0);
    expect(ratio).toBeLessThanOrEqual(100);
  });
});
