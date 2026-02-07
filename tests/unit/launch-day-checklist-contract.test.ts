import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

type SmokeSuite = {
  id: string;
  command: string;
  tier: 'core' | 'extended';
  blocking: boolean;
};

describe('launch day checklist contract', () => {
  it('keeps deterministic launch smoke suites and mandatory commands', () => {
    const raw = readFileSync(resolve(process.cwd(), 'docs/launch-day-checklist.json'), 'utf8');
    const parsed = JSON.parse(raw) as {
      version: number;
      launchReadiness: string[];
      smokeSuites: SmokeSuite[];
      launchOutputs: string[];
    };

    expect(parsed.version).toBe(1);
    expect(parsed.launchReadiness.length).toBeGreaterThan(0);
    expect(parsed.launchOutputs.length).toBeGreaterThan(0);

    const ids = parsed.smokeSuites.map((suite) => suite.id);
    expect(ids).toEqual(expect.arrayContaining(['launch_smoke_routes', 'launch_smoke_consent']));

    const hasExtended = parsed.smokeSuites.some((suite) => suite.tier === 'extended');
    expect(hasExtended).toBe(true);

    for (const suite of parsed.smokeSuites) {
      expect(/(^|\s)pnpm\s/.test(suite.command)).toBe(true);
      expect(typeof suite.blocking).toBe('boolean');
    }
  });
});
