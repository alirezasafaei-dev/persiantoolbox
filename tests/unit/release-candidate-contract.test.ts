import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

type Gate = {
  id: string;
  command: string;
  tier: 'core' | 'extended';
  blocking: boolean;
};

describe('release candidate checklist contract', () => {
  it('keeps deterministic RC gates and mandatory commands', () => {
    const raw = readFileSync(
      resolve(process.cwd(), 'docs/release-candidate-checklist.json'),
      'utf8',
    );
    const parsed = JSON.parse(raw) as {
      version: number;
      envGates: string[];
      securityGates: string[];
      qualityGates: Gate[];
      releaseOutputs: string[];
    };

    expect(parsed.version).toBe(1);
    expect(parsed.envGates.length).toBeGreaterThan(0);
    expect(parsed.securityGates.length).toBeGreaterThan(0);
    expect(parsed.releaseOutputs.length).toBeGreaterThan(0);

    const ids = parsed.qualityGates.map((gate) => gate.id);
    expect(ids).toEqual(
      expect.arrayContaining([
        'rc_deploy_contract',
        'rc_deploy_core_run',
        'rc_ci_quick',
        'rc_build',
      ]),
    );

    const hasExtended = parsed.qualityGates.some((gate) => gate.tier === 'extended');
    expect(hasExtended).toBe(true);

    for (const gate of parsed.qualityGates) {
      expect(gate.command.startsWith('pnpm ')).toBe(true);
      expect(typeof gate.blocking).toBe('boolean');
    }
  });
});
