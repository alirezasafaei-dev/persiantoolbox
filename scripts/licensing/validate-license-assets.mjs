import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();

const requiredFiles = [
  'LICENSE',
  'LICENSE-NONCOMMERCIAL.md',
  'LICENSE-COMMERCIAL.md',
  'COMMERCIAL.md',
  'NOTICE',
  'TRADEMARKS.md',
  'DCO.md',
  '.github/PULL_REQUEST_TEMPLATE.md',
  'docs/licensing/license-migration-taskboard.md',
  'docs/licensing/dual-license-policy.md',
  'docs/licensing/cla-individual.md',
  'docs/licensing/cla-corporate.md',
  'docs/licensing/cla-operations.md',
  'docs/licensing/package-license-transition.md',
  'docs/licensing/v2-license-release-checklist.md',
  'docs/licensing/v2-release-notes-template.md',
];

const missingFiles = requiredFiles.filter((relativePath) => !existsSync(resolve(root, relativePath)));

if (missingFiles.length > 0) {
  throw new Error(`[licensing] missing required files: ${missingFiles.join(', ')}`);
}

const packageJsonPath = resolve(root, 'package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
const version = String(packageJson.version ?? '0.0.0');
const license = String(packageJson.license ?? '');

const major = Number(version.split('.')[0] ?? '0');
if (!Number.isFinite(major)) {
  throw new Error(`[licensing] invalid package version: ${version}`);
}

if (major >= 2 && license !== 'SEE LICENSE IN LICENSE') {
  throw new Error(
    `[licensing] package.json license must be "SEE LICENSE IN LICENSE" for v2+ (current: ${license})`,
  );
}

if (major < 2 && license !== 'MIT') {
  throw new Error(`[licensing] package.json license must remain "MIT" before v2.0.0 (current: ${license})`);
}

const contributing = readFileSync(resolve(root, 'CONTRIBUTING.md'), 'utf8');
if (!contributing.includes('Signed-off-by')) {
  throw new Error('[licensing] CONTRIBUTING.md must document DCO Signed-off-by requirement');
}

const agents = readFileSync(resolve(root, 'AGENTS.md'), 'utf8');
if (!agents.includes('DCO.md')) {
  throw new Error('[licensing] AGENTS.md must reference DCO governance');
}

if (!contributing.includes('cla-individual.md') || !contributing.includes('cla-corporate.md')) {
  throw new Error('[licensing] CONTRIBUTING.md must reference CLA hybrid documents');
}

if (!agents.includes('cla-individual.md') || !agents.includes('cla-corporate.md')) {
  throw new Error('[licensing] AGENTS.md must reference CLA hybrid documents');
}

console.log(
  `[licensing] assets validated (${requiredFiles.length} files), package license is valid for version ${version}`,
);
