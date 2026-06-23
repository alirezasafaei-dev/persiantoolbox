# PersianToolbox — Session Summary & Next Steps

**Session Date**: 2026-06-23
**Status**: v6.3.0 LIVE on production
**Commits**: 22 commits, all pushed

---

## What Was Done (Complete)

### Critical Fixes

- Tax calculator: fixed double-exemption bug (400M → 40M monthly)
- Currency converter: Toman display + rounding (was showing Rial)
- Insurance calculator: base calculation fix (uses actual salary, not min wage)
- Hover underline: removed from buttons/cards (was ugly)
- 4 useless tools de-indexed (bank-rate, living-cost, rent-vs-buy, loan-vs-investment)

### Homepage Rebuild

- Category cards with icons and tool counts
- Newest tools section
- Social proof counter (12,500+ users)
- Removed developer section (repo is private now)

### UX Improvements

- Back buttons on all tool/category pages
- Redesigned financial tools dashboard (filters, cards, benefits)
- Topics page redesigned with tool cards
- Terms page expanded (5 sections)
- Support page converted from donation to real help center
- Footer cleaned (removed small icons, 3-column layout)
- Payslip (فیش حقوقی) export added
- Feedback survey component (3 questions)

### SEO & Content

- AggregateRating schema on all tool pages
- BlogToolCTA for internal linking
- Blog posts → tool links

### Security & Infrastructure

- CSRF proxy support for nginx reverse proxy
- PostgreSQL installed on VPS (Docker locally)
- PM2 ecosystem.config.js for proper env loading
- Deploy script updated

### Financial Logic

- Centralized constants (shared/constants/finance.ts)
- Tax calculator uses centralized constants
- Insurance calculator fixed base calculation

---

## Production Status

- **Health**: `{"status":"ok","version":"6.3.0"}`
- **Login/Register**: WORKING (PostgreSQL on VPS)
- **Tests**: 421/421 pass
- **TypeScript**: clean

---

## Remaining Work (Next Session)

### High Priority

1. **Admin panel centralization** - API keys, social links, contact info, Google Search Console config
2. **PDF→Word tool** (in roadmap as in-progress)
3. **Background removal tool** (in roadmap as in-progress)
4. **Performance optimizations** (P1 in roadmap)

### Medium Priority

5. **Design consistency** - ensure all pages use same patterns
6. **More internal linking** - tool pages → blog, blog → tools
7. **Smart CTAs** - show relevant tools based on usage

### Low Priority (Future)

8. Payment gateway (waiting for Zarinpal approval)
9. Redis + CDN (P2)
10. Chrome Extension (P2)

---

## Key Technical Notes

### Database

- PostgreSQL 16 on VPS (localhost:5432)
- User: persiantoolbox, DB: persian_tools
- 12 tables: users, sessions, subscriptions, payments, checkouts, history, rate_limits, site_settings, analytics
- Migration: `node scripts/db/migrate.mjs`

### PM2

- Uses `ecosystem.config.js` to load `.env` (no dotenv dependency)
- PORT=3000 hardcoded in ecosystem config
- `pm2 start ecosystem.config.js` to start/restart

### Deploy

- `bash deploy-vps-auto.sh` — rsync → build → PM2 restart
- .env with credentials is NOT in git
- ecosystem.config.js reads .env manually

### Security

- `.env` in .gitignore — never committed
- CSRF checks proxy headers (X-Forwarded-Proto + Host)
- All financial processing client-side
- No secrets in code

---

## User Preferences (Must Follow)

1. Do ONE task at a time, completely and production-ready
2. Never show credentials in output
3. Run local dev server first, let user verify, then deploy
4. Never auto-deploy without explicit user approval
5. Never auto-version-bump
6. Never auto-add tools without user confirmation
7. All UI text must be Persian
8. RTL and Dark Mode in all changes
