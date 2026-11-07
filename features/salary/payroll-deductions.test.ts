import { describe, expect, it } from 'vitest';
import { calculateSalary, calculateMinimumWage, calculateGrossFromNet } from './index';
import type { SalaryInput } from './salary.types';
import { calculateMonthlySalaryTax, calculateMonthlyDeductions } from './payroll-deductions';

const input: SalaryInput = {
  baseSalary: 120_000_000,
  workingDays: 30,
  workExperienceYears: 0,
  overtimeHours: 0,
  nightOvertimeHours: 0,
  holidayOvertimeHours: 0,
  missionDays: 0,
  isMarried: false,
  numberOfChildren: 0,
  hasWorkerCoupon: false,
  hasTransportation: false,
  otherBenefits: 0,
  otherDeductions: 0,
  isDevelopmentZone: false,
};

describe('1405 employee monthly deductions', () => {
  it.each([
    [0, 0],
    [40_000_000, 0],
    [50_000_000, 1_000_000],
    [80_000_000, 4_000_000],
    [100_000_000, 7_000_000],
    [120_000_000, 11_000_000],
    [140_000_000, 16_000_000],
    [150_000_000, 19_000_000],
  ])('taxes a monthly taxable base of %i at %i', (base, tax) => {
    expect(calculateMonthlySalaryTax(base)).toBe(tax);
  });

  it.each([
    [40_000_000, 0.1],
    [80_000_000, 0.15],
    [100_000_000, 0.2],
    [120_000_000, 0.25],
    [140_000_000, 0.3],
  ])('uses marginal rates just above %i', (base, rate) => {
    expect(calculateMonthlySalaryTax(base + 1) - calculateMonthlySalaryTax(base)).toBeCloseTo(
      rate,
      6,
    );
  });

  it('keeps the insurance ceiling distinct from the tax exemption', () => {
    const result = calculateMonthlyDeductions({ gross: 150_000_000 });
    expect(result.insuranceBase).toBe(116_378_850);
    expect(result.taxableIncome).toBeCloseTo(141_853_480.5, 6);
    expect(result.tax).toBeCloseTo(16_556_044.15, 6);
  });
  it('uses the sevenfold daily insurance ceiling and the official tax table', () => {
    const result = calculateSalary(input);
    expect(result.grossSalary).toBe(123_000_000);
    expect(result.summary.insurance).toBeCloseTo(8_146_519.5, 6);
    // Housing is exempt. Tax base = 120m - 8,146,519.5.
    expect(result.summary.tax).toBeCloseTo(9_370_696.1, 6);
    expect(result.netSalary).toBeCloseTo(105_482_784.4, 6);
  });

  it.each([
    [29, 7_874_968.85],
    [30, 8_146_519.5],
    [31, 8_418_070.15],
  ])('caps insurance using %i insured days', (days, premium) => {
    expect(
      calculateSalary({ ...input, baseSalary: 300_000_000, workingDays: days }).summary.insurance,
    ).toBeCloseTo(premium, 6);
  });

  it('does not insure child allowance or mission payments', () => {
    const ordinary = calculateSalary({ ...input, baseSalary: 50_000_000 });
    const withExempt = calculateSalary({
      ...input,
      baseSalary: 50_000_000,
      numberOfChildren: 2,
      insuranceContributionDays: 720,
      missionDays: 3,
    });
    expect(withExempt.grossSalary).toBeGreaterThan(ordinary.grossSalary);
    expect(withExempt.summary.insurance).toBe(ordinary.summary.insurance);
    expect(withExempt.summary.tax).toBe(ordinary.summary.tax);
  });

  it('insures worker food once, but excludes it from tax', () => {
    const ordinary = calculateSalary({ ...input, baseSalary: 50_000_000 });
    const withFood = calculateSalary({ ...input, baseSalary: 50_000_000, hasWorkerCoupon: true });
    expect(withFood.grossSalary - ordinary.grossSalary).toBe(2_200_000);
    expect(withFood.summary.insurance - ordinary.summary.insurance).toBeCloseTo(154_000, 6);
    expect(ordinary.summary.tax - withFood.summary.tax).toBeCloseTo(15_400, 6);
  });

  it('also excludes children from insurance in minimum-wage mode', () => {
    const params = {
      workExperienceYears: 0,
      isMarried: false,
      numberOfChildren: 0,
      isDevelopmentZone: false,
      otherDeductions: 0,
    };
    const ordinary = calculateMinimumWage(params);
    const withChild = calculateMinimumWage({
      ...params,
      numberOfChildren: 1,
      insuranceContributionDays: 720,
    });
    expect(withChild.insuranceAmount).toBe(ordinary.insuranceAmount);
    expect(withChild.netSalary - ordinary.netSalary).toBeCloseTo(1_662_555, 6);
  });

  it('retains net-to-gross accuracy above the insurance ceiling', () => {
    const result = calculateGrossFromNet(180_000_000, input);
    expect(result.netSalary).toBeCloseTo(180_000_000, 4);
    expect(result.summary.insurance).toBeCloseTo(8_146_519.5, 6);
  });
});

