#!/usr/bin/env node
import { writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { resolve } from 'node:path';

function run(cmd) {
  try {
    return execSync(cmd, { stdio: ['pipe', 'pipe', 'pipe'], encoding: 'utf8' }).trim();
  } catch (error) {
    return '';
  }
}

function parseArgs() {
  const args = new Set(process.argv.slice(2).map((arg) => arg.toLowerCase()));
  return {
    write: args.has('--write'),
    json: args.has('--json'),
    path: process.argv.find((arg) => arg.startsWith('--path='))?.slice(7) ?? 'docs/next-step.md',
  };
}

const { write, json, path } = parseArgs();
const now = new Date().toISOString();

const branch = run('git rev-parse --abbrev-ref HEAD');
const remote = run('git rev-parse --abbrev-ref --symbolic-full-name @{u}');
const aheadBehind = run('git rev-list --left-right --count @{u}...HEAD');
const shortLog = run('git log --oneline -n 5 --decorate');
const status = run('git status --short');
const clean = status === '';

const staged = run('git diff --cached --name-only');
const unstaged = run('git diff --name-only');
const allStatus = run('git status --short --untracked-files=normal');
const untracked = allStatus
  .split('\n')
  .filter((line) => line.startsWith('?? '))
  .map((line) => line.slice(3))
  .join('\n');

const changedFiles = run(`git diff --name-only HEAD~1..HEAD`);

const continuationHint = 'Use `docs/session-continuation-template.md` for the handoff template.';

const report = {
  generatedAt: now,
  repository: run('git remote get-url origin') || 'unknown',
  branch,
  remote,
  aheadBehind,
  clean,
  status,
  staged: staged ? staged.split('\n').filter(Boolean) : [],
  unstaged: unstaged ? unstaged.split('\n').filter(Boolean) : [],
  untracked: untracked ? untracked.split('\n').filter(Boolean) : [],
  lastCommits: shortLog ? shortLog.split('\n').filter(Boolean) : [],
  changedInLastCommit: changedFiles ? changedFiles.split('\n').filter(Boolean) : [],
};

if (json) {
  console.log(JSON.stringify(report, null, 2));
  process.exit(0);
}

const lines = [
  `# Hand-off Snapshot (${now})`,
  '',
  `- branch: ${report.branch}`,
  `- remote: ${report.remote || 'not configured'}`,
  `- ahead/behind vs upstream: ${report.aheadBehind || 'unknown'}`,
  `- clean workspace: ${report.clean ? 'yes' : 'no'}`,
  '',
  '## Recent commits',
  ...report.lastCommits.map((line) => `- ${line}`),
  '',
  '## Current workspace',
  ...(report.status ? report.status.split('\n').map((line) => `- ${line}`) : ['- clean']),
  '',
  '## Continuation template',
  continuationHint,
];

if (report.changedInLastCommit.length) {
  lines.push(
    '',
    '## Last commit touched files',
    ...report.changedInLastCommit.map((line) => `- ${line}`),
  );
}
if (report.untracked.length) {
  lines.push('', '## Untracked files', ...report.untracked.map((line) => `- ${line}`));
}

const output = lines.join('\n') + '\n';

if (write) {
  writeFileSync(resolve(process.cwd(), path), output, 'utf8');
  console.log(`[handoff] wrote: ${path}`);
} else {
  console.log(output);
}
