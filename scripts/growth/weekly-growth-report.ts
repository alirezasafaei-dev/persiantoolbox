#!/usr/bin/env node

/**
 * Weekly Growth Report — PersianToolbox
 *
 * Generates a markdown scorecard from self-hosted analytics data.
 * Usage:
 *   pnpm growth:weekly
 *   pnpm growth:weekly --week 2026-W32
 *
 * Output:
 *   docs/growth/weekly-scorecards/YYYY-WXX.md
 */

import fs from 'node:fs/promises';
import path from 'node:path';

interface WeekRange {
  start: string;
  end: string;
  label: string;
  prevStart: string;
  prevEnd: string;
}

interface MetricDelta {
  current: number;
  previous: number;
  delta: number;
  deltaPercent: number;
  status: 'up' | 'down' | 'flat';
}

interface Scorecard {
  period: WeekRange;
  search: {
    clicks: MetricDelta;
    impressions: MetricDelta;
    ctr: MetricDelta;
    avgPosition: MetricDelta;
  };
  product: {
    toolStarts: MetricDelta;
    completions: MetricDelta;
    completionRate: MetricDelta;
    exports: MetricDelta;
    errors: MetricDelta;
  };
  business: {
    signups: MetricDelta;
    checkouts: MetricDelta;
    revenue: MetricDelta;
  };
  anomalies: string[];
  decisions: {
    promote: string[];
    iterate: string[];
    fix: string[];
    pause: string[];
    expand: string[];
  };
}

function getCurrentWeek(): WeekRange {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const prevMonday = new Date(monday);
  prevMonday.setDate(monday.getDate() - 7);
  const prevSunday = new Date(sunday);
  prevSunday.setDate(sunday.getDate() - 7);

  const weekNum = getWeekNumber(monday);
  const year = monday.getFullYear();

  return {
    start: monday.toISOString().split('T')[0]!,
    end: sunday.toISOString().split('T')[0]!,
    label: `${year}-W${String(weekNum).padStart(2, '0')}`,
    prevStart: prevMonday.toISOString().split('T')[0]!,
    prevEnd: prevSunday.toISOString().split('T')[0]!,
  };
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
}

function calculateDelta(current: number, previous: number): MetricDelta {
  const delta = current - previous;
  const deltaPercent = previous > 0 ? ((current - previous) / previous) * 100 : current > 0 ? 100 : 0;
  return {
    current,
    previous,
    delta,
    deltaPercent: Math.round(deltaPercent * 10) / 10,
    status: delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat',
  };
}

function detectAnomalies(scorecard: Scorecard): string[] {
  const anomalies: string[] = [];

  // Search anomalies
  if (scorecard.search.clicks.deltaPercent < -20) {
    anomalies.push(`🚨 CRITICAL: Clicks dropped ${Math.abs(scorecard.search.clicks.deltaPercent)}% WoW`);
  } else if (scorecard.search.clicks.deltaPercent < -10) {
    anomalies.push(`⚠️ WARNING: Clicks dropped ${Math.abs(scorecard.search.clicks.deltaPercent)}% WoW`);
  }

  if (scorecard.search.ctr.current < 5) {
    anomalies.push(`⚠️ WARNING: CTR below 5% (${scorecard.search.ctr.current}%)`);
  }

  // Product anomalies
  if (scorecard.product.completionRate.current < 60) {
    anomalies.push(`⚠️ WARNING: Completion rate below 60% (${scorecard.product.completionRate.current}%)`);
  }

  if (scorecard.product.errors.current > 2) {
    anomalies.push(`🚨 CRITICAL: Error rate above 2% (${scorecard.product.errors.current}%)`);
  }

  return anomalies;
}

