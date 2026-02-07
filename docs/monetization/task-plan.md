# برنامه اجرایی درآمدزایی (Task Plan)

> آخرین به‌روزرسانی: 2026-02-07

این برنامه اجرایی بر پایه **اولویت** و **ترتیب انجام** نگهداری می‌شود.

## اولویت 1 — Privacy & Consent (Blocker)

- [x] enforce کردن policy رضایت در مسیرهای analytics client-side.
- [x] همسان‌سازی behavior واقعی با `docs/monetization/admin-security-checklist.md`.
- [x] افزودن تست E2E برای deny/accept consent.

## اولویت 2 — Monetization Baseline

- [x] اتصال `AdSlot` به consent و ثبت متریک‌های ضروری.
- [x] محدودسازی ingest analytics در API با secret.
- [x] تعریف guardrail واضح برای داده‌های جمع‌آوری‌شده.

## اولویت 3 — Governance & Reporting

- [x] تعریف چک‌لیست امنیتی ادمین/لاگ‌ها.
- [x] تعریف governance شاخص‌ها و مسئولیت‌ها.
- [x] تعریف runbookهای close و escalation.
- [x] تبدیل خروجی reviewها به backlog عملیاتی قابل رهگیری.

## اولویت 4 — Product Iteration

- [x] اتصال view/click تبلیغ محلی به گزارش تجمیعی دوره‌ای.
- [x] انتشار اعلامیه شفافیت مدل درآمدی در UI و مستندات.
- [x] اجرای آزمایش‌های داخلی بدون dependency خارجی runtime.
- [x] ثبت تصمیم‌های محصول بر اساس KPI و ریسک privacy.

## اولویت 5 — Controlled Optimization

- [x] پیاده‌سازی A/B داخلی برای `AdSlot` با تخصیص محلی deterministic.
- [x] اتصال KPIهای UX/Revenue به گزارش تجمیعی (`consentAcceptanceRate`, `topVariantId`, `CTR`).
- [x] افزودن تست unit/e2e برای privacy guardrailهای variant و پایداری تخصیص.

## اولویت 6 — Operations Stability

- [x] تبدیل چرخه عملیات ماهانه/فصلی KPI به artifact قراردادی (`operations-checklist.json`).
- [x] اتصال playbook تصمیم‌گیری به validatorهای اجرایی (`monetization:ops:validate`).
- [x] افزودن تست قراردادی برای checklist عملیات و guardrailهای تصمیم‌گیری.

## ترتیب انجام

1. اولویت 1 و 2 باید قبل از هر توسعه درآمدی جدید بسته شوند.
2. اولویت 3 فرآیند تصمیم‌گیری و شفافیت را پایدار می‌کند.
3. اولویت 4 تا 6 فقط بعد از تثبیت baseline اجرا می‌شوند.
