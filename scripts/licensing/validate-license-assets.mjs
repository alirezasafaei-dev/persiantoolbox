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
  'docs/licensing/license-migration-taskboard.md',
  'docs/licensing/dual-license-policy.md',
  'docs/licensing/package-license-transition.md',
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

console.log(
  `[licensing] assets validated (${requiredFiles.length} files), package license is valid for version ${version}`,
);
