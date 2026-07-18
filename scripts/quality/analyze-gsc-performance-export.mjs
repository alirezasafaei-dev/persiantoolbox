#!/usr/bin/env node
/* eslint-disable no-console */

import fs from 'node:fs/promises';
import path from 'node:path';

const argv = process.argv.slice(2);
const getArg = (name, fallback) => {
  const index = argv.indexOf(name);
  return index >= 0 ? (argv[index + 1] ?? fallback) : fallback;
};

const positionalInput = argv.find((value) => !value.startsWith('--'));
const input = getArg('--input', positionalInput);
const outputDir = getArg('--output-dir', 'reports/seo');
const canonicalHost = getArg('--canonical-host', 'persiantoolbox.ir');
const opportunityMinImpressions = Number(getArg('--opportunity-min-impressions', '20'));
const requiredFiles = [
  'Chart.csv',
  'Queries.csv',
  'Pages.csv',
  'Countries.csv',
  'Devices.csv',
  'Search appearance.csv',
  'Filters.csv',
];

if (!input) {
  console.error(
    'Usage: node scripts/quality/analyze-gsc-performance-export.mjs --input <zip-or-directory> [--output-dir reports/seo] [--canonical-host persiantoolbox.ir]',
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
      if (row.some(Boolean)) rows.push(row);
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

  if (rows.length === 0) return [];
  const headers = rows.shift().map((header) => header.replace(/^\uFEFF/, '').trim());
  return rows.map((values) =>
    Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ''])),
  );
}

async function readExport(source) {
  const absolutePath = path.resolve(source);
  const stats = await fs.stat(absolutePath);

  if (stats.isDirectory()) {
    return Object.fromEntries(
      await Promise.all(
        requiredFiles.map(async (fileName) => [
          fileName,
          await fs.readFile(path.join(absolutePath, fileName), 'utf8'),
        ]),
      ),
    );
  }

  if (!absolutePath.toLowerCase().endsWith('.zip')) {
    throw new Error('Input must be a Search Console ZIP export or extracted directory');
  }

  const { default: JSZip } = await import('jszip');
  const zip = await JSZip.loadAsync(await fs.readFile(absolutePath));
  const result = {};
  for (const fileName of requiredFiles) {
    const entry = zip.file(fileName);
    if (!entry) throw new Error(`Missing ${fileName}`);
    result[fileName] = await entry.async('string');
  }
  return result;
}

const toNumber = (value) => {
  const parsed = Number(String(value ?? '').replaceAll(',', '').replace('%', '').trim());
  return Number.isFinite(parsed) ? parsed : 0;
};
const toRatio = (value) => {
  const text = String(value ?? '').trim();
  if (!text) return 0;
  return text.endsWith('%') ? toNumber(text) / 100 : toNumber(text);
};
const percent = (value) => `${(value * 100).toFixed(2)}%`;
const weightedPosition = (rows) => {
  const impressions = rows.reduce((sum, row) => sum + row.impressions, 0);
  if (impressions === 0) return 0;
  return rows.reduce((sum, row) => sum + row.position * row.impressions, 0) / impressions;
};
const summarize = (rows) => {
  const clicks = rows.reduce((sum, row) => sum + row.clicks, 0);
  const impressions = rows.reduce((sum, row) => sum + row.impressions, 0);
  return {
    clicks,
    impressions,
    ctr: impressions > 0 ? clicks / impressions : 0,
    position: weightedPosition(rows),
  };
};

function canonicalPath(rawUrl) {
  try {
    const url = new URL(rawUrl);
    return `${url.pathname}${url.search}`;
  } catch {
    return rawUrl;
  }
}

function hostOf(rawUrl) {
  try {
    return new URL(rawUrl).hostname.toLowerCase();
  } catch {
    return '';
  }
}

function escapeCell(value) {
  return String(value ?? '').replaceAll('|', '\\|').replaceAll('\n', ' ');
}

