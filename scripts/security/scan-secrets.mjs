import { execSync } from 'node:child_process';
import { readFileSync, statSync, readdirSync } from 'node:fs';
import path from 'node:path';

const forbidden = [
  { name: 'AWS Access Key', regex: /\bAKIA[0-9A-Z]{16}\b/g },
  { name: 'GitHub PAT', regex: /\bghp_[0-9A-Za-z]{36}\b/g },
  { name: 'GitHub fine-grained PAT', regex: /\bgithub_pat_[0-9A-Za-z_]{82,}\b/g },
  { name: 'Google API Key', regex: /\bAIza[0-9A-Za-z_-]{35}\b/g },
  { name: 'Stripe Key', regex: /\bsk_(live|test)_[0-9A-Za-z]{16,}\b/g },
  { name: 'Slack Token', regex: /\bxox[baprs]-[0-9A-Za-z-]{10,}\b/g },
  { name: 'Private Key Block', regex: /-----BEGIN (RSA|EC|OPENSSH|DSA) PRIVATE KEY-----/g },
  { name: 'Postgres URL with password', regex: /\bpostgres:\/\/[^\s:]+:[^\s@]+@[^\s]+/g },
];

const ignorePathFragments = [
  'pnpm-lock.yaml',
  'docs/deployment/reports/',
  '.codex/snapshots/',
  'coverage/',
  'dist/',
  '.next/',
];

function listTrackedFiles() {
  try {
    const stdout = execSync('git ls-files', { encoding: 'utf8' });
    return stdout
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .filter((file) => !ignorePathFragments.some((fragment) => file.includes(fragment)));
  } catch {
    return listProjectFiles('.');
  }
}

function listProjectFiles(rootDir) {
  const stack = [rootDir];
  const files = [];

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) {
      continue;
    }
    const entries = readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      const rel = path.relative('.', full);
      if (ignorePathFragments.some((fragment) => rel.includes(fragment))) {
        continue;
      }
      if (entry.isDirectory()) {
        stack.push(full);
      } else if (entry.isFile()) {
        files.push(rel);
      }
    }
  }

  return files;
}

function readFileSafe(file) {
  try {
    if (!statSync(file).isFile()) {
      return '';
    }
    return readFileSync(file, 'utf8');
  } catch {
    return '';
  }
}

const offenders = [];
for (const file of listTrackedFiles()) {
  const content = readFileSafe(file);
  if (!content) {
    continue;
  }
  for (const pattern of forbidden) {
    if (pattern.regex.test(content)) {
      offenders.push({ file, pattern: pattern.name });
    }
    pattern.regex.lastIndex = 0;
  }
}

if (offenders.length > 0) {
  console.error('[security:secrets] Potential secrets detected:');
  for (const offender of offenders) {
    console.error(`- ${offender.file}: ${offender.pattern}`);
  }
  process.exit(1);
}

console.log('[security:secrets] No high-risk secret patterns detected in tracked files.');
