# PersianToolbox Organic Growth Production Plan

**Created**: 2026-08-08  
**Based on**: `docs/superpowers/specs/2026-08-08-30-day-organic-growth-design.md`  
**Status**: Active Execution

---

## Execution Priority

### P0 — Immediate (Today)

1. **Create growth documentation structure** ✅
2. **Audit current analytics implementation**
3. **Establish Hero Tool scoring baseline**
4. **Create Rose Character Bible**
5. **Create UTM generator script**

### P1 — This Week (Days 1-7)

6. **SEO audit and quick fixes**
   - Review meta titles/descriptions for top 10 tools
   - Fix any canonical conflicts
   - Improve internal linking for hero tools
   - Add FAQ schema where missing

7. **Content queue creation**
   - 30-day Reel calendar
   - 10-carousel queue
   - Daily Story prompts

8. **Analytics contract verification**
   - Verify all events are firing correctly
   - Add missing events (tool_start, tool_complete)
   - Validate privacy constraints

### P2 — Next Week (Days 8-14)

9. **First content production**
   - Create Rose character assets (if Google Flow available)
   - Produce first 7 Reels
   - Create first 3 carousels
   - Daily Stories

10. **SEO improvements**
    - Rewrite top 5 underperforming meta descriptions
    - Add internal links to hero tools
    - Create 2-3 supporting blog posts

### P3 — Week 3 (Days 15-21)

11. **Conversion optimization**
    - A/B test CTA placements
    - Improve tool completion flows
    - Add upgrade prompts at optimal moments

12. **Social expansion**
    - Cross-post to Telegram channel
    - Engage with comments
    - Create shareable tool results

### P4 — Week 4 (Days 22-30)

13. **Scale and automate**
    - Automate weekly scorecard generation
    - Create content performance dashboard
    - Document winning patterns
    - Plan next 30-day cycle

---

## File Structure

```
docs/growth/
├── README.md                    # Growth system overview
├── rose-character-bible.md      # Rose identity and guidelines
├── content-system.md            # Content production engine
├── seo-system.md                # SEO opportunity pipeline
├── analytics-contract.md        # Event taxonomy and privacy
├── utm-convention.md            # UTM format and generator
├── production-runbook.md        # Operational procedures
├── weekly-loop.md               # Weekly control loop
├── hero-scores.json             # Current hero tool scores
├── weekly-scorecards/           # Weekly decision logs
│   └── 2026-W32.md
├── content-queue/               # Content calendars
│   ├── reels-30day.md
│   ├── carousels.md
│   └── stories.md
└── mission-log.md               # Execution journal

scripts/growth/
├── hero-tool-scorer.ts          # Calculate hero tool scores
├── utm-generator.ts             # Generate UTM URLs
├── weekly-scorecard.ts          # Generate weekly reports
└── gsc-fetcher.ts               # Fetch Search Console data
```

---

## Verification Checklist

Before marking any task complete:

- [ ] Code changes pass `pnpm typecheck`
- [ ] Code changes pass `pnpm lint`
- [ ] Relevant tests pass `pnpm vitest --run`
- [ ] Documentation is updated
- [ ] No secrets are exposed
- [ ] Privacy constraints are respected
- [ ] Production health is maintained

---

## Deployment Rules

1. **Never auto-deploy** — user approval required
2. **Run full QA before any deploy** — typecheck, lint, vitest, build
3. **Use blue-green deploy** — `bash deploy-blue-green.sh`
4. **Verify production after deploy** — health check, key pages, canonical
5. **Rollback if regression** — switch nginx upstream back

---

## Weekly Scorecard Template

```markdown
# Weekly Scorecard — YYYY-WXX

## Search Performance
- Clicks: X (Δ Y%)
- Impressions: X (Δ Y%)
- CTR: X% (Δ Y%)
- Avg Position: X (Δ Y%)

## Product Performance
- Tool Starts: X
- Completions: X
- Completion Rate: X%
- Exports: X

## Social Performance
- Reach: X
- Saves: X
- Shares: X
- Link Clicks: X
- New Followers: X

## Business Performance
- Signups: X
- Checkouts: X
- Revenue: X

## Decisions
1. PROMOTE: [what/why]
2. ITERATE: [what/why]
3. FIX: [what/why]
4. PAUSE: [what/why]
5. EXPAND: [what/why]

## Next Week Priorities
1. [priority]
2. [priority]
3. [priority]
```
