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
});
