import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const reportDir = resolve(root, 'docs/licensing/reports');
mkdirSync(reportDir, { recursive: true });

const packageJson = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
const version = String(packageJson.version ?? '0.0.0');
const license = String(packageJson.license ?? '');
const major = Number(version.split('.')[0] ?? '0');

const checklist = readFileSync(resolve(root, 'docs/licensing/v2-license-release-checklist.md'), 'utf8');
const releaseTemplate = readFileSync(resolve(root, 'docs/licensing/v2-release-notes-template.md'), 'utf8');
const operations = readFileSync(resolve(root, 'docs/licensing/cla-operations.md'), 'utf8');

const checks = [
  {
    id: 'check_version_boundary_state',
    status: version.startsWith('1.') || major >= 2 ? 'passed' : 'warning',
    note: `Current package version: ${version}`,
  },
  {
    id: 'check_license_boundary_state',
    status:
      (major < 2 && license === 'MIT') || (major >= 2 && license === 'SEE LICENSE IN LICENSE')
        ? 'passed'
        : 'failed',
    note: `Current package license: ${license}`,
  },
  {
    id: 'check_release_checklist_exists',
    status: checklist.includes('v2.0.0') ? 'passed' : 'failed',
    note: 'v2 release checklist detected',
  },
  {
    id: 'check_release_notes_template_exists',
    status: releaseTemplate.includes('Release Notes Template') ? 'passed' : 'failed',
    note: 'release notes template detected',
  },
  {
    id: 'check_cla_ops_reference_flow',
    status: operations.includes('referenceId') ? 'passed' : 'failed',
    note: 'CLA operations reference flow detected',
  },
  {
    id: 'check_actual_v2_cut',
    status: 'pending',
    note: 'v2.0.0 release cut intentionally not executed in dry-run',
  },
];

const hasFailed = checks.some((check) => check.status === 'failed');

const report = {
  version: 1,
  generatedAt: new Date().toISOString(),
  scope: 'v2-release-prep-dry-run',
  overallStatus: hasFailed ? 'failed' : 'ready_with_pending_release_cut',
  checks,
};

const fileName = `v2-license-release-prep-dry-run-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
const outputPath = resolve(reportDir, fileName);
writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

console.log(`[licensing] release prep dry-run report generated: ${fileName}`);

if (hasFailed) {
  process.exitCode = 1;
}
