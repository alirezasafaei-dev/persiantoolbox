import { describe, expect, it } from 'vitest';
import { calculateRegionalPayrollTax } from './regional-tax';

const input = { month: 1, ordinary: 100e6, special: 0, research: 0, previousTax: 0 };
const confirmed = {
  noOtherReliefConfirmed: true,
  currentOfficialListConfirmed: true,
  employmentConfirmed: true,
  entirePeriodConfirmed: true,
};

describe('article92 whole-period ordinary-income relief', () => {
  it('forgives half the tax, not half the income', () => {
    expect(calculateRegionalPayrollTax(input, confirmed)).toMatchObject({
      taxBeforeRelief: 7e6,
      regionalRelief: 3.5e6,
      cumulativeTax: 3.5e6,
      payable: 3.5e6,
    });
  });
  it('subtracts previous computed tax only after forgiveness', () => {
    expect(calculateRegionalPayrollTax({ ...input, previousTax: 5e6 }, confirmed)).toMatchObject({
      currentTax: -1.5e6,
      payable: 0,
      credit: 1.5e6,
    });
  });
  it('retains cumulative monthly bands', () => {
    expect(
      calculateRegionalPayrollTax({ ...input, month: 2, ordinary: 200e6 }, confirmed).cumulativeTax,
    ).toBe(7e6);
  });
  it('keeps zero tax zero', () => {
    expect(calculateRegionalPayrollTax({ ...input, ordinary: 40e6 }, confirmed).cumulativeTax).toBe(
      0,
    );
  });
  for (const key of Object.keys(confirmed) as (keyof typeof confirmed)[]) {
    it(`blocks missing ${key}`, () => {
      expect(() => calculateRegionalPayrollTax(input, { ...confirmed, [key]: false })).toThrow();
    });
  }
  it.each(['special', 'research'] as const)('rejects unsupported %s mixed income', (key) => {
    expect(() => calculateRegionalPayrollTax({ ...input, [key]: 1 }, confirmed)).toThrow();
  });
  it.each([NaN, -1, Infinity])('rejects invalid ordinary base%s', (ordinary) => {
    expect(() => calculateRegionalPayrollTax({ ...input, ordinary }, confirmed)).toThrow();
  });
});
