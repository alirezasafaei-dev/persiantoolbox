# Agent Governance - PersianToolbox

**v6.8.0** | persiantoolbox.ir

## Quick Start

**"برنامه رشد رو شروع کن"** → read docs/roadmap.md → execute remaining items

## Commands

```bash
pnpm typecheck && pnpm lint && pnpm vitest --run && pnpm build
bash deploy-vps-auto.sh  # VPS deploy (automated)
bash deploy-staging.sh   # Staging deploy
bash quick-deploy.sh     # Quick deploy with CSS verification
```

## Deployment Process

### Production Deploy (`deploy-vps-auto.sh`)

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

| Issue                | Root Cause                                   | Fix                                              |
| -------------------- | -------------------------------------------- | ------------------------------------------------ |
| CSS 404 after deploy | nginx cache purge silently fails (no `sudo`) | `sudo find /var/cache/nginx/... -type f -delete` |
| Old HTML served      | `rm -rf` without `sudo` for www-data dirs    | Use `sudo` for all cache operations              |
| PM2 "stopping"       | Old process being replaced                   | Wait for health check loop (up to 15s)           |

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

- **80+ tools** in 8+ categories
- **54 blog articles** (quality over quantity)
- **857 tests** (120 files) — all PASS
- **235+ SSG pages** with OG images + JSON-LD
- **3 flagship products**: فاکتورساز و رسیدساز, رزومه‌ساز حرفه‌ای, ویرایشگر فارسی
- **Admin panel**: analytics, tools, users, audit, funnel, ops, site-settings, GSC
- **Contract Tools**: rental lease + construction contractor
- **15 DB tables**: users, sessions, subscriptions, payments, history, analytics, push, scenarios, usage_tracking
- **Sentry**: error monitoring (client/server/edge) fully wired
- **Logo**: PT monogram SVG (light/dark themes) + PNG fallbacks

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
