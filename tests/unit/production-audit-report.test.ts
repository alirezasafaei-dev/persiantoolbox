import { mkdtempSync, writeFileSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { afterEach, describe, expect, it } from 'vitest';
import { assertAuditReport } from '@/scripts/security/assert-audit-report.mjs';

const valid = {
  metadata: {
    dependencies: 564,
    vulnerabilities: { info: 0, low: 0, moderate: 0, high: 0, critical: 0 },
  },
};
const temporary: string[] = [];
afterEach(() => {
  for (const directory of temporary.splice(0)) {
    const target = path.resolve(directory);
    if (
      path.dirname(target) !== path.resolve(tmpdir()) ||
      !path.basename(target).startsWith('pt-audit-report-')
    ) {
      throw new Error('Refusing cleanup outside the audit test temporary directory');
    }
    rmSync(target, { recursive: true, force: true });
  }
});

describe('production audit evidence', () => {
  it('accepts a complete report without interpreting vulnerability counts as an exit threshold', () => {
    expect(assertAuditReport(valid)).toEqual(valid.metadata.vulnerabilities);
    const finding = structuredClone(valid);
    finding.metadata.vulnerabilities.high = 1;
    expect(assertAuditReport(finding).high).toBe(1);
  });

  it.each([
    null,
    {},
    { error: { code: 'ECONNRESET' } },
    { metadata: {} },
    { metadata: { ...valid.metadata, dependencies: 0 } },
    { metadata: { ...valid.metadata, vulnerabilities: { high: 0 } } },
    {
      metadata: {
        ...valid.metadata,
        vulnerabilities: { ...valid.metadata.vulnerabilities, high: -1 },
      },
    },
  ])('rejects missing or invalid audit evidence %#', (report) => {
    expect(() => assertAuditReport(report)).toThrow();
  });

  it.each([
    'request failed: socket hang up',
    JSON.stringify({ error: { code: 'ECONNRESET' } }),
    JSON.stringify(valid),
    JSON.stringify({
      metadata: {
        ...valid.metadata,
        vulnerabilities: { ...valid.metadata.vulnerabilities, high: 1 },
      },
    }),
  ])('returns a real CLI failure for unusable registry responses %#', (input) => {
    const directory = mkdtempSync(path.join(tmpdir(), 'pt-audit-report-'));
    temporary.push(directory);
    const fixture = path.join(directory, 'audit.json');
    writeFileSync(fixture, input);
    const result = spawnSync(
      process.execPath,
      [path.resolve('scripts/security/assert-audit-report.mjs'), fixture],
      { encoding: 'utf8' },
    );
    expect(result.status).toBe(input === JSON.stringify(valid) ? 0 : 1);
  });

  it('keeps local and hosted auditing strict and validates the hosted report', () => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
    const workflow = readFileSync('.github/workflows/ci-core.yml', 'utf8');
    expect(pkg.scripts['security:scan']).not.toContain('--ignore-registry-errors');
    expect(workflow).not.toContain('--ignore-registry-errors');
    expect(workflow).toContain('node scripts/security/assert-audit-report.mjs pnpm-audit.json');
  });
});