describe('consistent whole insured days', () => {
  it('uses one whole day count for gross and insurance', () => {
    expect(calculateSalary({ ...input, workingDays: 29.9 })).toEqual(
      calculateSalary({ ...input, workingDays: 29 }),
    );
  });
});

it('does not charge deductions on zero gross from invalid negative base', () => {
  const result = calculateSalary({ ...input, baseSalary: -30_000_000, missionDays: 30 });
  expect(result.grossSalary).toBe(0);
  expect(result.summary.insurance).toBe(0);
  expect(result.summary.tax).toBe(0);
});

describe('qualifying mission allowance', () => {
  it('adds one daily fixed wage for each qualifying mission day, excluding it from deductions', () => {
    const base = { ...input, baseSalary: 30_000_000, workExperienceYears: 1 };
    const normal = calculateSalary(base);
    const mission = calculateSalary({ ...base, missionDays: 2 });
    const allowance = ((30_000_000 + 500_001) / 30) * 2;
    expect(mission.grossSalary - normal.grossSalary).toBeCloseTo(allowance, 6);
    expect(mission.summary.insurance).toBeCloseTo(normal.summary.insurance, 6);
    expect(mission.summary.tax).toBeCloseTo(normal.summary.tax, 6);
    expect(mission.netSalary - normal.netSalary).toBeCloseTo(allowance, 6);
  });
});

it('excludes mission from taxable income above the exemption with capped insurance', () => {
  const base = { ...input, baseSalary: 120_000_000, workExperienceYears: 1 };
  const normal = calculateSalary(base),
    mission = calculateSalary({ ...base, missionDays: 2 });
  expect(normal.summary.tax).toBeGreaterThan(0);
  expect(mission.summary.tax).toBeCloseTo(normal.summary.tax, 6);
  expect(mission.summary.insurance).toBeCloseTo(normal.summary.insurance, 6);
  expect(mission.netSalary - normal.netSalary).toBeCloseTo(((120_000_000 + 500_001) / 30) * 2, 6);
});

describe('unsupported geographic tax regime', () => {
  it('does not invent gross pay or silently ignore geographic eligibility', () => {
    expect(() => calculateSalary({ ...input, isDevelopmentZone: true })).toThrow(
      'محاسبهٔ منطقه‌ای',
    );
    expect(() =>
      calculateMinimumWage({
        workExperienceYears: 0,
        isMarried: false,
        numberOfChildren: 0,
        isDevelopmentZone: true,
        otherDeductions: 0,
      }),
    ).toThrow('محاسبهٔ منطقه‌ای');
    expect(() => calculateGrossFromNet(50_000_000, { ...input, isDevelopmentZone: true })).toThrow(
      'محاسبهٔ منطقه‌ای',
    );
  });
});

describe('child insurance eligibility', () => {
  it('requires720 insured days and eligible whole children', () => {
    const p = {
      workExperienceYears: 0,
      isMarried: false,
      numberOfChildren: 1,
      isDevelopmentZone: false,
      otherDeductions: 0,
    };
    expect(calculateMinimumWage({ ...p, insuranceContributionDays: 719 }).childAllowance).toBe(0);
    expect(calculateMinimumWage({ ...p, insuranceContributionDays: 720 }).childAllowance).toBe(
      1_662_555,
    );
    expect(() => calculateMinimumWage(p)).toThrow('سابقهٔ بیمه');
    expect(() =>
      calculateSalary({ ...input, numberOfChildren: 1.5, insuranceContributionDays: 720 }),
    ).toThrow('فرزند');
  });
});
