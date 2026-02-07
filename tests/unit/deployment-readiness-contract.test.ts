import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

type QualityGate = {
  id: string;
  command: string;
  tier: 'core' | 'extended';
  blocking: boolean;
};

describe('deployment readiness contract', () => {
  it('keeps deterministic deploy gates and required env set', () => {
    const raw = readFileSync(
      resolve(process.cwd(), 'docs/deployment-readiness-gates.json'),
      'utf8',
    );
    const parsed = JSON.parse(raw) as {
      version: number;
      requiredEnv: {
        production: string[];
        optional: string[];
      };
      securityGates: string[];
      pwaGates: string[];
      qualityGates: QualityGate[];
      releaseGates: string[];
    };

    expect(parsed.version).toBe(1);
    expect(parsed.requiredEnv.production).toEqual(
      expect.arrayContaining([
        'NEXT_PUBLIC_SITE_URL',
        'DATABASE_URL',
        'SESSION_TTL_DAYS',
        'SUBSCRIPTION_WEBHOOK_SECRET',
        'ADMIN_EMAIL_ALLOWLIST',
      ]),
    );

    expect(parsed.securityGates.length).toBeGreaterThan(0);
    expect(parsed.pwaGates.length).toBeGreaterThan(0);
    expect(parsed.releaseGates.length).toBeGreaterThan(0);

    const gateIds = parsed.qualityGates.map((gate) => gate.id);
    expect(gateIds).toEqual(
      expect.arrayContaining(['quality_ci_quick', 'quality_build', 'quality_sw_contract']),
    );

    const hasExtended = parsed.qualityGates.some((gate) => gate.tier === 'extended');
    expect(hasExtended).toBe(true);

    for (const gate of parsed.qualityGates) {
      expect(gate.command.startsWith('pnpm ')).toBe(true);
      expect(typeof gate.blocking).toBe('boolean');
    }
  });
});
