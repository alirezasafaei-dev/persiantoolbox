import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('deployment readiness reports contract', () => {
  it('stores at least one readiness report with required fields', () => {
    const reportsDir = resolve(process.cwd(), 'docs/deployment/reports');
    const files = readdirSync(reportsDir).filter((name) => name.endsWith('.json'));

    expect(files.length).toBeGreaterThan(0);

    for (const file of files) {
      const raw = readFileSync(resolve(reportsDir, file), 'utf8');
      const parsed = JSON.parse(raw) as {
        version: number;
        generatedAt: string;
        tier: 'core' | 'extended';
        overallStatus: 'passed' | 'failed' | 'warning';
        steps: Array<{
          id: string;
          command: string;
          status: 'passed' | 'failed';
          tier: 'core' | 'extended';
          blocking: boolean;
          durationMs: number;
        }>;
      };

      expect(parsed.version).toBe(1);
      expect(parsed.generatedAt.length).toBeGreaterThan(10);
      expect(['core', 'extended']).toContain(parsed.tier);
      expect(['passed', 'failed', 'warning']).toContain(parsed.overallStatus);
      expect(Array.isArray(parsed.steps)).toBe(true);
      expect(parsed.steps.length).toBeGreaterThan(0);

      for (const step of parsed.steps) {
        expect(step.id.length).toBeGreaterThan(2);
        expect(step.command.startsWith('pnpm ')).toBe(true);
        expect(['passed', 'failed']).toContain(step.status);
      }
    }
  });
});
