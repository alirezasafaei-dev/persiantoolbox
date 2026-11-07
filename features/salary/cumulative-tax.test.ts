import { describe, expect, it } from 'vitest';
import { calculateCumulativePayrollTax } from './cumulative-tax';
import { calculateAnnualTaxBalance } from './annual-tax';

const input = { month: 1, ordinary: 0, special: 0, research: 0, previousTax: 0 };

describe('INTA1405 cumulative A/B/D calculation', () => {
  it('handles zero bases without dividing by zero', () => {
    expect(calculateCumulativePayrollTax(input)).toMatchObject({
      ordinaryExemption: 0,
      specialExemption: 0,
      ordinaryTax: 0,
      specialTax: 0,
      researchTax: 0,
      cumulativeTax: 0,
      currentTax: 0,
      payable: 0,
      credit: 0,
    });
  });
  it.each([
    [1, 100_000_000, 7_000_000],
    [2, 200_000_000, 14_000_000],
    [12, 1_200_000_000, 84_000_000],
  ])(
    'uses payroll/payment list month %i regardless of transmission date',
    (month, ordinary, tax) => {
      expect(
        calculateCumulativePayrollTax({ ...input, month, ordinary }).cumulativeTax,
      ).toBeCloseTo(tax);
    },
  );
  it.each([
    [40, 0],
    [80, 4],
    [100, 7],
    [120, 11],
    [140, 16],
    [150, 19],
  ])('uses ordinary monthly boundary %im', (base, tax) => {
    expect(
      calculateCumulativePayrollTax({ ...input, ordinary: base * 1e6 }).ordinaryTax,
    ).toBeCloseTo(tax * 1e6);
  });
  it('allocates exemption to A/B proportionally and shifts ALL ordinary thresholds', () => {
    const result = calculateCumulativePayrollTax({ ...input, ordinary: 100e6, special: 100e6 });
    // E=40m; A/B each20m; ordinary thresholds20/60/80/100/120m.
    // Ordinary tax4+3+4=11m; B=(100-20)*10%=8m.
    expect(result).toMatchObject({
      ordinaryExemption: 20e6,
      specialExemption: 20e6,
      ordinaryTax: 11e6,
      specialTax: 8e6,
      cumulativeTax: 19e6,
    });
  });
  it('keeps cumulative bracket widths while allocating an unequal A/B share', () => {
    const r = calculateCumulativePayrollTax({
      ...input,
      month: 2,
      ordinary: 300e6,
      special: 100e6,
    });
    // E80m => A60m/B20m; A thresholds60/140/180/220/260m => 8+6+8+10+12=44m.
    expect(r).toMatchObject({
      ordinaryExemption: 60e6,
      specialExemption: 20e6,
      ordinaryTax: 44e6,
      specialTax: 8e6,
      cumulativeTax: 52e6,
    });
  });
  it('taxes B at10% after its exemption, and D at5% without sharing exemption', () => {
    expect(
      calculateCumulativePayrollTax({ ...input, special: 100e6, research: 200e6 }),
    ).toMatchObject({
      ordinaryExemption: 0,
      specialExemption: 40e6,
      specialTax: 6e6,
      researchTax: 10e6,
      cumulativeTax: 16e6,
    });
    expect(calculateCumulativePayrollTax({ ...input, research: 20e6 }).cumulativeTax).toBe(1e6);
  });
  it('does not charge exempt A/B even when D is present', () => {
    expect(
      calculateCumulativePayrollTax({ ...input, ordinary: 10e6, special: 10e6, research: 100e6 }),
    ).toMatchObject({
      ordinaryTax: 0,
      specialTax: 0,
      researchTax: 5e6,
      cumulativeTax: 5e6,
    });
  });
  it('subtracts previous computed lists once and preserves signed correction', () => {
    const r = calculateCumulativePayrollTax({ ...input, ordinary: 100e6, previousTax: 9e6 });
    expect(r).toMatchObject({ cumulativeTax: 7e6, currentTax: -2e6, payable: 0, credit: 2e6 });
    expect(
      calculateCumulativePayrollTax({ ...input, ordinary: 100e6, previousTax: 3e6 }),
    ).toMatchObject({ currentTax: 4e6, payable: 4e6, credit: 0 });
  });
  it('does not grant another month of exemption for another list in the same month', () => {
    const first = calculateCumulativePayrollTax({ ...input, ordinary: 100e6 });
    const second = calculateCumulativePayrollTax({
      ...input,
      ordinary: 150e6,
      previousTax: first.cumulativeTax,
    });
    expect(second.payable).toBe(12e6);
  });
  it.each([0, 13, 1.5, NaN, Infinity])('rejects invalid filing month %s', (month) => {
    expect(() => calculateCumulativePayrollTax({ ...input, month })).toThrow();
  });
  for (const key of ['ordinary', 'special', 'research', 'previousTax'] as const) {
    it.each([-1, NaN, Infinity, Number.MAX_VALUE])(`rejects invalid ${key} %s`, (bad) => {
      expect(() => calculateCumulativePayrollTax({ ...input, [key]: bad })).toThrow();
    });
  }
  it('matches existing ordinary full-year balance without duplicate exemption', () => {
    for (const ordinary of [0, 480e6, 600e6, 960e6, 1200e6, 1440e6, 1680e6, 1800e6]) {
      const r = calculateCumulativePayrollTax({ ...input, month: 12, ordinary, previousTax: 5e6 });
      const annual = calculateAnnualTaxBalance(ordinary, 5e6);
      expect(r.cumulativeTax).toBeCloseTo(annual.annualTax);
      expect(r.payable).toBeCloseTo(annual.remaining);
      expect(r.credit).toBeCloseTo(annual.overpaid);
    }
  });
});
