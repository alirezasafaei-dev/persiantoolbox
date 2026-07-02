# PersianToolbox Deployment Log

## 2026-07-02 - Commit 6608314e

**Site:** `https://persiantoolbox.ir`  
**Commit:** `6608314e fix: complete final seo ux accessibility qa pass`  
**Deploy command:** `bash deploy-vps-auto.sh`  
**Result:** PASS  
**Production commit hash from app:** UNVERIFIED (`/api/version` returned `commit:null`)

### Deploy Evidence

- QA gate passed in deploy script.
- VPS build completed.
- PM2 restarted `persiantoolbox` successfully.
- New process became ready on attempt 8.
- Warmup completed.
- `/api/health` returned `status:"ok"` with database OK and Redis OK.
- CSS, font files, and PDF worker returned HTTP 200.
- Mandatory key pages returned HTTP 200.

### Post-Deploy Curl Evidence

- `curl -I https://persiantoolbox.ir/` -> `HTTP/1.1 200 OK`
- `curl -I https://www.persiantoolbox.ir/` -> `HTTP/1.1 301 Moved Permanently`, `Location: https://persiantoolbox.ir/`
- `curl -I https://persiantoolbox.ir/loan` -> `HTTP/1.1 200 OK`
- `curl -I https://www.persiantoolbox.ir/loan` -> `HTTP/1.1 301 Moved Permanently`, `Location: https://persiantoolbox.ir/loan`
- `curl -I "https://www.persiantoolbox.ir/loan?x=1"` -> `HTTP/1.1 301 Moved Permanently`, `Location: https://persiantoolbox.ir/loan?x=1`
- `curl -I https://persiantoolbox.ir/sitemap.xml` -> `HTTP/1.1 200 OK`
- `curl -I https://persiantoolbox.ir/robots.txt` -> `HTTP/1.1 200 OK`

### Content Smoke

- Homepage canonical: `rel="canonical" href="https://persiantoolbox.ir"`
- `/loan` canonical: `rel="canonical" href="https://persiantoolbox.ir/loan"`
- Homepage `[object Object]` count: `0`
- `/loan` `[object Object]` count: `0`

### Remaining Risks

- CSP still uses `unsafe-inline`.
- Previous local Lighthouse `/loan` Performance score: `78`.
- Lint still reports 302 warnings, 0 errors.
- Build warnings remain: stale Browserslist data, custom Cache-Control notice, Turbopack NFT trace warning.
