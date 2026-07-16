#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';

const argv = process.argv.slice(2);
const arg = (name, fallback) => {
  const i = argv.indexOf(name);
  return i < 0 ? fallback : (argv[i + 1] ?? fallback);
};
const input = arg('--input', argv.find((v) => !v.startsWith('--')));
const outputDir = arg('--output-dir', 'reports/seo');
const strict = argv.includes('--strict');
const files = ['Chart.csv', 'Critical issues.csv', 'Non-critical issues.csv', 'Metadata.csv'];
if (!input) {
  console.error('Usage: node scripts/quality/analyze-gsc-coverage-export.mjs --input <zip-or-directory> [--output-dir reports/seo] [--strict]');
  process.exit(2);
}

function csv(text) {
  const rows = [];
  let row = [], value = '', quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const c = text[i], n = text[i + 1];
    if (quoted) {
      if (c === '"' && n === '"') { value += '"'; i += 1; }
      else if (c === '"') quoted = false;
      else value += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(value); value = ''; }
    else if (c === '\n') { row.push(value.replace(/\r$/, '')); if (row.some(Boolean)) rows.push(row); row = []; value = ''; }
    else value += c;
  }
  if (value || row.length) { row.push(value.replace(/\r$/, '')); rows.push(row); }
  if (!rows.length) return [];
  const headers = rows.shift().map((h) => h.replace(/^\uFEFF/, '').trim());
  return rows.map((values) => Object.fromEntries(headers.map((h, i) => [h, values[i] ?? ''])));
}

async function readExport(source) {
  const absolute = path.resolve(source);
  if ((await fs.stat(absolute)).isDirectory()) {
    return Object.fromEntries(await Promise.all(files.map(async (name) => [name, await fs.readFile(path.join(absolute, name), 'utf8')])));
  }
  if (!absolute.toLowerCase().endsWith('.zip')) throw new Error('Input must be a ZIP export or extracted directory');
  const { default: JSZip } = await import('jszip');
  const zip = await JSZip.loadAsync(await fs.readFile(absolute));
  const result = {};
  for (const name of files) {
    const entry = zip.file(name);
    if (!entry) throw new Error(`Missing ${name}`);
    result[name] = await entry.async('string');
  }
  return result;
}

const number = (v) => Number(String(v ?? '').replaceAll(',', '').trim()) || 0;
const pct = (v) => `${(v * 100).toFixed(1)}%`;
const priority = (reason) => /5xx/i.test(reason) ? 'P0' : /404|Discovered|Crawled|Duplicate/i.test(reason) ? 'P1' : 'P2';
const action = (reason) => {
  if (/5xx/i.test(reason)) return 'Correlate GSC example URLs with Nginx/PM2/Sentry/database logs; fix and run a full sitemap audit.';
  if (/404/i.test(reason)) return 'Remove bad internal links/sitemap entries; redirect only when a true equivalent exists, otherwise keep 404/410.';
  if (/redirect/i.test(reason)) return 'Keep source URLs out of sitemap/internal links and link directly to the canonical destination.';
  if (/robots/i.test(reason)) return 'Validate intent; robots blocking is not a deindexing mechanism for already indexed URLs.';
  if (/noindex/i.test(reason)) return 'Confirm intentional exclusions and ensure they are absent from sitemap.';
  if (/Alternate/i.test(reason)) return 'Usually informational; verify the canonical target is 200/indexable and used by internal links.';
  if (/Discovered/i.test(reason)) return 'Improve crawl paths and distinctiveness; reduce low-value inventory and synthetic last-modified churn.';
  if (/Crawled/i.test(reason)) return 'Review representative templates for thin/duplicate content, weak intent match, rendering, and internal links.';
  return 'Align canonical, redirects, sitemap, internal links, and content signals.';
};

