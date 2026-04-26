import { existsSync } from 'node:fs';
import { featureIds, getFeatureInfo, type FeatureId } from '@/lib/features/availability';

type RuntimeEnv = 'development' | 'test' | 'production';

type DependencyStatus = {
  key: string;
  present: boolean;
  requiredWhenEnabled: boolean;
};

type AuditedFeature = {
  id: FeatureId;
  title: string;
  category: 'monetization' | 'account' | 'admin' | 'platform';
  path: string | null;
  envKey: string;
  defaultEnabled: boolean;
  enabled: boolean;
  rawEnvValue: string | null;
  dependencyStatus: DependencyStatus[];
  warnings: string[];
};

const runtimeEnv = (
  process.env['NODE_ENV'] === 'production' || process.env['NODE_ENV'] === 'test'
    ? process.env['NODE_ENV']
    : 'development'
) as RuntimeEnv;

const auditedCategories = new Set(['monetization', 'account', 'admin']);

const dependencyRules: Partial<Record<FeatureId, string[]>> = {
  account: ['DATABASE_URL'],
  auth: ['DATABASE_URL'],
  history: ['DATABASE_URL'],
  'history-share': ['DATABASE_URL'],
  dashboard: ['DATABASE_URL'],
  subscription: ['DATABASE_URL'],
  checkout: ['DATABASE_URL'],
  'admin-site-settings': ['DATABASE_URL', 'ADMIN_EMAIL_ALLOWLIST'],
  'admin-monetization': ['DATABASE_URL', 'ADMIN_EMAIL_ALLOWLIST'],
};

function isPresent(key: string): boolean {
  const value = process.env[key];
  return typeof value === 'string' && value.trim().length > 0;
}

function buildFeatureAudit(id: FeatureId): AuditedFeature {
  const info = getFeatureInfo(id);
  const dependencyStatus = (dependencyRules[id] ?? []).map((key) => ({
    key,
    present: isPresent(key),
    requiredWhenEnabled: true,
  }));
  const warnings: string[] = [];

  if (info.enabled) {
    for (const dependency of dependencyStatus) {
      if (!dependency.present) {
        warnings.push(`enabled_without_${dependency.key.toLowerCase()}`);
      }
    }
  }

  return {
    id,
    title: info.title,
    category: info.category,
    path: info.path ?? null,
    envKey: info.envKey,
    defaultEnabled: info.defaultEnabled,
    enabled: info.enabled,
    rawEnvValue: process.env[info.envKey] ?? null,
    dependencyStatus,
    warnings,
  };
}

const auditedFeatures = featureIds
  .map((id) => buildFeatureAudit(id))
  .filter((feature) => auditedCategories.has(feature.category));

const report = {
  version: 1,
  generatedAt: new Date().toISOString(),
  runtimeEnv,
  auditScope: 'runtime-feature-flags',
  summary: {
    auditedFeatures: auditedFeatures.length,
    enabled: auditedFeatures.filter((feature) => feature.enabled).length,
    disabled: auditedFeatures.filter((feature) => !feature.enabled).length,
    warnings: auditedFeatures.reduce((total, feature) => total + feature.warnings.length, 0),
    databaseUrlPresent: isPresent('DATABASE_URL'),
    adminAllowlistPresent: isPresent('ADMIN_EMAIL_ALLOWLIST'),
    analyticsConfigured: isPresent('NEXT_PUBLIC_ANALYTICS_ID'),
    siteSettingsEnvPresent:
      isPresent('SITE_SETTINGS_DEVELOPER_NAME') ||
      isPresent('SITE_SETTINGS_DEVELOPER_BRAND_TEXT') ||
      isPresent('SITE_SETTINGS_ORDER_URL') ||
      isPresent('SITE_SETTINGS_PORTFOLIO_URL'),
    appDataDirPresent: existsSync(`${process.cwd()}/var`),
  },
  features: auditedFeatures,
};

console.log(JSON.stringify(report, null, 2));
