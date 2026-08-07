# Weekly Growth Report Automation — Implementation Plan

**Version**: 1.0  
**Created**: 2026-08-08

---

## Executive Summary

Create a Node.js script at `scripts/growth/weekly-growth-report.ts` that:
1. Fetches analytics data from the self-hosted PostgreSQL database (or admin API)
2. Calculates week-over-week (WoW) changes for all metrics defined in `docs/growth/weekly-loop.md`
3. Generates a markdown report at `docs/growth/weekly-scorecards/YYYY-WXX.md`
4. Detects anomalies (traffic drops >20%, conversion drops >15%, error spikes)
5. Can run via cron (weekly) or manually

---

## Data Sources & API Endpoints

### Primary: Direct PostgreSQL Queries (Recommended)
Connect to `DATABASE_URL` and query:
- `analytics_summary` — total events
- `analytics_counters` — event/path counters by `kind`
- `analytics_daily` — daily aggregates (last 90 days)
- `usage_tracking` — user tool usage
- `payments` / `checkouts` — revenue data
- `users` / `sessions` — signup data

### Fallback: Admin Analytics API
```
GET /api/admin/analytics?range=7d
Authorization: Admin session cookie or API key
```
Returns: `totalEvents`, `topPaths`, `topEvents`, `dailyViews`, `categoryBreakdown`, `rolePathBreakdown`

### Public Stats API (Limited)
```
GET /api/public/stats
```
Returns: `totalViews`, `totalCalculations`, `pdfFilesProcessed`, `financeCalculations`

---

## Metrics to Collect (from weekly-loop.md)

### SEARCH Metrics (GSC — Manual Export Required)
| Metric | Source | Target |
|--------|--------|--------|
| Clicks | GSC Export | +20% WoW |
| Impressions | GSC Export | +30% WoW |
| CTR | GSC Export | >8% |
| Avg Position | GSC Export | <7.0 |

### PRODUCT Metrics (Self-Hosted Analytics)
| Metric | Event/Query | Target |
|--------|-------------|--------|
| Tool Starts | `tool_start` count | +15% WoW |
| Completions | `tool_complete` count | +15% WoW |
| Completion Rate | `tool_complete` / `tool_start` | >70% |
| Exports | `result_export` count | +10% WoW |
| Errors | `tool_error` count | <2% |

### SOCIAL Metrics (Instagram — Manual Export Required)
| Metric | Source | Target |
|--------|--------|--------|
| Reach | Instagram Insights | >1000/reel |
| Saves | Instagram Insights | >50/reel |
| Shares | Instagram Insights | >20/reel |
| Link Clicks | Instagram Insights | >10/reel |
| Profile Visits | Instagram Insights | >100/week |
| Follows | Instagram Insights | >50/week |

### BUSINESS Metrics (Self-Hosted + Payments)
| Metric | Source | Target |
|--------|--------|--------|
| Signups | `signup_complete` count | +20% WoW |
| Checkouts | `checkout_start` count | +10% WoW |
| Revenue | `payments` (completed) sum | +10% WoW |
| Returning Users | `usage_tracking` distinct users | >20% |

---

## Script Architecture

### File: `scripts/growth/weekly-growth-report.ts`

```typescript
#!/usr/bin/env node

/**
 * Weekly Growth Report Generator — PersianToolbox
 * 
 * Usage:
 *   node scripts/growth/weekly-growth-report.ts           # Current week
 *   node scripts/growth/weekly-growth-report.ts --week=2026-W32  # Specific week
 *   node scripts/growth/weekly-growth-report.ts --output=custom-path.md
 * 
 * Output:
 *   docs/growth/weekly-scorecards/YYYY-WXX.md
 */

import { query } from '@/lib/server/db';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Types
interface WeeklyMetrics {
  search: SearchMetrics;
  product: ProductMetrics;
  social: SocialMetrics;
  business: BusinessMetrics;
}

interface SearchMetrics {
  clicks: number;
  impressions: number;
  ctr: number;
  avgPosition: number;
}

interface ProductMetrics {
  toolStarts: number;
  completions: number;
  completionRate: number;
  exports: number;
  errors: number;
  errorRate: number;
}

interface SocialMetrics {
  reach: number;
  saves: number;
  shares: number;
  linkClicks: number;
  profileVisits: number;
  follows: number;
}

interface BusinessMetrics {
  signups: number;
  checkouts: number;
  revenue: number;
  returningUsers: number;
  returningUserRate: number;
}

interface WoWComparison {
  current: WeeklyMetrics;
  previous: WeeklyMetrics;
  changes: Record<string, number>; // percentage changes
  anomalies: Anomaly[];
}

interface Anomaly {
  metric: string;
  current: number;
  previous: number;
  changePct: number;
  severity: 'warning' | 'critical';
  message: string;
}
```

### Key Functions

