import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import Footer from '@/components/ui/Footer';
import * as runtimeVersion from '@/lib/runtime-version';

type QualityGate = {
  id: string;
  command: string;
  tier: 'core' | 'extended';
  blocking: boolean;
};

describe('deployment readiness contract', () => {
  it('renders the live runtime version in the footer', () => {
    const spy = vi.spyOn(runtimeVersion, 'getRuntimeVersion').mockReturnValue({
      version: '3.0.6',
      commit: 'a460097abc12',
    });

    const markup = renderToStaticMarkup(Footer());

    expect(markup).toContain('نسخه 3.0.6 | a460097abc12');

    spy.mockRestore();
  });

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
      expect.arrayContaining([
        'quality_ci_quick',
        'quality_e2e_ci',
        'quality_build',
        'quality_sw_contract',
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
