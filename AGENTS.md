# Agent Governance - PersianToolbox

**v7.9.0** | persiantoolbox.ir

## Quick Start

**"برنامه رشد رو شروع کن"** → read `docs/roadmap.md` → continue from the Current Handoff and Phase 11.5 items; do not restart completed homepage/deploy work.

## Current Handoff - 2026-07-06

Use this section first when a new chat, session, or agent continues growth work.

- Branch state: `main` synced with `origin/main` at commit `048e8c3a`.
- Latest production commit: `5f7418285869` (CSP enforcement + blue-green deploy).
- **Production deploy method:** `bash deploy-blue-green.sh` (zero-downtime blue-green).
- **Legacy deploy:** `bash deploy-vps-auto.sh` (still works but causes downtime).
- **Staging:** `staging.persiantoolbox.ir` on port 3001, PM2 process `persiantoolbox-staging`.
- **Production:** PM2 process `persiantoolbox` on port 3000, nginx upstream-based switching.
- **Blue-green slots:** blue (port 3000), green (port 3003). Legacy port 3001 used by alirezasafaeisystems.ir.
- Live verification passed: `/api/health` OK, all key pages HTTP 200, CSS/font/worker HTTP 200.
- CSP enforced: nonce-based script-src, style-src keeps unsafe-inline for Next.js.
- Google Consent Mode v2 active: consent banner, defaults denied, update on accept.
- GA4 active: `G-KRMGLP8TXP`, Web Vitals → GA4 reporting.
- Nginx page cache enabled: `X-Cache-Status: HIT`, 1h TTL with 24h stale-while-revalidate.
- GSC issues resolved: 18 dead link redirects, 7 PDF subcategory redirects, font cleanup.
- All other services on VPS (asdev-audit-ir, devatlas, my-portfolio) unaffected.

### Continue From These Files

- `docs/roadmap.md` — source of truth for growth and Phase 11.5 continuation.
- `docs/ops/deploy-and-risk-log.md` — latest deploy history.
- `docs/product/phased-execution-roadmap-codex.md` — product/monetization roadmap.
- `docs/ops/deploy-and-risk-log.md` — latest production deployment and risk notes.
- `docs/product/phased-execution-roadmap-codex.md` — product/monetization execution roadmap.

### Next Priorities

1. **Testimonials:** Get real user testimonials from Telegram channel / support tickets.
2. **Funnel tracking:** Add onClick handlers to homepage role-based paths (needs client component wrapper).
3. **Premium templates:** Add premium template selection for contract/business/career tools.
4. **Writing Pro:** Subscription-based writing studio with advanced features.
5. **Seasonal competitions:** "بهترین رزومه" etc. (requires new feature development).

### New Agent Checklist

Before editing growth, homepage, deploy, or monetization work:

```bash
git status --short --branch
git log -5 --oneline
sed -n '1,220p' docs/roadmap.md
sed -n '1,220p' docs/HANDOFF.md
curl -s https://persiantoolbox.ir/api/health
```

## Agent Loop Config

When an agent starts work in this repository, it must keep moving until the requested phase or task is genuinely complete.

- Read `docs/roadmap.md` first for growth/product tasks, then use the most specific linked plan or task file.
- If the user names a phase, task, report, or backlog item, continue from that exact point instead of restarting the whole roadmap.
- Execute one production-ready task at a time: inspect context, implement, update docs if needed, run the relevant verification, then summarize the result.
- Do not stop after proposing a plan when the user asked for execution; convert the plan into file changes and verification.
- If a task depends on previous repo changes, inspect `git log`, `git status`, and relevant diffs before editing.
- Preserve privacy-first/local-first behavior: never move user documents, resumes, invoices, contracts, PDFs, images, or sensitive text to the server unless the task explicitly justifies it.
- Use existing product patterns for premium gates, export credits, entitlement checks, Persian RTL UI, toast messages, and tests.
- Keep the working tree clean at the end of an execution request: commit with `Signed-off-by`, push when the user asked for push or continuation automation, and confirm `git status --short` is empty.
- Never deploy automatically. Production or staging deploy still requires explicit user approval, even inside an execution loop.
- If blocked, document the blocker, the exact file/command that exposed it, and the smallest next action needed to continue.

## Commands

```bash
pnpm typecheck && pnpm lint && pnpm vitest --run && pnpm build
bash deploy-blue-green.sh  # Zero-downtime blue-green deploy (RECOMMENDED)
bash deploy-vps-auto.sh    # Legacy deploy (causes brief downtime)
bash deploy-staging.sh     # Staging deploy
```

## Deployment Process

### Production Deploy (`deploy-blue-green.sh`) — RECOMMENDED

Zero-downtime blue-green deployment:

1. **QA Gate**: typecheck + lint + vitest must pass locally
2. **Detect slot**: blue (port 3000) or green (port 3003)
3. **Rsync**: copy source to VPS release directory (production unaffected)
4. **Build on VPS**: `pnpm install && NODE_OPTIONS=4096 next build`
5. **Start new PM2 process** on alternate port
6. **Health check** new process (up to 45s)
7. **Switch nginx upstream** (atomic, <1s downtime)
8. **Verify** public health + key pages
9. **Stop old process** and cleanup

