# فهرست مستندات Persian Tools

> آخرین به‌روزرسانی: 2026-02-08

## مستندات هسته

- `docs/project-standards.md` — استانداردهای فنی و طراحی پروژه.
- `docs/developer-guide.md` — راهنمای توسعه ابزارها، UI و چک‌لیست‌های اجرایی.
- `docs/review-policy.md` — سیاست بازبینی PR و معیارهای تایید.
- `docs/operations.md` — راهنمای عملیاتی self-host و runbook اجرای سرویس.
- `docs/codex-audit-playbook.md` — پلی‌بوک Codex Cloud برای ممیزی/رفکتور و بهینه‌سازی Next.js + PWA.
- منابع Codex Cloud:
  - `https://chatgpt.com/codex`
  - `https://chatgpt.com/codex/settings/environment/698658924bb081919cd3731a5cd5498f` (محیط پیشنهادی اجراهای سنگین)
- `docs/api.md` — مرجع خلاصه API و لینک Typedoc.
- `docs/roadmap.md` — نقشه توسعه بر پایه اولویت و ترتیب اجرا.
- `docs/deployment-roadmap.md` — نقشه آماده‌سازی استقرار بر پایه اولویت و ترتیب اجرا.
- `docs/daily-checklist.md` — چک‌لیست روزانه توسعه.

## قوانین و نقش‌ها

- `AGENTS.md` — راهنمای عملیاتی عامل‌ها در مخزن.
- `SKILL.md` — مهارت مهندسی پروژه.
- `skill.toml` — نقش‌ها و مسئولیت‌ها.

## لایسنس و برند

- `docs/licensing/license-migration-taskboard.md` — بورد اجرایی مهاجرت لایسنس از MIT به Dual License.
- `docs/licensing/dual-license-policy.md` — سیاست نسخه‌ای و تعریف استفاده Non-Commercial/Commercial.
- `docs/licensing/cla-individual.md` — الگوی ICLA برای مشارکت‌کنندگان فردی.
- `docs/licensing/cla-corporate.md` — الگوی CCLA برای مشارکت‌های سازمانی.
- `docs/licensing/cla-operations.md` — runbook عملیاتی CLA (storage/audit/reference-id).
- `docs/licensing/package-license-transition.md` — قاعده تغییر `package.json#license` در مرز نسخه `v2.0.0`.
- `docs/licensing/v2-license-release-checklist.md` — چک‌لیست رسمی release مرز تغییر لایسنس در `v2.0.0`.
- `docs/licensing/v2-release-notes-template.md` — template رسمی release notes برای migration لایسنس `v2.0.0`.
- `docs/licensing/reports/v2-license-migration-dry-run-2026-02-08.json` — dry-run مستنداتی آمادگی مهاجرت مرز لایسنس.
- `docs/licensing/reports/v2-license-release-prep-dry-run-2026-02-08T14-29-57-080Z.json` — dry-run آماده‌سازی release مرز لایسنس.
- `docs/licensing/reports/v2.0.0-release-notes.md` — release notes نهایی مرز لایسنس در `v2.0.0`.
- `docs/licensing/reports/v2-license-checklist-execution-2026-02-08-final.md` — گزارش اجرای checklist نهایی مرز لایسنس.
- `docs/licensing/reports/v2.0.0-post-release-verification-2026-02-08.md` — گزارش post-release verification برای وضعیت release و CI.
- `docs/licensing/reports/README.md` — راهنمای گزارش‌های dry-run لایسنس.
- `COMMERCIAL.md` — مسیر استفاده تجاری و الزامات مجوز.
- `LICENSE-NONCOMMERCIAL.md` — متن لایسنس غیرتجاری (برنامه‌ریزی‌شده برای نسخه‌های بعدی).
- `LICENSE-COMMERCIAL.md` — اعلان مسیر لایسنس تجاری.
- `TRADEMARKS.md` — سیاست استفاده از نام و هویت برند.
- `DCO.md` — سیاست Developer Certificate of Origin برای مشارکت خارجی.
- `.github/PULL_REQUEST_TEMPLATE.md` — قالب PR با الزام صریح DCO.

