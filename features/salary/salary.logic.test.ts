import { describe, it, expect } from 'vitest';
import { calculateSalary, calculateGrossFromNet, calculateMinimumWage } from './index';
import { getSalaryLaws } from './salary.laws';

describe('salary logic', () => {
  it('includes the optional worker food allowance exactly once', () => {
    const input = {
      baseSalary: 15_000_000,
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
    expect(calculateSalary(input).grossSalary).toBe(18_000_000);
    expect(calculateSalary({ ...input, hasWorkerCoupon: true }).grossSalary).toBe(20_200_000);
  });
  it('calculates gross and net salary with deductions', () => {
    const result = calculateSalary({
      baseSalary: 15_000_000,
      workingDays: 30,
      workExperienceYears: 2,
      overtimeHours: 10,
      nightOvertimeHours: 0,
      holidayOvertimeHours: 0,
      missionDays: 0,
      isMarried: true,
      numberOfChildren: 1,
      hasWorkerCoupon: true,
      hasTransportation: true,
      otherBenefits: 0,
      otherDeductions: 0,
      isDevelopmentZone: false,
    });

    expect(result.grossSalary).toBeGreaterThan(0);
    expect(result.netSalary).toBeLessThanOrEqual(result.grossSalary);
    expect(result.summary.totalDeductions).toBeCloseTo(
      result.summary.insurance + result.summary.tax,
      2,
    );
  });

  it('applies verified monthly brackets and capped insurance without duplicating food allowance', () => {
    const result = calculateSalary({
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
    });

    expect(result.summary.insurance).toBeCloseTo(8_146_519.5, 6);
    expect(result.summary.tax).toBeCloseTo(9_370_696.1, 6);
    expect(result.netSalary).toBeCloseTo(105_482_784.4, 6);
  });

  it('solves gross from target net salary', () => {
    const targetNet = 12_000_000;
    const result = calculateGrossFromNet(targetNet, {
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
    });

    expect(Math.abs(result.netSalary - targetNet)).toBeLessThan(50_000);
  });

  it('normalizes working days when input is invalid', () => {
    const baseInput = {
      baseSalary: 12_000_000,
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

    const normal = calculateSalary({ ...baseInput, workingDays: 30 });
    const normalized = calculateSalary({ ...baseInput, workingDays: 0 });

    expect(normalized.grossSalary).toBeCloseTo(normal.grossSalary, 2);
    expect(normalized.netSalary).toBeCloseTo(normal.netSalary, 2);
  });

  it('throws for invalid target net salary', () => {
    expect(() =>
      calculateGrossFromNet(0, {
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
      }),
    ).toThrow('حقوق خالص نامعتبر است.');
  });

  it('returns salary laws for a specific year', () => {
    const laws = getSalaryLaws({ year: 2026 });
    expect(laws.year).toBe(2026);
    expect(laws.minimumWage).toBe(16_625_550);
    expect(laws.taxExemption).toBe(40_000_000);
    expect(laws.taxBrackets).toHaveLength(6);
  });

  it('calculates minimum wage output', () => {
    const result = calculateMinimumWage({
      workExperienceYears: 1,
      isMarried: true,
      numberOfChildren: 1,
      isDevelopmentZone: false,
      otherDeductions: 0,
    });

    expect(result.marriageAllowance).toBe(500_000);
    expect(result.childAllowance).toBe(1_662_555);
    expect(result.seniorityAllowance).toBe(500_001);
    expect(result.totalGross).toBe(24_488_106);
    expect(result.taxAmount).toBe(0);
    expect(result.netSalary).toBeLessThanOrEqual(result.totalGross);
  });

  it('does not grant seniority pay below one year of work experience', () => {
    const result = calculateMinimumWage({
      workExperienceYears: 0,
      isMarried: false,
      numberOfChildren: 0,
      isDevelopmentZone: false,
      otherDeductions: 0,
    });

    expect(result.seniorityAllowance).toBe(0);
  });
});
