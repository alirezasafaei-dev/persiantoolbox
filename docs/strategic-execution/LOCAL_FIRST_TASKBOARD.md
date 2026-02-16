# Local-First Execution Taskboard

آخرین به‌روزرسانی: 2026-02-16

## سیاست اجرا

- پیش‌فرض همه کارها: `local-only`
- فقط در این نقاط `commit/push` انجام شود:
1. بعد از عبور کامل یک گیت فازی (`Phase Gate Passed`)
2. بعد از ایجاد artifact رسمی قابل ممیزی
3. قبل از هر اقدام remote/deploy

## ستون‌های برد

`Backlog -> Ready -> In Progress -> Validation -> Done`

## فاز 1: Staging Operational Readiness

1. `P1-D1` بازبینی hardening اسکریپت VPS
- Mode: `local-only`
- DoD: چک‌لیست hardening تکمیل شود
- Evidence: `docs/deployment/reports/hardening-checklist-*.md`

2. `P1-D2` اعتبارسنجی Nginx/TLS/Health
- Mode: `local + staging verify`
- DoD: nginx config معتبر + health پایدار
- Evidence: `docs/deployment/reports/nginx-tls-health-*.md`

3. `P1-D3` drill کامل deploy/rollback روی staging
- Mode: `local + staging action`
- DoD: deploy -> verify -> rollback -> verify پاس
- Evidence: `docs/deployment/reports/staging-rollback-drill-*.md`

4. `P1-D4` انطباق env contract
- Mode: `local-only` (با redacted values)
- DoD: required env missing نداشته باشیم
- Evidence: `docs/deployment/reports/env-contract-audit-*.md`

## فاز 2: Quality and Performance

5. `P1-Q2` بهینه‌سازی performance مسیرهای بحرانی
- Mode: `local-only`
- Scope: `/salary`, `/topics`, `/pdf-tools/merge/merge-pdf`
- DoD: افت نسبت به baseline نداشته باشیم
- Evidence: `docs/deployment/reports/perf-delta-*.md`

6. `P1-Q3` re-run gate pack پس از بهینه‌سازی
- Mode: `local-only`
- Command: `pnpm ci:quick && pnpm ci:contracts && pnpm lighthouse:ci`
- DoD: همه gateها پاس یا مورد non-blocking مستند
- Evidence: `docs/deployment/reports/gate-pack-*.md`

## فاز 3: Production Cutover

7. `P2-P1` deploy production
- Mode: `remote action (after local gate pass)`
- DoD: سرویس healthy + smoke core پاس
- Evidence: `docs/deployment/reports/prod-deploy-*.md`

8. `P2-P2` post-deploy confirmation pack
- Mode: `remote verify`
- Command: `pnpm deploy:post:report -- --base-url=https://persiantoolbox.ir`
- DoD: گزارش post-deploy بدون blocker
- Evidence: `docs/deployment/reports/post-deploy-*.json`

## فاز 4: Stabilization

9. `P2-P3` سیاست retention برای cache/log/snapshot
- Mode: `local-only`
- DoD: runbook + آستانه نگه‌داری مشخص
- Evidence: `docs/deployment/reports/retention-policy-*.md`

10. `P2-P4` بستن کانبان و ثبت handover نهایی
- Mode: `local-only`
- DoD: تمام کارت‌ها `Done` یا `Deferred` با دلیل
- Evidence: `docs/strategic-execution/runtime/Weekly_Reviews/*.md`

## نقاط commit/push پیشنهادی

1. بعد از تکمیل فاز 1 (D1 تا D4)
2. بعد از تکمیل فاز 2 و پاس gate pack
3. درست قبل از production cutover
4. بعد از post-deploy و stabilization نهایی

## وضعیت اجرای خودکار (2026-02-16)

- Done: `P1-D1`, `P1-D2`, `P1-D4`, `P1-Q3`, `P1-Q4`, `P2-P2`, `P2-P3`
- Ready: `P2-P1`
- Blocked: `P1-D3`, `P1-Q2`
- Blocker اصلی فعلی: نیاز به اجرای rollback واقعی روی staging و بهبود performance
- مرجع وضعیت: `docs/strategic-execution/runtime/Task_Log.csv`
