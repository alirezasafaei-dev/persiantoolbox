#!/usr/bin/env node
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const ROOT = process.cwd();
const lhciDir = resolve(ROOT, '.lighthouseci');
const reportDir = resolve(ROOT, 'docs/release/reports');
const outputPath = resolve(reportDir, 'lighthouse-trend-summary.json');

if (!existsSync(lhciDir)) {
  console.error('[lhci] directory not found at .lighthouseci/');
  process.exit(1);
}

const files = readdirSync(lhciDir).filter((f) => f.endsWith('.json') && f.startsWith('lhr-'));
if (files.length === 0) {
  console.error('[lhci] no lhr-*.json files found in .lighthouseci/');
  process.exit(1);
}

const routeSummaries = [];

for (const file of files) {
  const reportPath = resolve(lhciDir, file);
  try {
    const report = JSON.parse(readFileSync(reportPath, 'utf8'));
    if (!report.categories || !report.finalUrl) {
      continue;
    }
    const route = new URL(report.finalUrl).pathname || '/';
    routeSummaries.push({
      route,
      performance: report.categories.performance?.score ?? 0,
      accessibility: report.categories.accessibility?.score ?? 0,
      bestPractices: report.categories['best-practices']?.score ?? 0,
      seo: report.categories.seo?.score ?? 0,
      fetchedAt: report.fetchTime,
    });
  } catch {
    console.warn(`[lhci] skipping invalid file: ${file}`);
  }
}

const grouped = new Map();
for (const item of routeSummaries) {
  const current = grouped.get(item.route) ?? [];
  current.push(item);
  grouped.set(item.route, current);
}

const summarize = (items) => {
  const average = (key) =>
    Number((items.reduce((sum, item) => sum + item[key], 0) / items.length).toFixed(3));
  return {
    runs: items.length,
    performance: average('performance'),
    accessibility: average('accessibility'),
    bestPractices: average('bestPractices'),
    seo: average('seo'),
    latestFetchTime: items.at(-1)?.fetchedAt ?? null,
  };
};

const summary = {
  generatedAt: new Date().toISOString(),
  source: '.lighthouseci/lhr-*.json',
  routes: Object.fromEntries(
    [...grouped.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([route, items]) => [route, summarize(items)]),
  ),
};

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(
  outputPath,
  `${JSON.stringify(summary, null, 2)}
`,
);
console.log(`[lhci] wrote route trend summary to ${outputPath}`);