**Rollback:** Just switch nginx upstream back (<1s). No code changes needed.

**Ports:** blue=3000, green=3003. Port 3001 = alirezasafaeisystems.ir. Port 3002 = audit.

### Legacy Deploy (`deploy-vps-auto.sh`)

1. **QA Gate**: typecheck + lint + vitest must pass
2. **Rsync**: copy source to VPS (excludes node_modules, .next, .git, .env)
3. **Build on VPS**: `pnpm install && NODE_OPTIONS=4096 next build`
4. **Copy static assets**: `.next/static → .next/standalone/.next/static`
5. **PM2 restart**: starts new process before killing old (~1s downtime)
6. **Health check loop**: waits up to 15s for new process
7. **Nginx cache purge**: ensures fresh HTML with correct CSS hashes

### Staging Deploy (`deploy-staging.sh`)

- Deploys to `staging.persiantoolbox.ir` on port 3001
- Same build process as production
- Separate PM2 process (`persiantoolbox-staging`)
- nginx proxies to port 3001

### Key Rules

- **NEVER deploy without user approval**
- **NEVER use `pm2 delete` + `pm2 start`** — use `pm2 restart`
- **Always copy static assets** — Next.js standalone doesn't include them
- **Always purge nginx cache** after deploy (use `sudo` — dirs are www-data)
- **SSH key required**: `-i /home/dev13/.ssh/id_ed25519`
- **npm → pnpm**: Use `pnpm`, never `npm` or `yarn`
- **VPS IP**: `193.93.169.32` (hardcoded in deploy-vps-auto.sh, overridable via `.env` `IP=`)

### Common Issues

| Issue                  | Root Cause                                     | Fix                                                            |
| ---------------------- | ---------------------------------------------- | -------------------------------------------------------------- |
| CSS 404 after deploy   | nginx cache purge silently fails (no `sudo`)   | `sudo find /var/cache/nginx/... -type f -delete`               |
| Old HTML served        | `rm -rf` without `sudo` for www-data dirs      | Use `sudo` for all cache operations                            |
| PM2 "stopping"         | Old process being replaced                     | Wait for health check loop (up to 15s)                         |
| Pages 502 after deploy | `.next/standalone` missing or incomplete build | Always `rm -rf .next` before rebuild, verify standalone exists |
| Blog/homepage timeout  | Cold start + heavy page (100 articles)         | First request 5-30s is normal; subsequent <1s                  |

### Post-Deploy Health Check (MANDATORY)

After every deploy, run this exact test sequence. **DO NOT skip or abbreviate:**

```bash
# 1. Health endpoint
curl -s https://persiantoolbox.ir/api/health | grep '"status":"ok'

# 2. Test 10 key pages (each must return HTTP 200)
for page in "/" "/blog" "/about" "/contact" "/pricing" "/tools" "/contract-tools" "/contract-tools/salon-contract" "/contract-tools/vehicle-sale" "/writing-tools/persian-writing-studio"; do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 30 "https://persiantoolbox.ir${page}")
  echo "${page}: HTTP ${CODE}"
  [ "$CODE" != "200" ] && echo "❌ FAILED: ${page}" && exit 1
done

# 3. Verify CSS is served (not 404)
CSS_FILE=$(curl -s https://persiantoolbox.ir/ | grep -oP 'href="/_next/static/chunks/[^"]*\.css"' | head -1 | grep -oP '/_next/[^"]+')
CSS_HTTP=$(curl -s -o /dev/null -w "%{http_code}" "https://persiantoolbox.ir${CSS_FILE}")
[ "$CSS_HTTP" != "200" ] && echo "❌ CSS 404!" && exit 1

# 4. Verify fonts
FONT_HTTP=$(curl -s -o /dev/null -w "%{http_code}" "https://persiantoolbox.ir/fonts/Vazirmatn-Bold.woff2")
[ "$FONT_HTTP" != "200" ] && echo "❌ Font 404!" && exit 1

echo "✅ All health checks passed"
```

**Rules:**

- First request to each page may take 5-30s (cold start) — this is normal
- Second request to same page must be <2s — if not, investigate
- If ANY page returns non-200, the deploy is NOT complete
- Blog page (`/blog`) loads 100 articles — expect 20-30s on first load
- NEVER deploy without running this full check sequence

### PM2 Configuration (`ecosystem.config.js`)

```
max_memory_restart: 1G  (Next.js compilation uses 600-800MB)
min_uptime: 10s
max_restarts: 20
restart_delay: 2000
kill_timeout: 5000
listen_timeout: 30000
```

### Health Monitoring

- `health-monitor.sh`: cron job every 5 minutes
- Checks PM2 status + health endpoint
- Auto-restarts if site is down
- Log: `/home/ubuntu/.pm2/logs/health-monitor.log`

### Server Configuration

