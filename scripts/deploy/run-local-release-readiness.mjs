#!/usr/bin/env node
import { execSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const skipLighthouse = process.env['LOCAL_READINESS_SKIP_LIGHTHOUSE'] === '1';

const checks = [
  { id: 'lint', cmd: 'pnpm lint', blocking: true },
  { id: 'typecheck', cmd: 'pnpm typecheck', blocking: true },
  { id: 'test_ci', cmd: 'pnpm test:ci', blocking: true },
  { id: 'build', cmd: 'pnpm build', blocking: true },
  { id: 'security_scan', cmd: 'pnpm security:scan', blocking: true },
  { id: 'lighthouse_ci', cmd: 'pnpm lighthouse:ci', blocking: !skipLighthouse, skip: skipLighthouse },
  { id: 'contracts', cmd: 'pnpm ci:contracts', blocking: true },
  { id: 'readiness_summary', cmd: 'pnpm deploy:readiness:summary', blocking: true },
];

const results = [];
for (const check of checks) {
  if (check.skip) {
    results.push({ id: check.id, status: 'skipped', blocking: check.blocking, output: 'skipped by env' });
    continue;
  }

  try {
    const output = execSync(check.cmd, {
      cwd: process.cwd(),
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      maxBuffer: 1024 * 1024 * 10,
    });
    results.push({ id: check.id, status: 'passed', blocking: check.blocking, output: output.trim() });
  } catch (error) {
    const output = error?.stdout || error?.stderr || String(error);
    results.push({ id: check.id, status: 'failed', blocking: check.blocking, output: String(output).trim() });
    if (check.blocking) {
      break;
    }
  }
}

const overallStatus = results.some((r) => r.blocking && r.status === 'failed') ? 'failed' : 'passed';
const report = {
  version: 1,
  generatedAt: new Date().toISOString(),
  scope: 'local-release-readiness',
  overallStatus,
  checks: results,
};

const reportsDir = resolve(process.cwd(), 'docs/deployment/reports');
mkdirSync(reportsDir, { recursive: true });
const fileName = `local-readiness-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
writeFileSync(resolve(reportsDir, fileName), `${JSON.stringify(report, null, 2)}\n`, 'utf8');

// eslint-disable-next-line no-console
console.log(`[deploy] local readiness report generated: ${fileName} (status=${overallStatus})`);
if (overallStatus !== 'passed') {
  process.exit(1);
}
