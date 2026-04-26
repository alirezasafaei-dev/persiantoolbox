#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

const scriptPath = resolve(process.cwd(), 'scripts/admin/generate-ops-snapshot.mjs');
const baseUrl = process.env['OPS_WINDOW_BASE_URL'] ?? 'https://persiantoolbox.ir';
const repeat = Math.max(1, Number(process.env['OPS_WINDOW_REPEAT'] ?? 6) || 6);
const intervalMs = Math.max(1_000, Number(process.env['OPS_WINDOW_INTERVAL_MS'] ?? 30_000) || 30_000);
const token = process.env['OPS_DASHBOARD_TOKEN'] ?? '';
const includeOutput = process.env['OPS_WINDOW_INCLUDE_OUTPUT'] !== '0';
const webhook = process.env['OPS_DEGRADED_WEBHOOK'] ?? '';

const args = [
  scriptPath,
  `--base-url=${baseUrl}`,
  `--repeat=${repeat}`,
  `--interval-ms=${intervalMs}`,
  '--require-healthy',
];

if (includeOutput) {
  args.push('--include-output');
}
if (token) {
  args.push(`--token=${token}`);
}
if (webhook) {
  args.push(`--degraded-webhook=${webhook}`);
}

const run = spawnSync('node', args, {
  stdio: 'inherit',
});

if (run.error) {
  throw run.error;
}

process.exit(run.status ?? 0);
