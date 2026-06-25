# Agent Governance - PersianToolbox

**v6.7.0** | persiantoolbox.ir

## Quick Start

**"برنامه رشد رو شروع کن"** → read docs/roadmap.md → execute remaining items

## Commands

```bash
pnpm typecheck && pnpm lint && pnpm vitest --run && pnpm build
bash deploy-vps-auto.sh  # VPS deploy (automated)
# OR for manual deploy:
bash quick-deploy.sh     # includes CSS verification
```

## ⚠️ CRITICAL: Deployment Rule

**NEVER deploy without copying static assets to standalone!**

Next.js standalone mode does NOT include `_next/static/` in the output.
After `next build`, you MUST run:

```bash
cp -r .next/static .next/standalone/.next/static
cp -r public/* .next/standalone/public/
```

Both `deploy-vps-auto.sh` and `quick-deploy.sh` handle this automatically.
**ALWAYS use one of these scripts — never deploy manually with plain rsync+ssh.**

## ⚠️ Deploy SSH Key Required

rsync needs explicit SSH identity file. Plain `ssh` works but `rsync` doesn't pick up SSH config:

```bash
rsync -e "ssh -i /home/dev13/.ssh/id_ed25519 -o StrictHostKeyChecking=no" ...
```

## ⚠️ Nginx Cache After Deploy

After deploy, purge nginx cache to avoid stale CSS hashes:

```bash
ssh -i /home/dev13/.ssh/id_ed25519 ubuntu@VPS_IP "rm -rf /var/cache/nginx/persiantoolbox/* && sudo systemctl reload nginx"
```

`deploy-vps-auto.sh` handles this automatically.
cp -r .next/static .next/standalone/.next/static
cp -r public/\* .next/standalone/public/

````

Both `deploy-vps-auto.sh` and `quick-deploy.sh` handle this automatically.
**ALWAYS use one of these scripts — never deploy manually with plain rsync+ssh.**

## GPU Acceleration Rule

**SYSTEM GPU**: AMD Radeon RX 580 — always use for heavy processing.

```bash
# Always use GPU acceleration for:
# - Playwright/E2E tests (Chromium with --enable-gpu, --use-gl=swiftshader)
# - Build (NODE_OPTIONS with max workers)
# - Typecheck (parallel via tsc --build)
# - Image processing tools (Canvas/WebGL offload)
# - Lint (parallel workers)

# Environment for GPU-accelerated builds:
export NODE_OPTIONS="--max-old-space-size=4096"

# Playwright with GPU:
PLAYWRIGHT_CHROMIUM_ARGS="--enable-gpu --use-gl=swiftshader --enable-webgl"

# Parallel test execution:
pnpm vitest --run --reporter=verbose  # vitest runs tests in parallel by default

# Build with parallel workers:
pnpm build  # Next.js uses all available cores

# When running heavy commands, ALWAYS:
# 1. Use --run (not watch mode) for CI-like speed
# 2. Use parallel where possible (subagents for independent tasks)
# 3. Set NODE_OPTIONS=4096 for memory-intensive operations
````

## Tech Stack

Next.js 16 | TypeScript strict | Tailwind CSS | PostgreSQL | Redis | PM2 | pnpm

## Project Stats

- **76 tools** in 6 categories (25 financial, 18 PDF, 12 text, 6 image, 7 date, 8 validation)
- **13 blog articles** (quality over quantity — all 200+ words)
- **434 tests** (103 files) — all PASS
- **221 SSG pages** with OG images + JSON-LD
- **Admin panel**: analytics, tools, users, audit, funnel, ops, site-settings, GSC
- **Premium tools**: Financial Dashboard, Report Generator, Invoice Generator
- **15 DB tables**: users, sessions, subscriptions, payments, history, analytics, push, scenarios, usage_tracking
- **Sentry**: error monitoring (client/server/edge) fully wired

## Rules

- Client-side only tools (privacy-first)
- Persian RTL + CSS variables for dark mode
- ALL UI text in Persian
- Tests before deploy
- **NEVER auto-deploy without user approval**
- **ONE AT A TIME, production-ready**
- **NEVER display credentials in terminal**
- Signed-off-by on every commit

## Key Files

- `docs/roadmap.md` — growth plan (143 items)
- `lib/tools-registry.ts` — 62 tools
- `lib/server/entitlements.ts` — premium entitlements system
- `lib/server/redis.ts` — Redis client (optional)
- `shared/utils/format.ts` — shared format utilities
- `shared/constants/finance.ts` — financial constants
- `deploy-vps-auto.sh` — deployment (NODE_OPTIONS=4096)
- `ecosystem.config.js` — PM2 (PORT=3000 forced)

## What's Done (v6.5.0)

### Core Platform

- 62 real tools, 145+ blog articles, 435 tests
- PDF→Word, background remover, salary hub (7 tabs)
- Admin: analytics, tools, users, audit, funnel, ops, site-settings, GSC
- Blog: search, pagination, TOC, share, bookmarks, reactions, series, tags, RSS
- SEO: FAQ, HowTo, BreadcrumbList, SoftwareApplication, Article JSON-LD
- Chrome Extension + Telegram Bot
- Smart CTA, exit intent, scroll-to-top, quick tools FAB

### Infrastructure

- Redis caching (rate limiting + session cache)
- Nginx cache (static + pages + API)
- Push Notifications (VAPID + API + Service Worker)
- Health/ready/version endpoints
- Production readiness check script

### Account & Monetization

- Account page: modern tabbed UI, password strength, validation
- Premium badge, plan info, upgrade button
- Financial Dashboard Pro (save/compare scenarios)
- Report Generator (PDF reports for cheque/mahr/debt)
- Invoice Generator (professional invoice PDF)
- Entitlements system (free vs premium limits)
- Subscription plans unified (basic/pro, monthly/yearly)

### Financial Tools (5 new)

- Check penalty calculator (CPI, Article 522)
- VAT calculator (7%/9%/10%/12%)
- Mahr calculator (CPI, Article 1082)
- Profit margin calculator (break-even)
- Hiring cost calculator (23% insurance)

### Security & Quality

- passwordHash stripped from /api/auth/me response
- CSRF protection (proxy-aware)
- Rate limiting (Redis + PostgreSQL)
- 435 tests, typecheck clean
- Local-first verified (no CDN dependencies)

### Content

- 5 blog articles for new financial tools
- 5 blog articles for premium features
- FinancialTransparencyBox component
- Finance-tools keywords expanded

## What's Remaining

- درگاه پرداخت — waiting for Zarinpal merchant ID approval
- Google AdSense — waiting for approval
