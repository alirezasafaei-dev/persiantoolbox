import { describe, expect, it } from 'vitest';
import { financeDataVersions, getFinanceDataVersion } from '@/lib/finance-data-version';

describe('finance data version contract', () => {
  it('keeps version info for salary/loan/interest', () => {
    expect(financeDataVersions.map((item) => item.tool).sort()).toEqual([
      'interest',
      'loan',
      'salary',
    ]);
  });

  it('provides valid version payload', () => {
    const salary = getFinanceDataVersion('salary');
    expect(salary.version).toMatch(/^v\d+/);
    expect(salary.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
