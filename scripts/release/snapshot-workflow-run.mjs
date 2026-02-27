#!/usr/bin/env node
import { execSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const args = process.argv.slice(2);

function getArg(name, fallback = '') {
  const key = `--${name}=`;
  const inline = args.find((arg) => arg.startsWith(key));
  if (inline) return inline.slice(key.length);
  const idx = args.indexOf(`--${name}`);
  if (idx >= 0) return args[idx + 1] ?? fallback;
  return fallback;
}

function hasFlag(name) {
  return args.includes(`--${name}`);
}

function runJson(command) {
  const output = execSync(command, {
    cwd: process.cwd(),
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    maxBuffer: 1024 * 1024 * 20,
  });
  return JSON.parse(output);
}

function runText(command) {
  return execSync(command, {
    cwd: process.cwd(),
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    maxBuffer: 1024 * 1024 * 20,
  }).trim();
}

const workflow = getArg('workflow', 'deploy-production');
const branch = getArg('branch', 'main');
const outputDir = getArg('output-dir', 'docs/deployment/reports');
const runIdArg = getArg('run-id', '');
const requireSuccess = hasFlag('require-success');

let runId = runIdArg;
if (!runId) {
  const list = runJson(
    `gh run list --workflow "${workflow}" --branch "${branch}" --limit 1 --json databaseId`,
  );
  if (!Array.isArray(list) || list.length === 0 || !list[0].databaseId) {
    throw new Error(`No runs found for workflow='${workflow}' branch='${branch}'`);
  }
  runId = String(list[0].databaseId);
}

const run = runJson(
  `gh run view ${runId} --json databaseId,headSha,status,conclusion,createdAt,updatedAt,url,name,workflowName,jobs`,
);
const headShort = String(run.headSha || '').slice(0, 7);
const nowIso = new Date().toISOString();
const stamp = nowIso.replace(/[:.]/g, '-');

const jobs = (run.jobs || []).map((job) => {
  const step = (job.steps || []).find((s) => s.status === 'in_progress');
  return {
    id: job.databaseId,
    name: job.name,
    status: job.status,
    conclusion: job.conclusion || '',
    startedAt: job.startedAt,
    completedAt: job.completedAt,
    inProgressStep: step?.name || '',
  };
});

const summary = {
  version: 1,
  generatedAt: nowIso,
  workflow,
  branch,
  run: {
    id: run.databaseId,
    name: run.name,
    workflowName: run.workflowName,
    status: run.status,
    conclusion: run.conclusion || '',
    createdAt: run.createdAt,
    updatedAt: run.updatedAt,
    url: run.url,
    headSha: run.headSha,
    headShort,
  },
  jobs,
};

mkdirSync(resolve(process.cwd(), outputDir), { recursive: true });
const baseName = `workflow-${workflow}-run-${runId}-${stamp}`;
const jsonPath = resolve(process.cwd(), outputDir, `${baseName}.json`);
const mdPath = resolve(process.cwd(), outputDir, `${baseName}.md`);

writeFileSync(jsonPath, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');

const md = [
  '# Workflow Run Snapshot',
  '',
  `- generatedAt: ${summary.generatedAt}`,
  `- workflow: ${summary.workflow}`,
  `- branch: ${summary.branch}`,
  `- runId: ${summary.run.id}`,
  `- headSha: ${summary.run.headSha}`,
  `- status: ${summary.run.status}`,
  `- conclusion: ${summary.run.conclusion || 'n/a'}`,
  `- url: ${summary.run.url}`,
  '',
  '## Jobs',
  '',
  ...summary.jobs.flatMap((job) => [
    `### ${job.name}`,
    `- id: ${job.id}`,
    `- status: ${job.status}`,
    `- conclusion: ${job.conclusion || 'n/a'}`,
    `- inProgressStep: ${job.inProgressStep || 'n/a'}`,
    '',
  ]),
].join('\n');

writeFileSync(mdPath, `${md}\n`, 'utf8');

const branchName = runText('git rev-parse --abbrev-ref HEAD');
const commitSha = runText('git rev-parse HEAD');
console.log(`[release] snapshot saved: ${jsonPath}`);
console.log(`[release] snapshot saved: ${mdPath}`);
console.log(`[release] local branch=${branchName} localSha=${commitSha} runSha=${run.headSha}`);

if (requireSuccess && !(run.status === 'completed' && run.conclusion === 'success')) {
  console.error(
    `[release] run ${runId} is not successful yet (status=${run.status}, conclusion=${run.conclusion || 'n/a'})`,
  );
  process.exit(1);
}