## ممیزی و گزارش‌ها

- `docs/technical-audit.md` — ممیزی فنی و راهبردی کامل.
- `docs/technical-audit-summary.md` — خلاصه اجرایی متنی.
- `docs/snapshots/2026-02-06-lighthouse-ci-setup.md` — اسنپ‌شات آماده‌سازی Lighthouse CI.
- `docs/snapshots/2026-02-06-docs-priority-refresh-handoff.md` — اسنپ‌شات بازآرایی مستندات به مدل اولویت‌محور.
- `docs/snapshots/2026-02-07-priority1-db-unification-handoff.md` — اسنپ‌شات اجرای اولویت ۱ (SQL-first + پایداری install).
- `docs/snapshots/2026-02-07-priority2-security-privacy-handoff.md` — اسنپ‌شات اجرای اولویت ۲ (authz + consent + ingest security).
- `docs/snapshots/2026-02-07-priority3-ci-core-handoff.md` — اسنپ‌شات اجرای CI core برای gate دائمی merge.
- `docs/snapshots/2026-02-07-priority3-coverage-security-tests-handoff.md` — اسنپ‌شات تکمیل coverage scope و تست‌های امنیتی هسته.
- `docs/snapshots/2026-02-07-priority4-ux-async-state-handoff.md` — اسنپ‌شات یکپارچه‌سازی stateهای async و بهبود دسترس‌پذیری در account/history.
- `docs/snapshots/2026-02-07-priority4-history-regression-handoff.md` — اسنپ‌شات تثبیت تست regression برای stateهای تاریخچه.
- `docs/snapshots/2026-02-07-priority4-tools-asyncstate-retry-e2e-handoff.md` — اسنپ‌شات گسترش AsyncState در صفحات پرترافیک و baseline سناریوهای retry در E2E.
- `docs/snapshots/2026-02-07-priority4-rtl-logical-classes-handoff.md` — اسنپ‌شات پاکسازی کلاس‌های RTL جهت‌محور در صفحات پرترافیک مالی.
- `docs/snapshots/2026-02-07-priority4-texttools-asyncstate-handoff.md` — اسنپ‌شات یکپارچه‌سازی خطاهای text-tools با AsyncState.
- `docs/snapshots/2026-02-07-priority4-texttools-unit-coverage-handoff.md` — اسنپ‌شات پوشش تست واحد برای خطاهای AsyncState در text-tools.
- `docs/snapshots/2026-02-07-priority4-validationtools-unit-coverage-handoff.md` — اسنپ‌شات پوشش interaction تست‌های validation-tools.
- `docs/snapshots/2026-02-07-priority4-high-traffic-asyncstate-regression-handoff.md` — اسنپ‌شات پوشش regression نمایش AsyncState در صفحات پرترافیک.
- `docs/snapshots/2026-02-07-priority4-ui-test-warning-noise-reduction-handoff.md` — اسنپ‌شات کاهش نویز هشدارهای UI test در Priority 4.
- `docs/snapshots/2026-02-07-priority4-retry-recovery-message-e2e-handoff.md` — اسنپ‌شات تقویت سناریوهای retry با پیام صریح بازیابی در E2E.
- `docs/snapshots/2026-02-07-priority4-retry-e2e-full-suite-stability-handoff.md` — اسنپ‌شات پایدارسازی کامل suite E2E برای retry/offline و تایید اجرای fixture-backed.
- `docs/snapshots/2026-02-07-priority4-account-load-retry-e2e-handoff.md` — اسنپ‌شات پوشش E2E برای بازیابی بارگذاری حساب در `/account`.
- `docs/snapshots/2026-02-07-priority4-retry-resilience-pack-handoff.md` — اسنپ‌شات بسته کامل resilience برای retry/account/offline و پوشش قرارداد state.
- `docs/snapshots/2026-02-07-priority4-roadmap-board-sync-handoff.md` — اسنپ‌شات همگام‌سازی بورد گرافیکی roadmap با وضعیت اجرایی Priority 4.
- `docs/snapshots/2026-02-07-priority4-wcag-asyncstate-closure-handoff.md` — اسنپ‌شات تکمیل guardrailهای WCAG مسیرهای پرترافیک و بستن AsyncState ابزارهای باقی‌مانده.
- `docs/snapshots/2026-02-07-priority5-seo-pwa-closure-handoff.md` — اسنپ‌شات تکمیل Priority 5 (JSON-LD/Lighthouse/SW lifecycle) و آماده‌سازی Priority 6.
- `docs/snapshots/2026-02-07-priority6-monetization-ops-closure-handoff.md` — اسنپ‌شات تکمیل Priority 6 (review-to-backlog + consent/admin/log guardrails).
- `docs/snapshots/2026-02-07-priority7-low-risk-revenue-closure-handoff.md` — اسنپ‌شات تکمیل Priority 7 (گزارش تجمیعی تبلیغات + شفافیت مدل درآمدی + تست‌های privacy).
- `docs/snapshots/2026-02-07-priority8-controlled-optimization-handoff.md` — اسنپ‌شات تکمیل Priority 8 (A/B داخلی + KPIهای UX/Revenue + تثبیت guardrailهای privacy).
- `docs/snapshots/2026-02-07-priority9-operations-stability-handoff.md` — اسنپ‌شات تکمیل Priority 9 (artifact قراردادی عملیات + validator + تست guardrailهای تصمیم).
- `docs/snapshots/2026-02-07-priority10-close-automation-handoff.md` — اسنپ‌شات تکمیل Priority 10 (اتوماسیون close ماهانه/فصلی + artifact هشدار به تصمیم + validator/test).
- `docs/snapshots/2026-02-07-priority11-deploy-readiness-contract-handoff.md` — اسنپ‌شات تکمیل Priority 11 (artifact قراردادی deploy readiness + validator + pipeline گیت استقرار).
- `docs/snapshots/2026-02-07-priority12-rc-rollback-automation-handoff.md` — اسنپ‌شات تکمیل Priority 12 (artifact قراردادی RC + rollback drill + runner/validator/test).
- `docs/snapshots/2026-02-07-priority13-launch-smoke-automation-handoff.md` — اسنپ‌شات تکمیل Priority 13 (artifact قراردادی launch-day + smoke runner + report contract + fix پایداری A/B variant).
- `docs/snapshots/2026-02-07-final-deployment-readiness-sync-handoff.md` — اسنپ‌شات نهایی همگام‌سازی مستندات و تایید آماده‌بودن فنی استقرار.
- `docs/snapshots/2026-02-08-visual-roadmap-boards-refresh-handoff.md` — اسنپ‌شات بازطراحی گرافیکی بوردهای roadmap/deployment با داشبورد KPI، فیلتر وضعیت و ناوبری اولویت‌ها.
- `docs/snapshots/2026-02-08-admin-developer-attribution-settings-handoff.md` — اسنپ‌شات افزودن attribution حرفه‌ای فوتر با لینک‌های قابل مدیریت از پنل ادمین.
- `docs/snapshots/2026-02-08-admin-attribution-delivery-final-handoff.md` — اسنپ‌شات نهایی تحویل قابلیت مدیریت لینک‌های معرفی توسعه‌دهنده و آماده‌سازی گام بعدی E2E.
- `docs/snapshots/2026-02-08-admin-site-settings-e2e-contract-handoff.md` — اسنپ‌شات تکمیل E2E پنل تنظیمات سایت، fallback ادمین در نبود DB و validator قراردادی site-settings.
- `docs/snapshots/2026-02-08-admin-site-settings-persistence-and-ci-gate-handoff.md` — اسنپ‌شات رفع race ذخیره developerName، افزودن سناریوی E2E حالت نبود DB و اتصال gate سبک قراردادها به CI.
- `docs/snapshots/2026-02-08-full-e2e-and-admin-race-stability-handoff.md` — اسنپ‌شات اجرای full E2E Chromium با backend flags، افزودن unit race test و ثبت policy گیت قراردادی در استانداردها.
- `docs/snapshots/2026-02-08-backend-e2e-runbook-and-readiness-summary-handoff.md` — اسنپ‌شات اجرای full E2E backend-enabled، ثبت runbook عملیاتی و تولید readiness summary artifact.
- `docs/snapshots/2026-02-08-priority4-ci-readiness-artifacts-handoff.md` — اسنپ‌شات تکمیل کاهش نویز `act(...)` و اتصال readiness summary به artifact خروجی CI.
- `docs/snapshots/2026-02-08-license-migration-taskboard-handoff.md` — اسنپ‌شات تبدیل تحلیل لایسنس به taskboard اجرایی و اعمال فاز P0 حاکمیت لایسنس.
- `docs/snapshots/2026-02-08-license-priority1-contract-enforcement-handoff.md` — اسنپ‌شات تکمیل Priority 1 لایسنس (validator قراردادی CI + transition plan + issuance template).
- `docs/snapshots/2026-02-08-eod-docs-sync-handoff.md` — اسنپ‌شات نهایی پایان روز برای همگام‌سازی مستندات و آماده‌سازی ادامه کار.
- `docs/snapshots/2026-02-08-license-priority2-operational-hardening-handoff.md` — اسنپ‌شات تکمیل Priority 2 لایسنس (DCO governance + entrypoint notices + commercial FAQ).
- `docs/snapshots/2026-02-08-license-priority3-cla-hybrid-release-readiness-handoff.md` — اسنپ‌شات تکمیل CLA hybrid و چک‌لیست release لایسنس `v2.0.0`.
- `docs/snapshots/2026-02-08-license-priority4-operations-consistency-dryrun-handoff.md` — اسنپ‌شات تکمیل runbook عملیاتی CLA، validator consistency و dry-run مهاجرت.
- `docs/snapshots/2026-02-08-license-priority5-release-prep-automation-handoff.md` — اسنپ‌شات تکمیل release-prep branch، release notes template و CI licensing-docs job.
- `docs/snapshots/2026-02-08-license-priority6-rc-boundary-execution-handoff.md` — اسنپ‌شات اجرای واقعی checklist مرز لایسنس در branch release-candidate.
- `docs/snapshots/2026-02-08-license-priority7-final-release-cut-handoff.md` — اسنپ‌شات merge نهایی release-prep، برش نسخه `v2.0.0` و push tag رسمی.
- `docs/snapshots/2026-02-08-license-post-release-verification-docs-sync-handoff.md` — اسنپ‌شات پاکسازی RC-only reports، همگام‌سازی بوردهای گرافیکی و ثبت post-release verification.
- `docs/snapshots/2026-02-08-license-post-release-rerun-and-deploy-roadmap-sync.md` — اسنپ‌شات اجرای rerun واقعی CI، ثبت نتیجه و همگام‌سازی roadmap استقرار با اولویت تایید post-release.
- `docs/snapshots/2026-02-08-ci-core-workflow-hardening-handoff.md` — اسنپ‌شات hardening workflow اصلی CI برای حذف وابستگی به Setup Node و تثبیت اجرا.
- `docs/snapshots/2026-02-08-ci-quality-regression-fix-rerun-handoff.md` — اسنپ‌شات رفع regression کیفیت در `playwright.config.ts` و آماده‌سازی rerun نهایی CI.
- `docs/snapshots/2026-02-08-ci-core-green-post-hardening-handoff.md` — اسنپ‌شات سبز شدن کامل `ci-core` پس از hardening و fix کیفیت.
- `docs/snapshots/2026-02-08-release-readiness-final-lock-and-deploy-start.md` — اسنپ‌شات قفل نهایی readiness و همگام‌سازی بوردهای گرافیکی برای شروع deploy واقعی.
- `docs/snapshots/2026-02-08-deployment-roadmap-priority11-12-tasking-handoff.md` — اسنپ‌شات افزودن تسک‌های Priority 11/12 برای اجرای deploy واقعی و تایید post-deploy.
- `docs/snapshots/2026-02-08-deployment-external-actions-owner-checklist-handoff.md` — اسنپ‌شات افزودن Priority 13 برای کارهای خارج از ریپو با مالکیت مستقیم شما.

