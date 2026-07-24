# Admin Panel Audit — 2026-07-24

## Repository State

- Branch: `audit/admin-dashboard-real-integration-20260724`
- Base SHA: `dd22b5936618`
- Production: `persiantoolbox.ir` (commit `dd22b5936618`)
- Baseline: 198/198 test files ✅, 1471/1471 tests ✅, lint ✅, typecheck ✅

## Critical Findings

### CRIT-1: `/dashboard` has NO server-side auth guard

- **File**: `app/dashboard/page.tsx`
- **Issue**: Only checks `isFeatureEnabled('dashboard')` — no role check. Any visitor can access the ops dashboard showing server internals (DB stats, processes, env vars).
- **Risk**: Server internals exposed to anonymous users when feature flag is enabled.
- **Fix**: Add server-side admin auth guard before render.

### CRIT-2: Admin layout uses CLIENT-SIDE auth only

- **File**: `app/admin/layout.tsx`
- **Issue**: Layout is `'use client'`, checks `/api/auth/me` via fetch. Server-rendered HTML is sent to unauthorized users before client-side redirect.
- **Risk**: Admin HTML/data leaked to unauthorized users on initial render.
- **Fix**: Add middleware or server-side guard at layout level.

### CRIT-3: Analytics returns zeros on failure (fake zero)

- **File**: `app/api/admin/analytics/route.ts`
- **Issue**: Both catch blocks return `{totalEvents: 0, topPaths: [], ...}` — indistinguishable from "no data".
- **Risk**: Admin sees "0 views" instead of "analytics unavailable".
- **Fix**: Return error state with `ok: false` and specific error message.

### CRIT-4: Quick actions reference non-existent endpoints

- **File**: `app/admin/page.tsx`
- **Issue**: `POST /api/admin/ops/clear-cache` and `POST /api/admin/ops/test-email` don't exist. Actual endpoint is `POST /api/admin/ops/actions` with `{action: 'clear-cache'}`.
- **Risk**: Quick actions always fail silently.
- **Fix**: Update action URLs to match actual API.

### CRIT-5: Monetization page uses localStorage demo data

- **File**: `app/admin/monetization/page.tsx` + related components
- **Issue**: Subscriptions and payments loaded from localStorage as demo data mixed with real API data.
- **Risk**: Admin sees fake revenue data alongside real data.
- **Fix**: Remove localStorage demo data, show "no data" state when real data unavailable.

### CRIT-6: PM2 action command injection risk

- **File**: `app/api/admin/ops/actions/route.ts:136-147`
- **Issue**: `performPM2Action` uses `execSync(`pm2 ${action} ${safeTarget}`)` — regex cleanup is basic, no allowlist for process names.
- **Risk**: Potential command injection if regex is bypassed.
- **Fix**: Use `execFileSync` with array args instead of shell string.

### CRIT-7: Missing CSRF on user role update

- **File**: `app/api/admin/users/[id]/route.ts`
- **Issue**: PATCH endpoint (role/ban changes) has no CSRF check.
- **Risk**: Cross-site request forgery could change user roles.
- **Fix**: Add `isSameOrigin` check.

### CRIT-8: Missing CSRF on funnel refresh

- **File**: `app/api/admin/funnel/route.ts`
- **Issue**: POST endpoint has no CSRF check.
- **Fix**: Add `isSameOrigin` check.

### CRIT-9: Missing rate limiting on 11/17 admin routes

- **Routes without rate limiting**: users, users/[id], tools, newsletter, google-search-console, analytics, funnel, ops/health-history, ops/logs, ops/actions, ops/system-info
- **Fix**: Add rate limiting to all admin write endpoints at minimum.

### CRIT-10: `getSafeEnvVars` leaks configuration details

- **File**: `app/api/admin/ops/actions/route.ts:115-134`
- **Issue**: Exposes non-sensitive env var values including paths, ports, feature flags, URLs.
- **Fix**: Only show key presence/status (configured/not-configured), not values.

## Non-Critical Findings

### NC-1: `dailyViews` always empty in analytics

- API returns `dailyViews: []` — no daily trend data available.

### NC-2: Missing audit logging on newsletter and GSC routes

- These admin routes don't write to `admin_audit_log` table.

### NC-3: `/admin/dashboard` duplicates `/admin/ops`

- Both use `OpsDashboardClient` — redundant navigation entry.

### NC-4: Editor role can access GSC page

- Sidebar shows GSC to editor role — should be admin-only for credential access.

## Classification Summary

| Category     | Count | Fixed | Remaining |
| ------------ | ----- | ----- | --------- |
| CRITICAL     | 10    | 10    | 0         |
| NON-CRITICAL | 4     | 1     | 3         |
| Total        | 14    | 11    | 3         |

## Fix History

| Commit     | Fixes Applied                                                                                                                                                        |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `18406d19` | CRIT-1 (dashboard auth), CRIT-3 (analytics fake zero), CRIT-4 (quick actions), CRIT-6 (PM2 injection), CRIT-7 (users CSRF), CRIT-8 (funnel CSRF), CRIT-10 (env leak) |
| `46d646d4` | Analytics UI error state handling                                                                                                                                    |
| `553aceb5` | CRIT-2 (middleware auth guard), CRIT-9 (rate limiting on mutations), admin noindex                                                                                   |

## Remaining External Blockers

1. **GSC credential** — Google Search Console integration requires OAuth credential setup
2. **SMTP provider** — Test email requires SMTP configuration
3. **Daily views** — Analytics aggregation doesn't compute daily breakdowns (NC-1)
