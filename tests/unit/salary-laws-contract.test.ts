import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('salary laws data contract', () => {
  it('keeps versioned local payload with yearly entries', () => {
    const raw = readFileSync(resolve(process.cwd(), 'data/salary-laws/v1.json'), 'utf8');
    const parsed = JSON.parse(raw) as {
      version: string;
      updatedAt: string;
      source: string;
      region: string;
      years: Record<string, { minimumWage: number; taxExemption: number }>;
    };

    expect(parsed.version).toBe('v1');
    expect(parsed.source).toBe('local-versioned-json');
    expect(typeof parsed.updatedAt).toBe('string');
    expect(Object.keys(parsed.years).length).toBeGreaterThan(0);

    for (const year of Object.keys(parsed.years)) {
      expect(Number.isFinite(Number(year))).toBe(true);
      expect(parsed.years[year]?.minimumWage).toBeGreaterThan(0);
      expect(parsed.years[year]?.taxExemption).toBeGreaterThan(0);
    }
  });

  it('ships 1405 Iran baseline values under 2026 entry', () => {
    const raw = readFileSync(resolve(process.cwd(), 'data/salary-laws/v1.json'), 'utf8');
    const parsed = JSON.parse(raw) as {
      updatedAt: string;
      years: Record<
        string,
        {
          minimumWage: number;
          taxExemption: number;
          housingAllowance: number;
          foodAllowance: number;
          childAllowance: number;
          marriageAllowance: number;
          seniorityAllowance: number;
          taxBrackets: Array<{ upTo: number | null; rate: number }>;
        }
      >;
    };

    expect(parsed.updatedAt).toBe('2026-04-26');
    expect(parsed.years['2026']).toMatchObject({
      minimumWage: 15_066_904,
      taxExemption: 40_000_000,
      housingAllowance: 3_000_000,
      foodAllowance: 2_200_000,
      childAllowance: 1_662_555,
      marriageAllowance: 500_000,
      seniorityAllowance: 500_000,
    });
    expect(parsed.years['2026']?.taxBrackets).toHaveLength(6);
  });
});
