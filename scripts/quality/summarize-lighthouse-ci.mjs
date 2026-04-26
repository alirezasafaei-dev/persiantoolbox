#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const ROOT = process.cwd();
const manifestPath = resolve(ROOT, '.lighthouseci/manifest.json');
const reportDir = resolve(ROOT, 'docs/release/reports');
const outputPath = resolve(reportDir, 'lighthouse-trend-summary.json');

if (!existsSync(manifestPath)) {
  console.error('[lhci] manifest not found at .lighthouseci/manifest.json');
  process.exit(1);
}

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const routeSummaries = [];

for (const entry of manifest) {
  const reportPath = resolve(ROOT, entry.jsonPath);
  if (!existsSync(reportPath)) {
    continue;
  }
  const report = JSON.parse(readFileSync(reportPath, 'utf8'));
  const route = new URL(report.finalUrl).pathname || '/';
  routeSummaries.push({
    route,
    performance: report.categories.performance.score,
    accessibility: report.categories.accessibility.score,
    bestPractices: report.categories['best-practices'].score,
    seo: report.categories.seo.score,
    fetchedAt: report.fetchTime,
  });
}

const grouped = new Map();
for (const item of routeSummaries) {
  const current = grouped.get(item.route) ?? [];
  current.push(item);
  grouped.set(item.route, current);
}

const summarize = (items) => {
  const average = (key) => Number((items.reduce((sum, item) => sum + item[key], 0) / items.length).toFixed(3));
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
  source: '.lighthouseci/manifest.json',
  routes: Object.fromEntries(
    [...grouped.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([route, items]) => [route, summarize(items)]),
  ),
};

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(summary, null, 2)}
`);
console.log(`[lhci] wrote route trend summary to ${outputPath}`);
