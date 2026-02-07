import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('launch smoke report contract', () => {
  it('stores at least one launch smoke report with required fields', () => {
    const reportsDir = resolve(process.cwd(), 'docs/release/reports');
    const files = readdirSync(reportsDir).filter((name) => name.startsWith('launch-smoke-'));

    expect(files.length).toBeGreaterThan(0);

    for (const file of files) {
      const raw = readFileSync(resolve(reportsDir, file), 'utf8');
      const parsed = JSON.parse(raw) as {
        version: number;
        generatedAt: string;
        tier: 'core' | 'extended';
        overallStatus: 'passed' | 'failed' | 'warning';
        launchRecommendation: 'proceed' | 'hold' | 'review';
        suites: Array<{
          id: string;
          command: string;
          status: 'passed' | 'failed';
          tier: 'core' | 'extended';
          blocking: boolean;
        }>;
      };

      expect(parsed.version).toBe(1);
      expect(parsed.generatedAt.length).toBeGreaterThan(10);
      expect(['core', 'extended']).toContain(parsed.tier);
      expect(['passed', 'failed', 'warning']).toContain(parsed.overallStatus);
      expect(['proceed', 'hold', 'review']).toContain(parsed.launchRecommendation);
      expect(Array.isArray(parsed.suites)).toBe(true);
      expect(parsed.suites.length).toBeGreaterThan(0);

      for (const suite of parsed.suites) {
        expect(suite.id.length).toBeGreaterThan(2);
        expect(/(^|\s)pnpm\s/.test(suite.command)).toBe(true);
      }
    }
  });
});
