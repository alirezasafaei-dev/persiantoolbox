# Agent Governance - PersianToolbox

**v6.5.0** | persiantoolbox.ir

## Quick Start

**"برنامه رشد رو شروع کن"** → read docs/roadmap.md → execute remaining items

## Commands

```bash
pnpm typecheck && pnpm lint && pnpm vitest --run && pnpm build
bash deploy-vps-auto.sh  # VPS: 193.93.169.32 (ubuntu)
```

## Tech Stack

Next.js 16 | TypeScript strict | Tailwind CSS | PostgreSQL | Redis | PM2 | pnpm

## Project Stats

- **62 tools** in 6 categories (25 financial, 18 PDF, 12 text, 6 image, 4 date, 2 validation)
- **145+ blog articles** with full SEO
- **435 tests** (103 files) — all PASS
- **221 SSG pages** with OG images + JSON-LD
- **Admin panel**: analytics, tools, users, audit, funnel, ops, site-settings, GSC
- **Premium tools**: Financial Dashboard, Report Generator, Invoice Generator
- **15 DB tables**: users, sessions, subscriptions, payments, history, analytics, push, scenarios, usage_tracking

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

- درگاه پرداخت — waiting for Zarinpal
- Sentry monitoring — P1 priority
- Legal Document Generator — next premium tool
- SEO Content Toolkit — Phase D
