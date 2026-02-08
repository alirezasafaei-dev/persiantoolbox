# Snapshot — 2026-02-08 — Priority 4 Closure + CI Readiness Artifacts

## Summary

- `act(...)` noise در تست race پنل تنظیمات سایت با `act` هدفمند و بدون تضعیف assertionها صفر شد.
- pipeline اصلی CI به stage جدید `readiness-artifacts` مجهز شد تا گزارش readiness و summary را تولید و به artifact خروجی CI آپلود کند.
- اسکریپت رسمی تولید summary readiness اضافه شد و مستندات roadmap/deployment با وضعیت جدید همگام شدند.

## Completed Work

### 1) Race test stabilization

- Updated:
  - `tests/unit/site-settings-admin-page-race.test.tsx`
- Result:
  - تست race بدون warning `act(...)` پاس می‌شود.

### 2) CI readiness summary artifact stage

- Added:
  - `scripts/deploy/generate-readiness-summary.mjs`
- Updated:
  - `package.json` (`deploy:readiness:summary`)
  - `.github/workflows/ci-core.yml` (new job: `readiness-artifacts`)
  - `docs/deployment/reports/README.md`
  - `docs/deployment-roadmap.md`
  - `docs/roadmap.md`

## Validation Executed

- `pnpm exec vitest --run tests/unit/site-settings-admin-page-race.test.tsx`
- `pnpm deploy:readiness:summary`
- `pnpm ci:quick`
- `pnpm ci:contracts`

## Next Technical Prompt

```text
ادامه از snapshot: docs/snapshots/2026-02-08-priority4-ci-readiness-artifacts-handoff.md

گام بعدی:
1) در CI job readiness-artifacts، اجرای readiness run را با envهای backend fixture برای parity بیشتر با اجرای واقعی بررسی و در صورت نیاز استاندارد کن.
2) گزارش نهایی deployment readiness را از آخرین readiness/summary به docs/deployment-roadmap.html و docs/roadmap-board.html منعکس کن.
3) یک dry-run از release gates (`pnpm release:rc:run` و `pnpm release:launch:run`) اجرا کن و خروجی را در snapshot بعدی ثبت کن.
4) docs/index.md و CHANGELOG.md را sync کن، commit/push کن.
```
