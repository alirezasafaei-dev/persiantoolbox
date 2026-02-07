import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

type Decision = 'scale' | 'hold' | 'rollback';

type AlertingRule = {
  id: string;
  ownerRole: 'engineering_lead' | 'quality_engineer' | 'ux_accessibility';
  yellowThreshold: string;
  redThreshold: string;
  decisionBySeverity: {
    green: Decision;
    yellow: Decision;
    red: Decision;
  };
};

describe('monetization alerting decision contract', () => {
  it('keeps deterministic KPI decision mapping and global guards', () => {
    const raw = readFileSync(
      resolve(process.cwd(), 'docs/monetization/alerting-decision-rules.json'),
      'utf8',
    );

    const parsed = JSON.parse(raw) as {
      version: number;
      kpis: AlertingRule[];
      globalGuards: {
        privacyIncidentOpen: Decision;
        securityIncidentOpen: Decision;
        insufficientSignal: Decision;
      };
    };

    expect(parsed.version).toBe(1);
    expect(parsed.kpis.length).toBe(5);

    const ids = parsed.kpis.map((item) => item.id).sort();
    expect(ids).toEqual([
      'bounce_rate_revenue_paths',
      'ctr',
      'impression',
      'rpm_arpu',
      'subscription_conversion',
    ]);

    for (const kpi of parsed.kpis) {
      expect(kpi.yellowThreshold.length).toBeGreaterThan(3);
      expect(kpi.redThreshold.length).toBeGreaterThan(3);
      expect(kpi.decisionBySeverity.green).toBe('scale');
      expect(kpi.decisionBySeverity.yellow).toBe('hold');
      expect(kpi.decisionBySeverity.red).toBe('rollback');
    }

    expect(parsed.globalGuards.privacyIncidentOpen).toBe('rollback');
    expect(parsed.globalGuards.securityIncidentOpen).toBe('rollback');
    expect(parsed.globalGuards.insufficientSignal).toBe('hold');
  });
});
