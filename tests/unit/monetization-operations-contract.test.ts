import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

type OpsChecklistItem = {
  id: string;
  title: string;
  requiredArtifacts: string[];
  requiredChecks: string[];
  ownerRole: 'engineering_lead' | 'quality_engineer' | 'ux_accessibility';
  decisionGate: 'scale' | 'hold' | 'rollback';
};

type DecisionRule = {
  decision: 'scale' | 'hold' | 'rollback';
  requires: string[];
  blocks: string[];
};

describe('monetization operations checklist contract', () => {
  it('keeps deterministic checklist and decision guardrails', () => {
    const raw = readFileSync(
      resolve(process.cwd(), 'docs/monetization/operations-checklist.json'),
      'utf8',
    );
    const parsed = JSON.parse(raw) as {
      version: number;
      monthlyClose: OpsChecklistItem[];
      quarterlyReview: OpsChecklistItem[];
      decisionRules: DecisionRule[];
    };

    expect(parsed.version).toBe(1);
    expect(parsed.monthlyClose.length).toBeGreaterThan(0);
    expect(parsed.quarterlyReview.length).toBeGreaterThan(0);
    expect(parsed.decisionRules).toHaveLength(3);

    const monthlyIds = new Set<string>();
    for (const row of parsed.monthlyClose) {
      expect(row.id).toMatch(/^MON-OPS-\d{3}$/);
      expect(monthlyIds.has(row.id)).toBe(false);
      monthlyIds.add(row.id);
      expect(row.requiredArtifacts.length).toBeGreaterThan(0);
      expect(row.requiredChecks.length).toBeGreaterThan(0);
    }

    const quarterlyIds = new Set<string>();
    for (const row of parsed.quarterlyReview) {
      expect(row.id).toMatch(/^MON-QTR-\d{3}$/);
      expect(quarterlyIds.has(row.id)).toBe(false);
      quarterlyIds.add(row.id);
      expect(row.requiredArtifacts.length).toBeGreaterThan(0);
      expect(row.requiredChecks.length).toBeGreaterThan(0);
    }

    const decisions = parsed.decisionRules.map((rule) => rule.decision).sort();
    expect(decisions).toEqual(['hold', 'rollback', 'scale']);

    for (const rule of parsed.decisionRules) {
      expect(rule.requires.length).toBeGreaterThan(0);
      expect(Array.isArray(rule.blocks)).toBe(true);
    }
  });
});
