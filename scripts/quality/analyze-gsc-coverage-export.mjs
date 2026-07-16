#!/usr/bin/env node
/* eslint-disable no-console */

import fs from 'node:fs/promises';
import path from 'node:path';

const argv = process.argv.slice(2);

const getArgValue = (name, fallback) => {
  const index = argv.indexOf(name);
  if (index < 0) {
    return fallback;
  }
  return argv[index + 1] ?? fallback;
};

const positionalInput = argv.find((value) => !value.startsWith('--'));
const input = getArgValue('--input', positionalInput);
const outputDir = getArgValue('--output-dir', 'reports/seo');
const strict = argv.includes('--strict');
const requiredFiles = [
  'Chart.csv',
  'Critical issues.csv',
  'Non-critical issues.csv',
  'Metadata.csv',
];

if (!input) {
  console.error(
    'Usage: node scripts/quality/analyze-gsc-coverage-export.mjs --input <zip-or-directory> [--output-dir reports/seo] [--strict]',
  );
  process.exit(2);
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = '';
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    const nextCharacter = text[index + 1];

    if (quoted) {
      if (character === '"' && nextCharacter === '"') {
        value += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        value += character;
      }
      continue;
    }

    if (character === '"') {
      quoted = true;
    } else if (character === ',') {
      row.push(value);
      value = '';
    } else if (character === '\n') {
      row.push(value.replace(/\r$/, ''));
      if (row.some(Boolean)) {
        rows.push(row);
      }
      row = [];
      value = '';
    } else {
      value += character;
    }
  }

  if (value || row.length > 0) {
    row.push(value.replace(/\r$/, ''));
    rows.push(row);
  }

  if (rows.length === 0) {
    return [];
  }

  const headers = rows.shift().map((header) => header.replace(/^\uFEFF/, '').trim());
  return rows.map((values) =>
    Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ''])),
  );
}

async function readExport(source) {
  const absolutePath = path.resolve(source);
  const stats = await fs.stat(absolutePath);

  if (stats.isDirectory()) {
    const entries = await Promise.all(
      requiredFiles.map(async (fileName) => [
        fileName,
        await fs.readFile(path.join(absolutePath, fileName), 'utf8'),
      ]),
    );
    return Object.fromEntries(entries);
  }

  if (!absolutePath.toLowerCase().endsWith('.zip')) {
    throw new Error('Input must be a ZIP export or extracted directory');
  }

  const { default: JSZip } = await import('jszip');
  const zip = await JSZip.loadAsync(await fs.readFile(absolutePath));
  const result = {};

  for (const fileName of requiredFiles) {
    const entry = zip.file(fileName);
    if (!entry) {
      throw new Error(`Missing ${fileName}`);
    }
    result[fileName] = await entry.async('string');
  }

  return result;
}

const toNumber = (value) => {
  const parsed = Number(String(value ?? '').replaceAll(',', '').trim());
  if (!Number.isFinite(parsed)) {
    return 0;
  }
  return parsed;
};

const toPercent = (value) => `${(value * 100).toFixed(1)}%`;

const getPriority = (reason) => {
  if (/5xx/i.test(reason)) {
    return 'P0';
  }
  if (/404|Discovered|Crawled|Duplicate/i.test(reason)) {
    return 'P1';
  }
  return 'P2';
};

const getRecommendedAction = (reason) => {
  if (/5xx/i.test(reason)) {
    return 'Correlate GSC example URLs with Nginx, PM2, Sentry, database, and upstream logs; fix and run a full sitemap audit.';
  }
  if (/404/i.test(reason)) {
    return 'Remove bad internal links and sitemap entries; redirect only when a true equivalent exists, otherwise keep 404 or 410.';
  }
  if (/redirect/i.test(reason)) {
    return 'Keep source URLs out of the sitemap and internal links, and link directly to the canonical destination.';
  }
  if (/robots/i.test(reason)) {
    return 'Validate intent; robots blocking is not a deindexing mechanism for already indexed URLs.';
  }
  if (/noindex/i.test(reason)) {
    return 'Confirm intentional exclusions and ensure they are absent from the sitemap.';
  }
  if (/Alternate/i.test(reason)) {
    return 'Usually informational; verify the canonical target is 200, indexable, and used by internal links.';
  }
  if (/Discovered/i.test(reason)) {
    return 'Improve crawl paths and page distinctiveness; reduce low-value inventory and synthetic last-modified churn.';
  }
  if (/Crawled/i.test(reason)) {
    return 'Review representative templates for thin or duplicate content, weak intent match, rendering, and internal links.';
  }
  return 'Align canonical, redirects, sitemap, internal links, and content signals.';
};

