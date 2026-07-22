import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();

const requiredFiles = [
  'LICENSE',
  'NOTICE',
  'DCO.md',
  '.github/PULL_REQUEST_TEMPLATE.md',
  'docs/licensing/dual-license-policy.md',
  'docs/licensing/cla-individual.md',
  'docs/licensing/cla-corporate.md',
  'docs/licensing/cla-operations.md',
];

const missingFiles = requiredFiles.filter(
  (relativePath) => !existsSync(resolve(root, relativePath)),
);

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
  throw new Error(
    `[licensing] package.json license must remain "MIT" before v2.0.0 (current: ${license})`,
  );
}

const licenseContent = readFileSync(resolve(root, 'LICENSE'), 'utf8');
if (!licenseContent.includes('Apache License')) {
  throw new Error('[licensing] LICENSE must be Apache License 2.0');
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