function generateDecisions(scorecard: Scorecard): Scorecard['decisions'] {
  const decisions = {
    promote: [] as string[],
    iterate: [] as string[],
    fix: [] as string[],
    pause: [] as string[],
    expand: [] as string[],
  };

  // Promote: things performing well
  if (scorecard.search.clicks.deltaPercent > 20) {
    decisions.promote.push('Search clicks growing strongly — maintain current SEO strategy');
  }
  if (scorecard.product.completionRate.current > 75) {
    decisions.promote.push('High completion rate — tool UX is working well');
  }

  // Iterate: promising but underperforming
  if (scorecard.search.ctr.current < 8 && scorecard.search.impressions.deltaPercent > 10) {
    decisions.iterate.push('CTR below 8% but impressions growing — optimize meta descriptions');
  }
  if (scorecard.product.toolStarts.deltaPercent > 10 && scorecard.product.completionRate.deltaPercent < 0) {
    decisions.iterate.push('More starts but lower completion — investigate drop-off points');
  }

  // Fix: bottlenecks
  if (scorecard.search.avgPosition.current > 10) {
    decisions.fix.push('Average position above 10 — improve on-page SEO');
  }
  if (scorecard.product.errors.current > 1) {
    decisions.fix.push('Error rate elevated — investigate tool errors');
  }

  // Pause: low value
  if (scorecard.search.clicks.deltaPercent < -30 && scorecard.search.impressions.deltaPercent < -20) {
    decisions.pause.push('Both clicks and impressions dropping — content may need refresh');
  }

  // Expand: winning areas
  if (scorecard.search.clicks.deltaPercent > 30) {
    decisions.expand.push('Strong click growth — create more content in this cluster');
  }

  return decisions;
}

function generateScorecardMarkdown(scorecard: Scorecard): string {
  const deltaSymbol = (d: MetricDelta) => {
    if (d.status === 'up') return '📈';
    if (d.status === 'down') return '📉';
    return '➡️';
  };

  const formatPercent = (d: MetricDelta) => `${d.deltaPercent > 0 ? '+' : ''}${d.deltaPercent}%`;
  const formatNumber = (n: number) => n.toLocaleString('fa-IR');

  return `# Weekly Scorecard — ${scorecard.period.label}

**Period**: ${scorecard.period.start} to ${scorecard.period.end}  
**Generated**: ${new Date().toISOString().split('T')[0]}

---

## Summary

[Generated by automated weekly report script — add manual summary here]

## Search Performance

| Metric | This Week | Last Week | Δ% | Status |
|--------|-----------|-----------|-----|--------|
| Clicks | ${formatNumber(scorecard.search.clicks.current)} | ${formatNumber(scorecard.search.clicks.previous)} | ${formatPercent(scorecard.search.clicks)} | ${deltaSymbol(scorecard.search.clicks)} |
| Impressions | ${formatNumber(scorecard.search.impressions.current)} | ${formatNumber(scorecard.search.impressions.previous)} | ${formatPercent(scorecard.search.impressions)} | ${deltaSymbol(scorecard.search.impressions)} |
| CTR | ${scorecard.search.ctr.current}% | ${scorecard.search.ctr.previous}% | ${formatPercent(scorecard.search.ctr)} | ${deltaSymbol(scorecard.search.ctr)} |
| Avg Position | ${scorecard.search.avgPosition.current} | ${scorecard.search.avgPosition.previous} | ${formatPercent(scorecard.search.avgPosition)} | ${deltaSymbol(scorecard.search.avgPosition)} |

## Product Performance

| Metric | This Week | Last Week | Δ% | Status |
|--------|-----------|-----------|-----|--------|
| Tool Starts | ${formatNumber(scorecard.product.toolStarts.current)} | ${formatNumber(scorecard.product.toolStarts.previous)} | ${formatPercent(scorecard.product.toolStarts)} | ${deltaSymbol(scorecard.product.toolStarts)} |
| Completions | ${formatNumber(scorecard.product.completions.current)} | ${formatNumber(scorecard.product.completions.previous)} | ${formatPercent(scorecard.product.completions)} | ${deltaSymbol(scorecard.product.completions)} |
| Completion Rate | ${scorecard.product.completionRate.current}% | ${scorecard.product.completionRate.previous}% | ${formatPercent(scorecard.product.completionRate)} | ${deltaSymbol(scorecard.product.completionRate)} |
| Exports | ${formatNumber(scorecard.product.exports.current)} | ${formatNumber(scorecard.product.exports.previous)} | ${formatPercent(scorecard.product.exports)} | ${deltaSymbol(scorecard.product.exports)} |
| Error Rate | ${scorecard.product.errors.current}% | ${scorecard.product.errors.previous}% | ${formatPercent(scorecard.product.errors)} | ${deltaSymbol(scorecard.product.errors)} |

## Business Performance

| Metric | This Week | Last Week | Δ% | Status |
|--------|-----------|-----------|-----|--------|
| Signups | ${formatNumber(scorecard.business.signups.current)} | ${formatNumber(scorecard.business.signups.previous)} | ${formatPercent(scorecard.business.signups)} | ${deltaSymbol(scorecard.business.signups)} |
| Checkouts | ${formatNumber(scorecard.business.checkouts.current)} | ${formatNumber(scorecard.business.checkouts.previous)} | ${formatPercent(scorecard.business.checkouts)} | ${deltaSymbol(scorecard.business.checkouts)} |
| Revenue | ${formatNumber(scorecard.business.revenue.current)} | ${formatNumber(scorecard.business.revenue.previous)} | ${formatPercent(scorecard.business.revenue)} | ${deltaSymbol(scorecard.business.revenue)} |

## Anomalies

${scorecard.anomalies.length > 0 ? scorecard.anomalies.map((a) => `- ${a}`).join('\n') : '- No anomalies detected ✅'}

## Decisions

### PROMOTE
${scorecard.decisions.promote.length > 0 ? scorecard.decisions.promote.map((d) => `- ${d}`).join('\n') : '- [Add promote decisions here]'}

### ITERATE
${scorecard.decisions.iterate.length > 0 ? scorecard.decisions.iterate.map((d) => `- ${d}`).join('\n') : '- [Add iterate decisions here]'}

### FIX
${scorecard.decisions.fix.length > 0 ? scorecard.decisions.fix.map((d) => `- ${d}`).join('\n') : '- [Add fix decisions here]'}

### PAUSE
${scorecard.decisions.pause.length > 0 ? scorecard.decisions.pause.map((d) => `- ${d}`).join('\n') : '- [Add pause decisions here]'}

### EXPAND
${scorecard.decisions.expand.length > 0 ? scorecard.decisions.expand.map((d) => `- ${d}`).join('\n') : '- [Add expand decisions here]'}

## Next Week Priorities

1. [Add priorities here]
2. [Add priorities here]
3. [Add priorities here]

## Learnings

- [Add learnings here]

---

## Data Sources

- **Search**: Google Search Console (manual export required)
- **Product**: Self-hosted analytics (database)
- **Business**: Payment system (database)

## Manual Steps Required

1. Export GSC data for the week and save to \`docs/growth/manual-exports/gsc-${scorecard.period.label}.json\`
2. Export Instagram Insights for the week
3. Update this scorecard with manual data
4. Review anomalies and make decisions

---

*Generated by \`scripts/growth/weekly-growth-report.ts\`*
`;
}