const comparePriority = (left, right) => {
  const rank = { P0: 0, P1: 1, P2: 2 };
  return rank[left.priority] - rank[right.priority] || right.pages - left.pages;
};

async function main() {
  const data = await readExport(input);
  const chart = parseCsv(data['Chart.csv'])
    .map((row) => ({
      date: row.Date,
      notIndexed: toNumber(row['Not indexed']),
      indexed: toNumber(row.Indexed),
      impressions: toNumber(row.Impressions),
    }))
    .filter((row) => row.date)
    .sort((left, right) => left.date.localeCompare(right.date));

  if (chart.length === 0) {
    throw new Error('Chart.csv has no data');
  }

  const issues = parseCsv(data['Critical issues.csv']).map((row) => ({
    reason: row.Reason,
    source: row.Source,
    validation: row.Validation,
    pages: toNumber(row.Pages),
    priority: getPriority(row.Reason),
    action: getRecommendedAction(row.Reason),
  }));
  const metadata = Object.fromEntries(
    parseCsv(data['Metadata.csv']).map((row) => [row.Property, row.Value]),
  );
  const first = chart[0];
  const latest = chart[chart.length - 1];
  const firstTotal = first.indexed + first.notIndexed;
  const total = latest.indexed + latest.notIndexed;
  const issueTotal = issues.reduce((sum, item) => sum + item.pages, 0);
  const transitions = chart.slice(1).map((row, index) => ({
    date: row.date,
    indexedDelta: row.indexed - chart[index].indexed,
    notIndexedDelta: row.notIndexed - chart[index].notIndexed,
  }));
  const largestIndexedGain = transitions.reduce(
    (best, item) => (item.indexedDelta > best.indexedDelta ? item : best),
    { date: first.date, indexedDelta: 0, notIndexedDelta: 0 },
  );
  const initialIndexRate = firstTotal > 0 ? first.indexed / firstTotal : 0;
  const currentIndexRate = total > 0 ? latest.indexed / total : 0;

  issues.sort(comparePriority);

  const report = {
    generatedAt: new Date().toISOString(),
    source: path.resolve(input),
    sitemapScope: metadata.Sitemap ?? null,
    period: {
      start: first.date,
      end: latest.date,
      rows: chart.length,
    },
    summary: {
      indexed: latest.indexed,
      notIndexed: latest.notIndexed,
      total,
      indexRate: currentIndexRate,
      indexRateChangePoints: (currentIndexRate - initialIndexRate) * 100,
      indexedDelta: latest.indexed - first.indexed,
      issueTotal,
      reconciles: issueTotal === latest.notIndexed,
      largestIndexedGain,
    },
    issues: issues.map((item) => ({
      ...item,
      share: latest.notIndexed > 0 ? item.pages / latest.notIndexed : 0,
    })),
    chart,
  };

  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(
    path.join(outputDir, 'gsc-coverage-analysis.json'),
    `${JSON.stringify(report, null, 2)}\n`,
  );

  const issueRows = report.issues
    .map(
      (item) =>
        `| ${item.priority} | ${item.reason} | ${item.pages} | ${toPercent(item.share)} | ${item.validation} | ${item.action} |`,
    )
    .join('\n');
  const rateChangePrefix = report.summary.indexRateChangePoints >= 0 ? '+' : '';
  const markdown = `# Google Search Console coverage analysis

Generated: ${report.generatedAt}

- Period: ${first.date} → ${latest.date}
- Indexed: **${latest.indexed}**
- Not indexed: **${latest.notIndexed}**
- Known URLs: **${total}**
- Index rate: **${toPercent(currentIndexRate)}** (${rateChangePrefix}${report.summary.indexRateChangePoints.toFixed(1)} points)
- Largest one-day indexed gain: **+${largestIndexedGain.indexedDelta}** on ${largestIndexedGain.date}
- Issue totals reconcile: **${report.summary.reconciles ? 'yes' : 'no'}**

| Priority | Reason | Pages | Share | Validation | Action |
|---|---|---:|---:|---|---|
${issueRows}

The summary export does not contain URL examples. Export or copy examples for 5xx, 404, discovered, crawled, and duplicate groups before route-level fixes.
`;

  await fs.writeFile(path.join(outputDir, 'gsc-coverage-analysis.md'), markdown);
  console.log(
    `[gsc] indexed=${latest.indexed} not_indexed=${latest.notIndexed} index_rate=${toPercent(currentIndexRate)}`,
  );

  if (strict && issues.some((item) => item.priority === 'P0' && item.pages > 0)) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error('[gsc] failed', error instanceof Error ? error.stack : String(error));
  process.exit(1);
});
