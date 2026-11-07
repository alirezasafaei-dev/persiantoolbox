import { describe, it, expect } from 'vitest';
import { calculateAnnualTaxBalance } from './annual-tax';
describe('1405 full-year tax balance', () => {
  it.each([
    [0, 0],
    [480_000_000, 0],
    [600_000_000, 12_000_000],
    [960_000_000, 48_000_000],
    [1_200_000_000, 84_000_000],
    [1_440_000_000, 132_000_000],
    [1_680_000_000, 192_000_000],
    [1_800_000_000, 228_000_000],
  ])('taxes annual base%i at%i', (base, tax) => {
    expect(calculateAnnualTaxBalance(base, 0).annualTax).toBeCloseTo(tax, 5);
  });
  it('subtracts prior withholding once and preserves possible overpayment', () => {
    expect(calculateAnnualTaxBalance(600_000_000, 5_000_000)).toEqual({
      annualTax: 12_000_000,
      remaining: 7_000_000,
      overpaid: 0,
    });
    expect(calculateAnnualTaxBalance(600_000_000, 20_000_000)).toEqual({
      annualTax: 12_000_000,
      remaining: 0,
      overpaid: 8_000_000,
    });
  });
  it.each([-1, NaN, Infinity])('rejects invalid amounts %s', (bad) => {
    expect(() => calculateAnnualTaxBalance(bad, 0)).toThrow();
    expect(() => calculateAnnualTaxBalance(0, bad)).toThrow();
  });
});

it.each([
  [480_000_000, 0.1],
  [960_000_000, 0.15],
  [1_200_000_000, 0.2],
  [1_440_000_000, 0.25],
  [1_680_000_000, 0.3],
])('checks marginal annual rate above%i', (base, rate) => {
  expect(
    calculateAnnualTaxBalance(base + 1, 0).annualTax - calculateAnnualTaxBalance(base, 0).annualTax,
  ).toBeCloseTo(rate, 5);
});
