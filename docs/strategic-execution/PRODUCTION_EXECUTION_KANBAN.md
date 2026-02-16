# کانبان اجرایی و نقشه‌راه استقرار پروداکشن

آخرین به‌روزرسانی: 2026-02-16  
دامنه فعلی پروداکشن: `https://persiantoolbox.ir`  
نسخه فعلی پروژه: `2.0.2`

## 1) خلاصه وضعیت واقعی (Evidence-Based)

- چرخه‌های آمادگی انتشار و دیپلوی در اسناد محلی پاس شده‌اند:
  - `docs/release/reports/rc-gates-2026-02-14T20-12-16-516Z.json`
  - `docs/release/reports/launch-smoke-2026-02-14T20-13-54-166Z.json`
  - `docs/deployment/reports/readiness-2026-02-15T14-26-38-143Z.json`
- وضعیت انتشار نهایی شده است:
  - `docs/release/v3-readiness-dashboard.md` → `final_release_tag_remote: done`
  - `docs/release/release-state-registry.md` → `status: done`
- گیت لایسنسینگ در اجرای فعلی fail است:
  - وضعیت جدید: pass در 2026-02-16 پس از اصلاح boundary
  - فرمان: `pnpm licensing:validate`
  - مرجع: `scripts/licensing/validate-license-consistency.mjs`
- شواهد Stageهای A/B/S/L کامل هستند:
  - `docs/strategic-execution/STAGE_STATUS.md`
  - `docs/strategic-execution/runtime/Project_Log.csv`
- آثار cache/log/snapshot وجود دارد و قابل مدیریت است:
  - `.next` حدود `34M`
  - `.lighthouseci` حدود `32M`
  - `.mcp-logs` حدود `108K`
  - `.codex/snapshots/20260216-162748/*`
- آرتیفکت‌های تصویر و OG آماده‌اند:
  - `public/og-default.png`
  - `public/og-default.svg`
  - `scripts/generate-og-images.mjs`

## 2) تعریف کانبان اجرایی

ستون‌ها:

1. `Intake`
2. `Ready`
3. `In Progress`
4. `Blocked`
5. `Validation`
6. `Ready for Deploy`
7. `Done`

قوانین حرکت کارت:

- هر کارت باید `DoD` مشخص داشته باشد.
- هر کارت باید `Evidence Path` داشته باشد.
- کارت بدون خروجی قابل ممیزی از `Validation` عبور نمی‌کند.
- کارت‌های `P0` همیشه قبل از `P1/P2` انجام می‌شوند.

## 3) Backlog اولویت‌دار (بدون زمان‌بندی)

### P0 - Release Blocking

1. `P0-R1` رفع blocker لایسنسینگ
- وضعیت فعلی: `Done`
- اقدام:
  - اصلاح boundary در `docs/licensing/v2-release-notes-template.md` طبق انتظار اسکریپت
  - اجرای مجدد `pnpm licensing:validate`
- DoD:
  - خروجی `pnpm licensing:validate` پاس
  - چک‌لیست `docs/licensing/v2-license-release-checklist.md` همسو با نتیجه
- Evidence:
  - لاگ CI یا خروجی فرمان
  - به‌روزرسانی فایل‌های لایسنسینگ

2. `P0-R2` نهایی‌سازی release tag روی remote
- وضعیت فعلی: `Done`
- اقدام:
  - ایجاد/publish تگ نهایی در remote
  - تغییر `final_release_tag_remote` به `done`
  - همگام‌سازی `release-state-registry`
- DoD:
  - `docs/release/v3-readiness-dashboard.md` مقدار `done`
  - `docs/release/release-state-registry.md` از `in_progress` خارج شود
- Evidence:
  - لینک/شناسه تگ remote
  - diff مستندات release-state

3. `P0-R3` بسته نهایی go/no-go انتشار
- وضعیت فعلی: `Done`
- اقدام:
  - یک بسته واحد شامل readiness + rc + launch smoke + licensing بسازید
  - تصمیم release authority ثبت شود
- DoD:
  - یک سند نهایی signoff در `docs/release/reports/`
- Evidence:
  - فایل signoff با لینک تمام آرتیفکت‌ها
  - `docs/release/reports/v3-go-no-go-signoff-2026-02-16.md`

### P1 - Deployment Operational Readiness

4. `P1-D1` سخت‌سازی VPS و سرویس‌ها
- وضعیت فعلی: `Ready`
- اقدام:
  - بازبینی `scripts/deploy/bootstrap-ubuntu-vps.sh`
  - کنترل node/pnpm/pm2/nginx/postgres/fail2ban/ufw
- DoD:
  - چک‌لیست hardening امضاشده
- Evidence:
  - گزارش عملیاتی در `docs/deployment/reports/`

5. `P1-D2` اعتبارسنجی nginx + TLS + upstream health
- وضعیت فعلی: `Ready`
- اقدام:
  - تطبیق `ops/nginx/persian-tools.conf` با دامنه واقعی
  - تایید redirectها، TLS و health endpoint
- DoD:
  - `nginx -t` موفق + smoke HTTP/HTTPS موفق
- Evidence:
  - خروجی تست و کانفیگ نهایی

