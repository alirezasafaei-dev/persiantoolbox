import { describe, expect, it } from 'vitest';
import { financeDataVersions, getFinanceDataVersion } from '@/lib/finance-data-version';

describe('finance data version contract', () => {
  it('keeps version info for all finance tools', () => {
    const tools = financeDataVersions.map((item) => item.tool).sort();
    expect(tools).toContain('salary');
    expect(tools).toContain('loan');
    expect(tools).toContain('interest');
    expect(tools.length).toBeGreaterThanOrEqual(3);
  });

  it('provides valid version payload for salary', () => {
    const salary = getFinanceDataVersion('salary');
    expect(salary).toBeDefined();
    expect(salary!.version).toMatch(/^v\d+/);
    expect(salary!.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('provides valid version payload for insurance', () => {
    const insurance = getFinanceDataVersion('insurance');
    expect(insurance).toBeDefined();
    expect(insurance!.version).toMatch(/^v\d+/);
  });
});
