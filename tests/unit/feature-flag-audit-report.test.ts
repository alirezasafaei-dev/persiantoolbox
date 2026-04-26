import { execSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

type AuditReport = {
  version: number;
  generatedAt: string;
  runtimeEnv: 'development' | 'test' | 'production';
  auditScope: 'runtime-feature-flags';
  summary: {
    auditedFeatures: number;
    enabled: number;
    disabled: number;
    warnings: number;
    databaseUrlPresent: boolean;
    adminAllowlistPresent: boolean;
    analyticsConfigured: boolean;
    siteSettingsEnvPresent: boolean;
    appDataDirPresent: boolean;
  };
  features: Array<{
    id: string;
    category: 'monetization' | 'account' | 'admin' | 'platform';
    envKey: string;
    enabled: boolean;
    warnings: string[];
  }>;
};

describe('feature flag audit report', () => {
  it('emits a runtime matrix for monetization, account, and admin surfaces', () => {
    const output = execSync('pnpm -s feature-flags:audit', {
      cwd: process.cwd(),
      env: { ...process.env, NODE_ENV: 'test' },
      encoding: 'utf8',
    });

    const report = JSON.parse(output) as AuditReport;

    expect(report.version).toBe(1);
    expect(report.auditScope).toBe('runtime-feature-flags');
    expect(report.runtimeEnv).toBe('test');
    expect(report.generatedAt.length).toBeGreaterThan(10);
    expect(report.summary.auditedFeatures).toBe(report.features.length);
    expect(report.summary.auditedFeatures).toBeGreaterThan(5);

    const featureIds = report.features.map((feature) => feature.id);
    expect(featureIds).toContain('account');
    expect(featureIds).toContain('admin-site-settings');
    expect(featureIds).toContain('plans');

    for (const feature of report.features) {
      expect(['monetization', 'account', 'admin']).toContain(feature.category);
      expect(feature.envKey.startsWith('FEATURE_')).toBe(true);
      expect(Array.isArray(feature.warnings)).toBe(true);
    }
  });
});
