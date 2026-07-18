#!/usr/bin/env node
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { gzipSync } from 'node:zlib';

const root = process.cwd();
const chunksDir = resolve(root, '.next/static/chunks');

const totalBudgetKb = Number(process.env['PERF_BUDGET_TOTAL_KB'] ?? '9000');
const chunkBudgetKb = Number(process.env['PERF_BUDGET_MAX_CHUNK_KB'] ?? '750');
const totalGzipBudgetKb = Number(process.env['PERF_BUDGET_TOTAL_GZIP_KB'] ?? '2800');
const chunkGzipBudgetKb = Number(process.env['PERF_BUDGET_MAX_CHUNK_GZIP_KB'] ?? '325');

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
      out.push({
        path: full,
        size: stats.size,
        gzipSize: gzipSync(readFileSync(full), { level: 9 }).length,
      });
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
  const totalGzipBytes = files.reduce((sum, file) => sum + file.gzipSize, 0);
  const biggestGzip = files.reduce(
    (max, file) => (file.gzipSize > max.gzipSize ? file : max),
    files[0],
  );

  const totalKb = totalBytes / 1024;
  const biggestKb = biggest.size / 1024;
  const totalGzipKb = totalGzipBytes / 1024;
  const biggestGzipKb = biggestGzip.gzipSize / 1024;

  const failures = [];
  if (totalKb > totalBudgetKb) {
    failures.push(`total chunks ${totalKb.toFixed(1)}KB > budget ${totalBudgetKb}KB`);
  }
  if (biggestKb > chunkBudgetKb) {
    failures.push(
      `largest chunk ${biggestKb.toFixed(1)}KB > budget ${chunkBudgetKb}KB (${biggest.path})`,
    );
  }
  if (totalGzipKb > totalGzipBudgetKb) {
    failures.push(`total gzip chunks ${totalGzipKb.toFixed(1)}KB > budget ${totalGzipBudgetKb}KB`);
  }
  if (biggestGzipKb > chunkGzipBudgetKb) {
    failures.push(
      `largest gzip chunk ${biggestGzipKb.toFixed(1)}KB > budget ${chunkGzipBudgetKb}KB (${biggestGzip.path})`,
    );
  }

  if (failures.length > 0) {
    console.error('[perf-budget] budget check failed');
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  console.log(
    `[perf-budget] OK raw total=${totalKb.toFixed(1)}KB (<=${totalBudgetKb}KB), raw largest=${biggestKb.toFixed(1)}KB (<=${chunkBudgetKb}KB), gzip total=${totalGzipKb.toFixed(1)}KB (<=${totalGzipBudgetKb}KB), gzip largest=${biggestGzipKb.toFixed(1)}KB (<=${chunkGzipBudgetKb}KB)`,
  );
} catch (error) {
  console.error('[perf-budget] unable to evaluate budgets');
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