async function main() {
  const weekRange = getCurrentWeek();

  // For now, generate a template scorecard with zeros
  // In production, this would query the database
  const scorecard: Scorecard = {
    period: weekRange,
    search: {
      clicks: calculateDelta(0, 0),
      impressions: calculateDelta(0, 0),
      ctr: calculateDelta(0, 0),
      avgPosition: calculateDelta(0, 0),
    },
    product: {
      toolStarts: calculateDelta(0, 0),
      completions: calculateDelta(0, 0),
      completionRate: calculateDelta(0, 0),
      exports: calculateDelta(0, 0),
      errors: calculateDelta(0, 0),
    },
    business: {
      signups: calculateDelta(0, 0),
      checkouts: calculateDelta(0, 0),
      revenue: calculateDelta(0, 0),
    },
    anomalies: [],
    decisions: {
      promote: [],
      iterate: [],
      fix: [],
      pause: [],
      expand: [],
    },
  };

  scorecard.anomalies = detectAnomalies(scorecard);
  scorecard.decisions = generateDecisions(scorecard);

  const markdown = generateScorecardMarkdown(scorecard);

  const outputDir = path.join(process.cwd(), 'docs/growth/weekly-scorecards');
  await fs.mkdir(outputDir, { recursive: true });
  const outputPath = path.join(outputDir, `${weekRange.label}.md`);
  await fs.writeFile(outputPath, markdown, 'utf-8');

  console.log(`Weekly scorecard generated: ${outputPath}`);
  console.log(`Period: ${weekRange.start} to ${weekRange.end}`);
}

// Only run main when executed directly, not when imported
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Error generating weekly report:', error);
    process.exit(1);
  });
}
