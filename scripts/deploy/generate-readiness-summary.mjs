import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const reportsDir = resolve(process.cwd(), 'docs/deployment/reports');
const readinessFiles = readdirSync(reportsDir)
  .filter((name) => /^readiness-\d{4}-\d{2}-\d{2}T.+\.json$/.test(name))
  .sort()
  .reverse();

if (readinessFiles.length === 0) {
  throw new Error('No readiness report found in docs/deployment/reports');
}

const latestReadinessFile = readinessFiles[0];
if (!latestReadinessFile) {
  throw new Error('Latest readiness report file is not available');
}
const latestReadinessPath = resolve(reportsDir, latestReadinessFile);
const latestReadiness = JSON.parse(readFileSync(latestReadinessPath, 'utf8'));

if (!latestReadiness?.tier || !latestReadiness?.overallStatus || !Array.isArray(latestReadiness?.steps)) {
  throw new Error('Latest readiness report has invalid contract fields');
}

const timestamp = latestReadinessFile
  .replace(/^readiness-/, '')
  .replace(/\.json$/, '');

const summary = {
  version: 1,
  generatedAt: latestReadiness.generatedAt ?? new Date().toISOString(),
  tier: latestReadiness.tier,
  overallStatus: latestReadiness.overallStatus,
  steps: latestReadiness.steps,
  scope: 'ci-readiness-summary',
  artifacts: {
    readinessReport: `docs/deployment/reports/${latestReadinessFile}`,
    source: 'ci-core:readiness-artifacts',
  },
};

const summaryName = `readiness-summary-${timestamp}.json`;
const summaryPath = resolve(reportsDir, summaryName);
writeFileSync(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');

console.log(`[deploy] readiness summary generated: ${summaryName}`);