async function main() {
  const data = await readExport(input);
  const chart = csv(data['Chart.csv']).map((r) => ({ date: r.Date, notIndexed: number(r['Not indexed']), indexed: number(r.Indexed), impressions: number(r.Impressions) })).filter((r) => r.date).sort((a, b) => a.date.localeCompare(b.date));
  if (!chart.length) throw new Error('Chart.csv has no data');
  const issues = csv(data['Critical issues.csv']).map((r) => ({ reason: r.Reason, source: r.Source, validation: r.Validation, pages: number(r.Pages), priority: priority(r.Reason), action: action(r.Reason) }));
  const metadata = Object.fromEntries(csv(data['Metadata.csv']).map((r) => [r.Property, r.Value]));
  const first = chart[0], latest = chart.at(-1);
  const firstTotal = first.indexed + first.notIndexed, total = latest.indexed + latest.notIndexed;
  const issueTotal = issues.reduce((sum, item) => sum + item.pages, 0);
  const transitions = chart.slice(1).map((r, i) => ({ date: r.date, indexedDelta: r.indexed - chart[i].indexed, notIndexedDelta: r.notIndexed - chart[i].notIndexed }));
  const biggest = transitions.reduce((best, item) => item.indexedDelta > best.indexedDelta ? item : best, { date: first.date, indexedDelta: 0, notIndexedDelta: 0 });
  const rank = { P0: 0, P1: 1, P2: 2 };
  issues.sort((a, b) => rank[a.priority] - rank[b.priority] || b.pages - a.pages);
  const report = {
    generatedAt: new Date().toISOString(), source: path.resolve(input), sitemapScope: metadata.Sitemap ?? null,
    period: { start: first.date, end: latest.date, rows: chart.length },
    summary: { indexed: latest.indexed, notIndexed: latest.notIndexed, total, indexRate: latest.indexed / total, indexRateChangePoints: ((latest.indexed / total) - (first.indexed / firstTotal)) * 100, indexedDelta: latest.indexed - first.indexed, issueTotal, reconciles: issueTotal === latest.notIndexed, largestIndexedGain: biggest },
    issues: issues.map((item) => ({ ...item, share: latest.notIndexed ? item.pages / latest.notIndexed : 0 })), chart,
  };
  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(path.join(outputDir, 'gsc-coverage-analysis.json'), `${JSON.stringify(report, null, 2)}\n`);
  const rows = report.issues.map((i) => `| ${i.priority} | ${i.reason} | ${i.pages} | ${pct(i.share)} | ${i.validation} | ${i.action} |`).join('\n');
  const md = `# Google Search Console coverage analysis\n\nGenerated: ${report.generatedAt}\n\n- Period: ${first.date} → ${latest.date}\n- Indexed: **${latest.indexed}**\n- Not indexed: **${latest.notIndexed}**\n- Known URLs: **${total}**\n- Index rate: **${pct(report.summary.indexRate)}** (${report.summary.indexRateChangePoints >= 0 ? '+' : ''}${report.summary.indexRateChangePoints.toFixed(1)} points)\n- Largest one-day indexed gain: **+${biggest.indexedDelta}** on ${biggest.date}\n- Issue totals reconcile: **${report.summary.reconciles ? 'yes' : 'no'}**\n\n| Priority | Reason | Pages | Share | Validation | Action |\n|---|---|---:|---:|---|---|\n${rows}\n\nThe summary export does not contain URL examples. Export/copy examples for 5xx, 404, discovered, crawled, and duplicate groups before route-level fixes.\n`;
  await fs.writeFile(path.join(outputDir, 'gsc-coverage-analysis.md'), md);
  console.log(`[gsc] indexed=${latest.indexed} not_indexed=${latest.notIndexed} index_rate=${pct(report.summary.indexRate)}`);
  if (strict && issues.some((i) => i.priority === 'P0' && i.pages > 0)) process.exitCode = 1;
}
main().catch((error) => { console.error('[gsc] failed', error instanceof Error ? error.stack : String(error)); process.exit(1); });
