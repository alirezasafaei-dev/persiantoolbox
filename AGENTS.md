# Agent Governance - PersianToolbox

**v6.4.0** | persiantoolbox.ir

## Quick Start

**"برنامه رشد رو شروع کن"** → read docs/roadmap.md → execute remaining items

## Commands

```bash
pnpm typecheck && pnpm lint && pnpm vitest --run && pnpm build
bash deploy-vps-auto.sh  # VPS: 193.93.169.32 (ubuntu)
```

## Tech Stack

Next.js 16 | TypeScript strict | Tailwind CSS | PostgreSQL | PM2 | pnpm

## Project Stats

- **55 tools** in 6 categories (18 financial, 18 PDF, 12 text, 6 image, 4 date, 2 validation)
- **135+ blog articles** with full SEO
- **416 tests** (100 files) — all PASS
- **221 SSG pages** with OG images + JSON-LD
- **Admin panel**: analytics, tools, users, audit, funnel, ops, site-settings, GSC

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

- `docs/roadmap.md` — growth plan
- `lib/tools-registry.ts` — 55 tools
- `shared/utils/format.ts` — shared format utilities
- `shared/constants/finance.ts` — financial constants
- `deploy-vps-auto.sh` — deployment (NODE_OPTIONS=4096)
- `ecosystem.config.js` — PM2 (PORT=3000 forced)

## What's Done (v6.4.0)

- 55 real tools, 60 blog articles, 416 tests
- PDF→Word, background remover, salary hub (7 tabs)
- Admin: analytics, tools, users, audit, funnel, ops, site-settings, GSC
- Blog: search, pagination, TOC, share, bookmarks, reactions, series
- SEO: FAQ, HowTo, BreadcrumbList, SoftwareApplication, Article JSON-LD
- Chrome Extension + Telegram Bot
- Smart CTA, exit intent, scroll-to-top, quick tools FAB
- Deep cleanup: 24 files deleted, 20 utilities consolidated

## What's Remaining (blocked by external services)

- درگاه پرداخت — waiting for Zarinpal
- Redis + CDN — P2 long-term
- Push notifications — needs FCM/VAPID