1. **`getWeekRange(weekStr?: string)`** — Returns `{ start: Date, end: Date, weekLabel: string }` for ISO week
2. **`fetchProductMetrics(start, end)`** — Queries `analytics_daily` for tool events
3. **`fetchBusinessMetrics(start, end)`** — Queries `payments`, `checkouts`, `users`, `usage_tracking`
4. **`fetchSearchMetrics(weekLabel)`** — Reads GSC export file (manual) or returns placeholder
5. **`fetchSocialMetrics(weekLabel)`** — Reads Instagram export file (manual) or returns placeholder
6. **`calculateWoW(current, previous)`** — Computes % changes
7. **`detectAnomalies(changes)`** — Flags drops >20% (traffic), >15% (conversion), error rate >5%
8. **`generateMarkdown(weekLabel, comparison)`** — Produces report per `weekly-loop.md` template
9. **`saveReport(markdown, weekLabel)`** — Writes to `docs/growth/weekly-scorecards/YYYY-WXX.md`

---

## Database Queries

### Product Metrics (Last 7 Days)
```sql
-- Tool starts
SELECT SUM(count) FROM analytics_daily 
WHERE kind = 'event' AND key = 'tool_start' 
AND date >= CURRENT_DATE - INTERVAL '7 days';

-- Tool completions
SELECT SUM(count) FROM analytics_daily 
WHERE kind = 'event' AND key = 'tool_complete' 
AND date >= CURRENT_DATE - INTERVAL '7 days';

-- Exports
SELECT SUM(count) FROM analytics_daily 
WHERE kind = 'event' AND key = 'result_export' 
AND date >= CURRENT_DATE - INTERVAL '7 days';

-- Errors
SELECT SUM(count) FROM analytics_daily 
WHERE kind = 'event' AND key = 'tool_error' 
AND date >= CURRENT_DATE - INTERVAL '7 days';

-- Daily breakdown for trend chart
SELECT date, SUM(count) as views FROM analytics_daily 
WHERE kind = 'path' AND date >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY date ORDER BY date ASC;
```

### Business Metrics (Last 7 Days)
```sql
-- Signups
SELECT COUNT(*) FROM users 
WHERE created_at >= EXTRACT(EPOCH FROM (CURRENT_DATE - INTERVAL '7 days')) * 1000;

-- Checkouts started
SELECT COUNT(*) FROM checkouts 
WHERE created_at >= EXTRACT(EPOCH FROM (CURRENT_DATE - INTERVAL '7 days')) * 1000;

-- Revenue (completed payments)
SELECT SUM(amount) FROM payments 
WHERE status = 'completed' 
AND completed_at >= EXTRACT(EPOCH FROM (CURRENT_DATE - INTERVAL '7 days')) * 1000;

-- Returning users (used tool on 2+ days in week)
SELECT COUNT(DISTINCT user_id) FROM usage_tracking 
WHERE date >= (CURRENT_DATE - INTERVAL '7 days')::text
GROUP BY user_id HAVING COUNT(DISTINCT date) > 1;
```

### Previous Week Comparison
Same queries with `CURRENT_DATE - INTERVAL '14 days'` to `CURRENT_DATE - INTERVAL '7 days'`

---

## Anomaly Detection Rules

| Metric | Warning Threshold | Critical Threshold |
|--------|-------------------|-------------------|
| Total traffic (page_view) | -20% WoW | -35% WoW |
| Tool starts | -15% WoW | -30% WoW |
| Completion rate | <60% | <45% |
| Error rate | >3% | >5% |
| Signups | -20% WoW | -40% WoW |
| Revenue | -15% WoW | -30% WoW |
| Returning user rate | <15% | <10% |

---

## Output Format

Follows `docs/growth/weekly-loop.md` template exactly:

```markdown
# Weekly Scorecard — 2026-W32

**Period**: 2026-08-04 to 2026-08-10  
**Week Number**: 32

## Summary
[Auto-generated one-paragraph summary highlighting key changes]

## Search Performance
| Metric | This Week | Last Week | Δ% |
|--------|-----------|-----------|-----|
| Clicks | X | Y | Z% |
| Impressions | X | Y | Z% |
| CTR | X% | Y% | Z% |
| Avg Position | X | Y | Z% |

## Product Performance
| Metric | This Week | Last Week | Δ% |
|--------|-----------|-----------|-----|
| Tool Starts | X | Y | Z% |
| Completions | X | Y | Z% |
| Completion Rate | X% | Y% | Z% |
| Exports | X | Y | Z% |

## Social Performance
| Metric | This Week | Last Week | Δ% |
|--------|-----------|-----------|-----|
| Reach | X | Y | Z% |
| Saves | X | Y | Z% |
| Shares | X | Y | Z% |
| Link Clicks | X | Y | Z% |
| New Followers | X | Y | Z% |

## Business Performance
| Metric | This Week | Last Week | Δ% |
|--------|-----------|-----------|-----|
| Signups | X | Y | Z% |
| Checkouts | X | Y | Z% |
| Revenue | $X | $Y | Z% |

## Anomalies Detected
- ⚠️ **Tool Starts**: -23% WoW (below -15% warning threshold)
- 🔴 **Error Rate**: 4.2% (above 3% warning threshold)

## Top Performers
### Content
1. [From GSC/manual] — [reason]

### Tools
1. [Tool] — [tool_start count]
2. [Tool] — [tool_start count]
3. [Tool] — [tool_start count]

### SEO Pages
1. [Page] — [clicks from GSC]
2. [Page] — [clicks from GSC]
3. [Page] — [clicks from GSC]

## Decisions
### PROMOTE
- [Auto-suggested based on top performers]

### ITERATE
- [Auto-suggested based on high impressions/low CTR]

### FIX
- [Auto-suggested based on anomalies]

### PAUSE
- [Auto-suggested based on consistently low performers]

### EXPAND
- [Auto-suggested based on winning clusters]

## Next Week Priorities
1. [From FIX items]
2. [From ITERATE items]
3. [From EXPAND items]

## Learnings
- [Auto-generated from anomaly patterns]
```

