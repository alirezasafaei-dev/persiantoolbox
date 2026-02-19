#!/usr/bin/env node
import { readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = process.cwd();
const chunksDir = resolve(root, '.next/static/chunks');

const totalBudgetKb = Number(process.env['PERF_BUDGET_TOTAL_KB'] ?? '3400');
const chunkBudgetKb = Number(process.env['PERF_BUDGET_MAX_CHUNK_KB'] ?? '750');

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stats = statSync(full);
    if (stats.isDirectory()) {
      out.push(...walk(full));
      continue;
    }
    if (entry.endsWith('.js')) {
      out.push({ path: full, size: stats.size });
    }
  }
  return out;
}

try {
  const files = walk(chunksDir);
  if (files.length === 0) {
    console.error('[perf-budget] no JS chunks found; run `pnpm build` first');
    process.exit(1);
  }

  const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
  const biggest = files.reduce((max, file) => (file.size > max.size ? file : max), files[0]);

  const totalKb = totalBytes / 1024;
  const biggestKb = biggest.size / 1024;

  const failures = [];
  if (totalKb > totalBudgetKb) {
    failures.push(`total chunks ${totalKb.toFixed(1)}KB > budget ${totalBudgetKb}KB`);
  }
  if (biggestKb > chunkBudgetKb) {
    failures.push(`largest chunk ${biggestKb.toFixed(1)}KB > budget ${chunkBudgetKb}KB (${biggest.path})`);
  }

  if (failures.length > 0) {
    console.error('[perf-budget] budget check failed');
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  console.log(
    `[perf-budget] OK total=${totalKb.toFixed(1)}KB (<=${totalBudgetKb}KB), largest=${biggestKb.toFixed(1)}KB (<=${chunkBudgetKb}KB)`,
  );
} catch (error) {
  console.error('[perf-budget] unable to evaluate budgets');
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
