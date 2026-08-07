# Weekly Control Loop — PersianToolbox Growth

**Version**: 1.0  
**Created**: 2026-08-08

---

## Overview

Every 7 days, execute the weekly control loop to make data-driven decisions about growth activities.

---

## Decision Score Inputs

### SEARCH Metrics

| Metric | Source | Target |
|--------|--------|--------|
| Clicks | Google Search Console | +20% WoW |
| Impressions | Google Search Console | +30% WoW |
| CTR | Google Search Console | >8% |
| Avg Position | Google Search Console | <7.0 |
| Trend | Compare 7d vs 28d | Positive |

### PRODUCT Metrics

| Metric | Source | Target |
|--------|--------|--------|
| Tool Starts | Self-hosted analytics | +15% WoW |
| Completions | Self-hosted analytics | +15% WoW |
| Completion Rate | Completions / Starts | >70% |
| Exports | Self-hosted analytics | +10% WoW |
| Errors | Self-hosted analytics | <2% |

### SOCIAL Metrics

| Metric | Source | Target |
|--------|--------|--------|
| Reach | Instagram Insights | >1000/reel |
| Saves | Instagram Insights | >50/reel |
| Shares | Instagram Insights | >20/reel |
| Link Clicks | Instagram Insights | >10/reel |
| Profile Visits | Instagram Insights | >100/week |
| Follows | Instagram Insights | >50/week |

### BUSINESS Metrics

| Metric | Source | Target |
|--------|--------|--------|
| Signups | Self-hosted analytics | +20% WoW |
| Checkouts | Payment system | +10% WoW |
| Revenue | Payment system | +10% WoW |
| Returning Users | Analytics | >20% |

---

## Weekly Actions

### 1. PROMOTE

Double down on top performers.

**Criteria**:
- Top 3 performing content pieces
- Tools with highest conversion rate
- SEO pages with improving rankings

**Actions**:
- Create more content in winning clusters
- Increase posting frequency for winning formats
- Allocate more resources to high-performing tools

### 2. ITERATE

Test new angles for promising but underperforming assets.

**Criteria**:
- Content with good reach but low engagement
- Tools with high starts but low completion
- SEO pages with high impressions but low CTR

**Actions**:
- Test new hooks for underperforming Reels
- Improve tool UX for drop-off points
- Rewrite meta descriptions for low-CTR pages

### 3. FIX

Remove bottlenecks in landing/product/SEO.

**Criteria**:
- Pages with high bounce rate
- Tools with error rates >2%
- SEO pages with technical issues

**Actions**:
- Fix broken links or 404s
- Resolve tool errors
- Fix canonical or schema issues

### 4. PAUSE

Stop wasting resources on low-value topics.

**Criteria**:
- Content with consistently low performance
- Tools with minimal usage
- SEO pages with no search demand

**Actions**:
- Remove from content queue
- Deprioritize in resource allocation
- Document learnings for future reference

### 5. EXPAND

Create related content for winning clusters.

**Criteria**:
- Top-performing tool clusters
- Content angles with high engagement
- SEO pages with ranking momentum

**Actions**:
- Create new content angles for same tools
- Add supporting blog posts
- Expand internal linking

---

## Weekly Scorecard

Location: `docs/growth/weekly-scorecards/YYYY-WXX.md`

### Template

```markdown
# Weekly Scorecard — YYYY-WXX

**Period**: YYYY-MM-DD to YYYY-MM-DD  
**Week Number**: XX

## Summary

[One paragraph summary of the week]

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

## Top Performers

### Content
1. [Content piece] — [why it performed well]
2. [Content piece] — [why it performed well]
3. [Content piece] — [why it performed well]

### Tools
1. [Tool] — [performance metric]
2. [Tool] — [performance metric]
3. [Tool] — [performance metric]

### SEO Pages
1. [Page] — [performance metric]
2. [Page] — [performance metric]
3. [Page] — [performance metric]

## Decisions

### PROMOTE
- [What to promote and why]

### ITERATE
- [What to iterate and why]

### FIX
- [What to fix and why]

### PAUSE
- [What to pause and why]

### EXPAND
- [What to expand and why]

## Next Week Priorities

1. [Priority]
2. [Priority]
3. [Priority]

## Learnings

- [What we learned this week]
- [What to try next week]
```

---

## Execution Timeline

### Monday

1. Collect metrics from all sources
2. Update weekly scorecard
3. Make promotion/iteration decisions
4. Update content queue for the week

### Tuesday-Thursday

1. Execute content production
2. Implement SEO changes
3. Fix identified bottlenecks
4. Test new approaches

### Friday

1. Review week's performance
2. Prepare next week's plan
3. Update documentation
4. Commit changes

### Weekend

1. Monitor production health
2. Respond to audience engagement
3. Prepare for next week

---

## Automation

### Data Collection

| Script | Purpose | Frequency |
|--------|---------|-----------|
| `scripts/growth/weekly-scorecard.ts` | Generate scorecard | Weekly |
| `scripts/growth/gsc-fetcher.ts` | Fetch GSC data | Weekly |
| `scripts/growth/hero-tool-scorer.ts` | Score hero tools | Weekly |

### Reporting

| Output | Location | Format |
|--------|----------|--------|
| Weekly scorecard | `docs/growth/weekly-scorecards/` | Markdown |
| Hero tool scores | `docs/growth/hero-scores.json` | JSON |
| Content performance | `docs/growth/content-performance.json` | JSON |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-08-08 | Initial weekly loop |