---

## Cron Setup

### On VPS (crontab -e)
```bash
# Weekly growth report - every Monday 6 AM
0 6 * * 1 cd /home/ubuntu/persiantoolbox && pnpm tsx scripts/growth/weekly-growth-report.ts >> /home/ubuntu/logs/weekly-growth-report.log 2>&1
```

### Local Development
```bash
# Run manually
pnpm tsx scripts/growth/weekly-growth-report.ts

# Run for specific week
pnpm tsx scripts/growth/weekly-growth-report.ts --week=2026-W31
```

---

## Dependencies

- `tsx` (already in devDependencies for running TypeScript scripts)
- `@/lib/server/db` (existing PostgreSQL client)
- Node.js built-ins: `fs`, `path`, `url`

---

## Implementation Steps

1. **Create script file**: `scripts/growth/weekly-growth-report.ts`
2. **Add helper functions** for week range calculation, DB queries, anomaly detection
3. **Implement markdown generator** following weekly-loop.md template
4. **Add CLI argument parsing** (--week, --output, --help)
5. **Test with current data** (run manually)
6. **Add to package.json scripts**: `"growth:weekly": "tsx scripts/growth/weekly-growth-report.ts"`
7. **Document in production-runbook.md** under Monitoring section
8. **Set up cron on VPS** (after user approval)

---

## Manual Data Inputs (GSC & Instagram)

Since GSC and Instagram have no API access, the script will:
1. Look for manual export files:
   - `docs/growth/manual-exports/gsc-YYYY-WXX.json`
   - `docs/growth/manual-exports/instagram-YYYY-WXX.json`
2. If not found, use placeholder values and add note to report
3. Provide a helper command to create template export files:
   ```bash
   pnpm tsx scripts/growth/weekly-growth-report.ts --create-templates
   ```

### GSC Export Template
```json
{
  "week": "2026-W32",
  "clicks": 1250,
  "impressions": 15600,
  "ctr": 8.0,
  "avgPosition": 6.5,
  "topQueries": [
    {"query": "محاسبه حقوق", "clicks": 45, "impressions": 520, "ctr": 8.6, "position": 3.2},
    {"query": "تبدیل تاریخ", "clicks": 38, "impressions": 480, "ctr": 7.9, "position": 4.1}
  ],
  "topPages": [
    {"page": "/salary", "clicks": 52, "impressions": 610, "ctr": 8.5, "position": 2.8},
    {"page": "/date-tools/shamsi-gregorian", "clicks": 41, "impressions": 490, "ctr": 8.3, "position": 3.5}
  ]
}
```

### Instagram Export Template
```json
{
  "week": "2026-W32",
  "reach": 12500,
  "saves": 680,
  "shares": 320,
  "linkClicks": 180,
  "profileVisits": 450,
  "follows": 65,
  "topReels": [
    {"title": "Reel title", "reach": 5200, "saves": 280, "shares": 120, "linkClicks": 45}
  ]
}
```

---

## Verification Checklist

After implementation:
- [ ] Script runs without errors: `pnpm tsx scripts/growth/weekly-growth-report.ts`
- [ ] Output file created at `docs/growth/weekly-scorecards/YYYY-WXX.md`
- [ ] Markdown follows weekly-loop.md template exactly
- [ ] WoW calculations are correct (verify manually)
- [ ] Anomalies detected correctly (test with known data)
- [ ] Manual export templates work
- [ ] Package.json script added
- [ ] Documentation updated in production-runbook.md
- [ ] Cron job configured on VPS (after user approval)

---

## File Paths Summary

| File | Purpose |
|------|---------|
| `scripts/growth/weekly-growth-report.ts` | Main script |
| `docs/growth/weekly-scorecards/YYYY-WXX.md` | Generated reports |
| `docs/growth/manual-exports/gsc-YYYY-WXX.json` | Manual GSC data |
| `docs/growth/manual-exports/instagram-YYYY-WXX.json` | Manual Instagram data |
| `docs/growth/weekly-loop.md` | Template reference |
| `docs/ops/deploy-and-risk-log.md` | Deploy history (for correlation) |

---

## Next Actions

1. **Implement the script** following this plan
2. **Test with production data** (run manually first)
3. **Add to package.json** scripts
4. **Update production-runbook.md** with the new monitoring command
5. **Configure cron** on VPS after user approval