- **Swap**: 2GB (prevents OOM kills)
- **Nginx**: gzip, rate limiting (30r/s API, 60r/s general), proxy buffering
- **SSL**: Let's Encrypt (auto-renew)
- **Security headers**: X-Frame-Options, X-Content-Type-Options, Referrer-Policy

## Automation Scripts

```bash
# Python automation (via uv — recommended)
cd scripts/automation
uv run python -m automation.backup       # Full backup
uv run python -m automation.health       # Verify site, SSL, key pages
uv run python -m automation.server       # PM2, PostgreSQL, Redis, disk, memory
uv run python -m automation.security     # SSH, fail2ban, UFW, SSL audit
uv run python -m automation.deploy       # Backup + deploy + verify
```

## VPS Automated Tasks (cron)

| Schedule    | Task                                     |
| ----------- | ---------------------------------------- |
| Daily 3 AM  | Full backup (DB + files + env + cleanup) |
| Every 5 min | Health monitor (auto-restart if down)    |
| On boot     | PM2 auto-start (`pm2 resurrect`)         |

## Tech Stack

Next.js 16 | TypeScript strict | Tailwind CSS | PostgreSQL | Redis | PM2 | pnpm

## Project Stats

- **۸۶ ابزار رایگان نمایه‌شده** in 10 categories
- **100 blog articles** (all dates verified — no future dates)
- **1,234 tests** (147 files) — all PASS before the 2026-07-02 production deploy
- **825 generated pages** with OG images + JSON-LD
- **5 contract tools** (اجاره، مبایعه، پیمانکاری، سالن زیبایی، خودرو)
- **3 career tools** (رزومه، گواهی سابقه، قرارداد اشتغال)
- **3 business tools** (فاکتور، پیش‌فاکتور، رسید)
- **3 flagship products**: فاکتورساز و رسیدساز, رزومه‌ساز حرفه‌ای, ویرایشگر فارسی
- **100 articles** — 10 pillar, 12 deep-dive, 3 seasonal, 3 comparison, 13 short-form
- **Telegram Bot** on Cloudflare Worker (webhook mode)
- **Widget** for Persian websites (`widget.js`)
- **WordPress plugin** for easy integration
- **Admin panel**: analytics, tools, users, audit, funnel, ops, site-settings, GSC
- **15 DB tables**: users, sessions, subscriptions, payments, history, analytics, push, scenarios, usage_tracking
- **Sentry**: error monitoring (client/server/edge) fully wired
- **Logo**: PT monogram SVG (light/dark themes) + PNG fallbacks
- **Production status**: healthy after mandatory live checks (2026-07-02)

## Rules

- Client-side only tools (privacy-first)
- Persian RTL + CSS variables for dark mode
- ALL UI text in Persian
- Tests before deploy
- **NEVER auto-deploy without user approval**
- **ONE AT A TIME, production-ready**
- **NEVER display credentials in terminal**
- Signed-off-by on every commit
- **Standardize toast messages**: "کپی شد" (not "با موفقیت کپی شد")
- **Use useToast() hook** instead of local copySuccess state

## Key Files

- `docs/roadmap.md` — growth plan
- `lib/tools-registry.ts` — tool registry
- `lib/navigation.ts` — navigation routes, categories, dropdowns
- `lib/business-documents/` — فاکتورساز و رسیدساز (types, schemas, calculations, render, draft-storage, export)
- `lib/career-documents/` — رزومه‌ساز حرفه‌ای (types, schemas, calculations, render, draft-storage, export)
- `lib/persian-writing/` — ویرایشگر فارسی (types, normalize\*, detectIssues, applyFixes, draft-storage, textStats)
- `lib/contract-tools/` — contract draft builder
- `deploy-vps-auto.sh` — production deploy
- `deploy-staging.sh` — staging deploy
- `ecosystem.config.js` — PM2 config (PORT=3000, max_memory=1G)
- `health-monitor.sh` — auto-restart cron job
- `shared/ui/ToastProvider.tsx` — toast notification system

## Flagship Products

### فاکتورساز و رسیدساز (Business Document Studio)

- `/business-tools` — landing page
- `/business-tools/document-studio` — main wizard
- Invoice, proforma, receipt generation
- Local-first, PDF/HTML export, draft persistence
- Free: watermarked preview, 3 drafts | Premium: clean export, unlimited drafts

### رزومه‌ساز حرفه‌ای (Career Document Studio)

- `/career-tools` — landing page
- `/career-tools/resume-builder` — main wizard
- Persian RTL + English LTR resume, cover letter
- Live preview, draft persistence
- Free: watermarked, 2 drafts | Premium: clean export, unlimited drafts

### ویرایشگر فارسی (Persian Writing Studio)

- `/writing-tools` — landing page
- `/writing-tools/persian-writing-studio` — main editor
- Arabic→Persian letter normalization, ZWNJ, spacing, punctuation
- URL/email/phone preservation, text statistics
- Free: 5000 char limit, safe/standard modes | Premium: longer text, strict mode