## درآمدزایی و پایداری

- `docs/monetization/strategy.md` — استراتژی کلان و اصول حریم خصوصی.
- `docs/monetization/roadmap.md` — نقشه درآمدزایی بر پایه اولویت و ترتیب اجرا.
- `docs/monetization/task-plan.md` — تسک‌های اجرایی اولویت‌بندی‌شده.
- `docs/monetization/admin-security-checklist.md` — چک‌لیست بازبینی امنیت پنل ادمین و لاگ‌های حساس.
- `docs/monetization/kpi-governance.md` — چارچوب مالکیت KPI و cadence بازبینی.
- `docs/monetization/monthly-close-runbook.md` — runbook عملیاتی close.
- `docs/monetization/quarterly-close-runbook.md` — runbook close سطح review.
- `docs/monetization/kpi-alerting-escalation.md` — آستانه‌های هشدار KPI و escalation matrix.
- `docs/monetization/alerting-decision-rules.json` — artifact قراردادی نگاشت severity هشدار KPI به تصمیم `scale/hold/rollback`.
- `docs/monetization/site-settings-contract.json` — artifact قراردادی تنظیمات معرفی توسعه‌دهنده (DB/ENV fallback keys).
- `docs/monetization/scale-hold-rollback-playbook.md` — playbook تصمیم‌گیری `scale/hold/rollback`.
- `docs/monetization/review-to-backlog-flow.md` — جریان اتصال reviewها به backlog محصول.
- `docs/monetization/review-backlog.json` — artifact قراردادی backlog برای خروجی reviewها.
- `docs/monetization/operations-checklist.json` — artifact قراردادی چرخه عملیات KPI و gate تصمیم‌های scale/hold/rollback.
- `docs/monetization/reports/README.md` — قرارداد خروجی pipelineهای خودکار close.
- `docs/monetization/monthly-report-template.md` — قالب گزارش دوره‌ای.
- `docs/monetization/analytics-guardrails.md` — مرزهای داده analytics، retention و کنترل دسترسی.

## استقرار

- `docs/deployment-readiness-gates.json` — artifact قراردادی گیت‌های استقرار (`env/security/pwa/build/lighthouse`).
- `docs/deployment/reports/README.md` — قرارداد و مسیر خروجی گزارش‌های اجرای گیت استقرار.
- `docs/release-candidate-checklist.json` — artifact قراردادی گیت‌های Release Candidate.
- `docs/rollback-drill-checklist.json` — artifact قراردادی چک‌لیست تمرین بازگشت (rollback drill).
- `docs/launch-day-checklist.json` — artifact قراردادی smoke suite روز لانچ.
- `docs/release/reports/README.md` — قرارداد و مسیر خروجی گزارش‌های اجرای RC gates.

## ابزار مدیریت گرافیکی

- `docs/roadmap-board.html` — بورد HTML چک‌لیستی بر پایه اولویت.
- مسیر داخلی اپ: `/roadmap-board`
- `docs/deployment-roadmap.html` — بورد HTML deploy readiness بر پایه اولویت.
- مسیر داخلی اپ: `/deployment-roadmap`
