# Roadmap Docs Cleanup Report

**Date:** 2026-06-27

## What Changed

1. **Created `docs/product/roadmap-v2.md`** — Single source of truth for autonomous loop prompts
   - Split into DONE, NOW, NEXT, LATER, BLOCKED
   - Marked 10 completed P0 fixes as DONE
   - Removed duplicate pay-per-export entries
   - Aligned payment wording with existing ZarinPal infrastructure
   - Moved 50+ article plan to LATER
   - Prioritized 6-9 high-quality SEO pages in NEXT
   - Softened risky claims (no "official/legal/ATS guarantee")
   - Added measurable acceptance criteria for each item
   - Added "What NOT to Build" section
   - Added "How to Use This Roadmap" instructions

2. **Created `docs/product/roadmap-status.md`** — Quick status overview
   - Summary table with counts
   - Recent activity log

3. **Created this report** — Documentation of cleanup actions

## Cleanup Details

### P0 Fixes Marked Done

- D1: Fix localhost SEO bug (commit d6d2657)
- D2: Fix broken routes 502/504 (verified live)
- D3: Add production-mode URL assertion (commit d6d2657)
- D4: Fix deploy script env injection (commit d6d2657)
- D5: Add flagship routes to sitemap (verified in sitemap)
- D6: Optimize /blog performance (commit 6735a3a)
- D7: Pay-per-export MVP (commit bd48482)
- D8: Live growth audit (docs exist)
- D9: Search Console sitemap submitted (manual)
- D10: Security headers verified (live check)

### Pay-per-export Duplication Removed

- Old roadmap had duplicate entries for pay-per-export in multiple sections
- Consolidated into single entry in NOW (deploy) and LATER (one-time purchase)

### Risky Claims Softened

- Removed "official" and "legal" claims from invoice builder descriptions
- Removed "ATS guarantee" from resume builder
- Added "for general use" disclaimers
- Kept privacy-first/local-first rules explicit

### Sprint 1 Defined

- NOW items: Deploy pay-per-export, monitor Search Console, fix docs links, add FAQ schema
- Clear acceptance criteria for each item
- Measurable test commands

## Docs Links Check

- `pnpm quality:docs-links:check`: FAIL (4 broken links in docs/archive/)
- Pre-existing issue: archived roadmap files reference non-existent ./roadmap.md
- Not a blocker for roadmap v2

## Security Secrets Check

- `pnpm security:secrets`: PASS
- No high-risk secret patterns detected

## What Was NOT Changed

- No code changes
- No deploy
- No payment changes
- No feature implementation
- No destructive commands
- No secrets printed
- No backup files committed