6. `P1-D3` اعتبارسنجی deploy/rollback روی staging
- وضعیت فعلی: `Ready`
- اقدام:
  - dry-run روی `ops/deploy/deploy.sh` و `ops/deploy/rollback.sh`
  - اثبات rollback موفق با health check
- DoD:
  - یک چرخه کامل deploy -> verify -> rollback -> verify
- Evidence:
  - گزارش drill در `docs/deployment/reports/`

7. `P1-D4` کنترل secrets و env contract
- وضعیت فعلی: `Ready`
- اقدام:
  - تطبیق env واقعی با `docs/deployment-readiness-gates.json`
  - تکمیل کلیدهای required برای production
- DoD:
  - عدم فقدان متغیر required
- Evidence:
  - گزارش انطباق env (بدون افشای secret)

### P1 - Quality, Security, Performance Gate

8. `P1-Q1` اجرای گیت کامل قراردادها
- وضعیت فعلی: `Done (Local Validation)`
- اقدام:
  - اجرای `pnpm ci:contracts`
- DoD:
  - تمام قراردادها پاس
- Evidence:
  - گزارش اجرای کامل

9. `P1-Q2` بازبینی عملکرد routeهای پرریسک
- وضعیت فعلی: `Ready`
- اقدام:
  - تمرکز روی مسیرهای ذکرشده در roadmap (`salary`, `topics`, `pdf-tools/merge/merge-pdf`)
  - تحلیل `.lighthouseci` و کاهش ریسک LCP variance
- DoD:
  - کیفیت scoreها از baseline پایین‌تر نرود
- Evidence:
  - گزارش delta در `docs/deployment/reports/`

### P2 - Production Cutover and Stabilization

10. `P2-P1` استقرار production و تایید smoke
- وضعیت فعلی: `Intake`
- اقدام:
  - deploy روی production
  - اجرای smokeهای launch checklist
- DoD:
  - وضعیت سرویس healthy و smoke core پاس
- Evidence:
  - گزارش post-deploy

11. `P2-P2` بسته تایید بعد از استقرار
- وضعیت فعلی: `Intake`
- اقدام:
  - اجرای `pnpm deploy:post:report -- --base-url=<prod-url>`
  - ثبت خروجی‌های runtime
- DoD:
  - گزارش نهایی در `docs/deployment/reports/`
- Evidence:
  - artifact رسمی post-deploy

12. `P2-P3` پاکسازی cache/log/snapshot عملیاتی
- وضعیت فعلی: `Intake`
- اقدام:
  - تعریف سیاست نگه‌داری برای `.next`, `.lighthouseci`, `.mcp-logs`, `.codex/snapshots`
  - آرشیو/حذف کنترل‌شده آرتیفکت‌های غیرضروری
- DoD:
  - سیاست retention مصوب + مصرف دیسک کنترل‌شده
- Evidence:
  - runbook نگه‌داری

## 4) نقشه‌راه فازبندی‌شده تا استقرار کامل

### فاز 0: Release Integrity
- خروجی مورد انتظار: هیچ blocker انتشار باز نباشد.
- کارت‌های فاز: `P0-R1`, `P0-R2`, `P0-R3`
- گیت خروج: وضعیت release از `in_progress` خارج شود و signoff ثبت شود.

### فاز 1: Deployment Readiness on Staging
- خروجی مورد انتظار: زیرساخت و عملیات rollback واقعی اثبات شده باشد.
- کارت‌های فاز: `P1-D1`, `P1-D2`, `P1-D3`, `P1-D4`
- گیت خروج: deploy/rollback drill پاس + env contract کامل.

### فاز 2: Quality & Risk Closure
- خروجی مورد انتظار: کیفیت، امنیت و performance در سطح ورود به production باشد.
- کارت‌های فاز: `P1-Q1`, `P1-Q2`
- گیت خروج: `ci:contracts` پاس + performance regression صفر در مسیرهای بحرانی.

### فاز 3: Production Cutover
- خروجی مورد انتظار: نسخه جدید روی production بالا آمده و smokeها تایید شده باشند.
- کارت‌های فاز: `P2-P1`
- گیت خروج: launch smoke core پاس و سرویس healthy.

### فاز 4: Post-Deploy Stabilization
- خروجی مورد انتظار: شواهد پس از استقرار و نگه‌داری عملیاتی کامل شده باشد.
- کارت‌های فاز: `P2-P2`, `P2-P3`
- گیت خروج: report نهایی + runbook نگه‌داری + کانبان بسته.

## 5) پیشنهاد اجرای روزانه کانبان

1. فقط کارت‌های `P0` وارد `In Progress` شوند تا بسته شوند.
2. همزمان بیش از 2 کارت در `In Progress` نباشد.
3. هر کارت قبل از انتقال به `Done` باید artifact قابل ممیزی ثبت کند.
4. گزارش وضعیت روزانه فقط بر اساس `Done/Blocked/Validation` منتشر شود.

## 6) اجرای Local-First

- مرجع تسک‌برد اجرایی local-first: `docs/strategic-execution/LOCAL_FIRST_TASKBOARD.md`
- لاگ عملیاتی کارت‌ها: `docs/strategic-execution/runtime/Task_Log.csv`
