import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('rollback drill checklist contract', () => {
  it('keeps deterministic rollback drills and reporting schema', () => {
    const raw = readFileSync(resolve(process.cwd(), 'docs/rollback-drill-checklist.json'), 'utf8');
    const parsed = JSON.parse(raw) as {
      version: number;
      drills: Array<{
        id: string;
        ownerRole: string;
        steps: string[];
        successCriteria: string[];
        evidenceRequired: boolean;
      }>;
      reporting: {
        required: string[];
        allowedStatus: string[];
      };
    };

    expect(parsed.version).toBe(1);
    expect(parsed.drills.length).toBeGreaterThanOrEqual(3);

    for (const drill of parsed.drills) {
      expect(drill.id).toMatch(/^RB-\d{3}$/);
      expect(['engineering_lead', 'quality_engineer', 'ux_accessibility']).toContain(
        drill.ownerRole,
      );
      expect(drill.steps.length).toBeGreaterThanOrEqual(3);
      expect(drill.successCriteria.length).toBeGreaterThanOrEqual(2);
      expect(drill.evidenceRequired).toBe(true);
    }

    expect(parsed.reporting.required).toEqual(
      expect.arrayContaining([
        'incident_id',
        'rollback_decision',
        'verification_evidence',
        'final_status',
      ]),
    );
    expect(parsed.reporting.allowedStatus).toEqual(
      expect.arrayContaining(['passed', 'failed', 'partial']),
    );
  });
});
