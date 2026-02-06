import { describe, expect, it } from 'vitest';
import * as utils from '@/shared/utils';
import * as numbers from '@/shared/utils/numbers';
import * as localization from '@/shared/utils/localization';
import * as validation from '@/shared/utils/validation';
import * as finance from '@/shared/utils/finance';
import * as result from '@/shared/utils/result';

describe('shared exports', () => {
  it('re-exports utilities', () => {
    expect(typeof utils.parseLooseNumber).toBe('function');
    expect(typeof utils.convertDate).toBe('function');
    expect(typeof utils.calculateCompoundInterest).toBe('function');
    expect(typeof utils.isValidNationalId).toBe('function');
    expect(typeof utils.ok).toBe('function');
    expect(typeof numbers.toEnglishDigits).toBe('function');
    expect(typeof localization.toPersianNumbers).toBe('function');
    expect(typeof validation.normalizeIranianMobile).toBe('function');
    expect(typeof finance.calculateTax).toBe('function');
    expect(typeof result.fromError).toBe('function');
  });

  it('keeps stable aliases between root and module exports', () => {
    expect(utils.parseLooseNumber).toBe(numbers.parseLooseNumber);
    expect(utils.toPersianNumbers).toBe(localization.toPersianNumbers);
    expect(utils.isValidNationalId).toBe(validation.isValidNationalId);
    expect(utils.calculateTax).toBe(finance.calculateTax);
    expect(utils.ok).toBe(result.ok);
  });
});