function markdownTable(headers, rows) {
  const head = `| ${headers.join(' | ')} |`;
  const separator = `|${headers.map(() => '---').join('|')}|`;
  const body = rows.map((row) => `| ${row.map(escapeCell).join(' | ')} |`).join('\n');
  return `${head}\n${separator}\n${body}`;
}

async function main() {
  const raw = await readExport(input);
  const filters = parseCsv(raw['Filters.csv']).map((row) => ({
    filter: row.Filter,
    value: row.Value,
  }));
  const pageFilter = filters.find((item) => item.filter.toLowerCase() === 'page');

  const chart = parseCsv(raw['Chart.csv'])
    .map((row) => ({
      date: row.Date,
      clicks: toNumber(row.Clicks),
      impressions: toNumber(row.Impressions),
      ctr: toRatio(row.CTR),
      position: toNumber(row.Position),
    }))
    .filter((row) => row.date)
    .sort((left, right) => left.date.localeCompare(right.date));
  if (chart.length === 0) throw new Error('Chart.csv has no dated rows');

  const queries = parseCsv(raw['Queries.csv']).map((row) => ({
    query: row['Top queries'],
    clicks: toNumber(row.Clicks),
    impressions: toNumber(row.Impressions),
    ctr: toRatio(row.CTR),
    position: toNumber(row.Position),
  }));
  const pages = parseCsv(raw['Pages.csv']).map((row) => ({
    url: row['Top pages'],
    host: hostOf(row['Top pages']),
    path: canonicalPath(row['Top pages']),
    clicks: toNumber(row.Clicks),
    impressions: toNumber(row.Impressions),
    ctr: toRatio(row.CTR),
    position: toNumber(row.Position),
  }));
  const devices = parseCsv(raw['Devices.csv']).map((row) => ({
    device: row.Device,
    clicks: toNumber(row.Clicks),
    impressions: toNumber(row.Impressions),
    ctr: toRatio(row.CTR),
    position: toNumber(row.Position),
  }));
  const countries = parseCsv(raw['Countries.csv']).map((row) => ({
    country: row.Country,
    clicks: toNumber(row.Clicks),
    impressions: toNumber(row.Impressions),
    ctr: toRatio(row.CTR),
    position: toNumber(row.Position),
  }));

  const totals = summarize(chart);
  const recent28 = summarize(chart.slice(-28));
  const previous28 = summarize(chart.slice(-56, -28));

  const groupedPages = new Map();
  for (const page of pages) {
    const current = groupedPages.get(page.path) ?? [];
    current.push(page);
    groupedPages.set(page.path, current);
  }

  const aggregatedPages = [...groupedPages.entries()]
    .map(([pagePath, entries]) => ({
      path: pagePath,
      hosts: [...new Set(entries.map((entry) => entry.host).filter(Boolean))].sort(),
      ...summarize(entries),
    }))
    .sort((left, right) => right.clicks - left.clicks || right.impressions - left.impressions);

  const duplicateHosts = aggregatedPages
    .filter((page) => page.hosts.length > 1)
    .sort((left, right) => right.impressions - left.impressions);
  const nonCanonicalHostRows = pages.filter((page) => page.host && page.host !== canonicalHost);
  const nonCanonicalHostSummary = summarize(nonCanonicalHostRows);
  const opportunities = aggregatedPages
    .filter(
      (page) =>
        page.impressions >= opportunityMinImpressions &&
        page.position >= 4 &&
        page.position <= 15 &&
        page.ctr < 0.08,
    )
    .sort((left, right) => right.impressions - left.impressions)
    .slice(0, 25);

  const report = {
    generatedAt: new Date().toISOString(),
    source: path.resolve(input),
    canonicalHost,
    filters,
    scope: {
      isWholePropertyExport: !pageFilter,
      pageFilter: pageFilter?.value ?? null,
      chartRows: chart.length,
      queryRows: queries.length,
      pageRows: pages.length,
    },
    period: { start: chart[0].date, end: chart.at(-1).date },
    totals,
    comparisons: {
      recent28,
      previous28,
      clickGrowth:
        previous28.clicks > 0 ? (recent28.clicks - previous28.clicks) / previous28.clicks : null,
      impressionGrowth:
        previous28.impressions > 0
          ? (recent28.impressions - previous28.impressions) / previous28.impressions
          : null,
    },
    canonicalization: {
      duplicatePathCount: duplicateHosts.length,
      nonCanonicalHostSummary,
      duplicateHosts,
    },
    topPages: aggregatedPages.slice(0, 25),
    topQueries: [...queries]
      .sort((left, right) => right.clicks - left.clicks || right.impressions - left.impressions)
      .slice(0, 25),
    opportunities,
    devices,
    countries: [...countries].sort((left, right) => right.clicks - left.clicks).slice(0, 25),
  };

  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(
    path.join(outputDir, 'gsc-performance-analysis.json'),
    `${JSON.stringify(report, null, 2)}\n`,
  );

  const topPageRows = report.topPages.slice(0, 15).map((page) => [
    page.path,
    page.clicks,
    page.impressions,
    percent(page.ctr),
    page.position.toFixed(2),
    page.hosts.join(', '),
  ]);
  const opportunityRows = opportunities.slice(0, 15).map((page) => [
    page.path,
    page.clicks,
    page.impressions,
    percent(page.ctr),
    page.position.toFixed(2),
  ]);
  const hostRows = duplicateHosts.slice(0, 20).map((page) => [
    page.path,
    page.clicks,
    page.impressions,
    page.hosts.join(', '),
  ]);
  const growth = report.comparisons;

  const markdown = `# Google Search Console performance analysis

Generated: ${report.generatedAt}

- Period: ${report.period.start} → ${report.period.end}
- Whole-property export: **${report.scope.isWholePropertyExport ? 'yes' : 'no'}**
- Page filter: **${report.scope.pageFilter ?? 'none'}**
- Clicks: **${totals.clicks}**
- Impressions: **${totals.impressions}**
- CTR: **${percent(totals.ctr)}**
- Average position: **${totals.position.toFixed(2)}**
- Recent 28d clicks: **${recent28.clicks}** (${growth.clickGrowth == null ? 'n/a' : percent(growth.clickGrowth)})
- Recent 28d impressions: **${recent28.impressions}** (${growth.impressionGrowth == null ? 'n/a' : percent(growth.impressionGrowth)})
- Paths appearing on multiple hosts: **${duplicateHosts.length}**
- Non-canonical host impressions: **${nonCanonicalHostSummary.impressions}**

## Top pages (hosts consolidated by path)

${markdownTable(['Path', 'Clicks', 'Impressions', 'CTR', 'Position', 'Hosts'], topPageRows)}

## High-impression opportunities

${opportunityRows.length > 0 ? markdownTable(['Path', 'Clicks', 'Impressions', 'CTR', 'Position'], opportunityRows) : 'No opportunities matched the configured thresholds.'}

## Multi-host paths

${hostRows.length > 0 ? markdownTable(['Path', 'Clicks', 'Impressions', 'Hosts'], hostRows) : 'No paths appeared on multiple hosts.'}

## Interpretation guardrails

- Page totals can exceed property-chart impressions because multiple site URLs can appear in one result set.
- Query tables can omit anonymized or low-volume searches.
- A three-month export can contain historical hosts and redirects; verify current behavior before changing application routing.
`;

  await fs.writeFile(path.join(outputDir, 'gsc-performance-analysis.md'), markdown);
  console.log(
    `[gsc-performance] clicks=${totals.clicks} impressions=${totals.impressions} ctr=${percent(totals.ctr)} top=${aggregatedPages[0]?.path ?? 'n/a'} duplicate_hosts=${duplicateHosts.length}`,
  );
}

main().catch((error) => {
  console.error('[gsc-performance] failed', error instanceof Error ? error.stack : String(error));
  process.exit(1);
});
