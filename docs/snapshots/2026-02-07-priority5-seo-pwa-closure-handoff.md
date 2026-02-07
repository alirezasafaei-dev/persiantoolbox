# Snapshot — 2026-02-07 — Priority 5 SEO/PWA Closure

## Summary

- Priority 5 completed end-to-end (JSON-LD + Lighthouse guardrails + SW/CACHE_VERSION lifecycle).
- CI/validation paths executed successfully, including `lighthouse:ci`, `ci:quick`, and targeted E2E/unit contracts.
- Codex heavy-run environment references documented for future long-running tasks.

## Implemented

### 1) JSON-LD stabilization

- Hardened JSON-LD generation to avoid empty FAQ entities:
  - `lib/seo-tools.ts`
- Added regression contracts for JSON-LD across core route classes:
  - `tests/unit/seo-jsonld-contract.test.ts`
  - coverage: `tool`, `category`, `topics hub`, `topics pillar`

### 2) Lighthouse regression guardrails

- Expanded monitored routes in `lighthouserc.json`:
  - `/`, `/tools`, `/topics`, `/pdf-tools/merge/merge-pdf`, `/image-tools`, `/date-tools`, `/loan`, `/salary`, `/offline`
- Guardrails configured as:
  - `seo >= 0.92` (error)
  - `accessibility >= 0.94` (error)
  - `best-practices >= 0.95` (error)
  - `performance >= 0.80` (warn)

### 3) Service Worker / CACHE_VERSION standardization

- Bumped SW cache version:
  - `public/sw.js` -> `v7-2026-02-07`
- Added SW version contract script:
  - `scripts/pwa/validate-sw-version.mjs`
  - npm script: `pnpm pwa:sw:validate`
- Added unit contract test for SW version and cache derivation:
  - `tests/unit/sw-cache-version.test.ts`
- Strengthened E2E update contract:
  - `tests/e2e/offline.spec.ts` now asserts update message `version` format.

### 4) Documentation updates

- Synced docs:
  - `docs/roadmap.md` (Priority 4/5 status set to completed)
  - `docs/operations.md`
  - `docs/deployment-roadmap.md`
  - `docs/developer-guide.md`
  - `docs/codex-audit-playbook.md`
  - `docs/index.md`
  - `CHANGELOG.md`

### 5) Codex heavy-run references

- Added official links for long-running jobs:
  - `https://chatgpt.com/codex`
  - `https://chatgpt.com/codex/settings/environment/698658924bb081919cd3731a5cd5498f`

## Validation Executed

- `pnpm pwa:sw:validate`
- `pnpm vitest --run --maxWorkers=12 tests/unit/seo-jsonld-contract.test.ts tests/unit/sw-cache-version.test.ts tests/seo-tools.test.ts`
- `pnpm exec playwright test tests/e2e/offline.spec.ts --project=chromium --workers=12 --reporter=list`
- `pnpm lighthouse:ci`
- `pnpm ci:quick`

## Next Technical Prompt (Priority 6)

```text
ادامه از snapshot: docs/snapshots/2026-02-07-priority5-seo-pwa-closure-handoff.md

Priority 6 را اجرا کن:
1) عملیات محصول و درآمدزایی را با حفظ privacy-by-default تکمیل کن:
   - جریان review-to-backlog را عملیاتی و قابل رهگیری کن (artifact + testable checks)
   - guardrailهای consent برای ads/analytics را در UI + API یکپارچه و تستی کن
   - مستندات monetization را با رفتار واقعی runtime هم‌راستا و بدون آیتم منسوخ نگه دار
2) docs/roadmap.md و CHANGELOG.md را بعد از هر گام sync کن
3) تست‌های مرتبط unit/e2e را اجرا کن (با تمرکز روی consent/admin/analytics)
4) در پایان pnpm ci:quick اجرا کن
5) commit/push کن و snapshot جدید بساز
```
