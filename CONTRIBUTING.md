# راهنمای مشارکت Persian Tools

> آخرین به‌روزرسانی: 2026-02-06

این راهنما مسیر مشارکت را به‌صورت عملیاتی تعریف می‌کند. برای هر تغییر، ابتدا استانداردها را در `docs/project-standards.md` و راهنمای توسعه را در `docs/developer-guide.md` بررسی کنید.

## پیش‌نیازها

- Node.js 20+
- pnpm 9+
- Git

## شروع سریع

```bash
git clone https://github.com/YOUR_USERNAME/persian-tools.git
cd persian-tools
pnpm install
pnpm dev
```

## جریان استاندارد مشارکت

1. یک branch جدید از `main` بسازید.
2. تغییر را کوچک، متمرکز و قابل تست نگه دارید.
3. ترتیب اجرای کار را بر اساس اولویت (نه زمان‌بندی) مشخص کنید.
4. تست‌های مرتبط را اجرا کنید.
5. مستندات مرتبط در `docs/` را همزمان به‌روزرسانی کنید.
6. PR با توضیح روشن از «مساله، تغییر، روش تست» ارسال کنید.

## سیاست مشارکت حقوقی (فعلی)

- تا زمان نهایی‌شدن CLA، merge مستقیم PRهای خارجی انجام نمی‌شود.
- Issues و Discussions همچنان برای بازخورد و پیشنهاد باز هستند.
- مرز نسخه‌ای مهاجرت لایسنس در `docs/licensing/license-migration-taskboard.md` نگهداری می‌شود.

## کیفیت و تست (الزامی پیش از PR)

```bash
pnpm ci:quick
pnpm test:e2e:ci
```

در صورت محدود بودن دامنه تغییر، اجرای subset قابل قبول است؛ اما باید در توضیحات PR مشخص کنید چه چیزی اجرا شده است.

## حداقل پوشش تست

- برای ابزارهای اصلی، پوشش تست باید حداقل `85%` حفظ شود.
- اگر تغییر شما روی PWA/Consent/Ads است، تست E2E مرتبط باید اضافه یا به‌روزرسانی شود.

## Conventional Commits

فرمت:

```text
<type>(<scope>): <subject>
```

نوع‌های رایج:

- `feat`
- `fix`
- `docs`
- `refactor`
- `test`
- `chore`

## Definition of Done

- وابستگی خارجی runtime اضافه نشده باشد.
- RTL و کلاس‌های منطقی (`start/end`) حفظ شده باشد.
- الزامات دسترس‌پذیری مسیر اصلی (WCAG AA baseline) رعایت شده باشد.
- تست‌های مرتبط سبز باشند.
- مستندات همگام شده باشند.
- اگر سندی منسوخ شده، حذف و ارجاع‌های آن پاک‌سازی شده باشند.

## الگوی گزارش باگ

```text
عنوان:
نسخه:
مرورگر/سیستم‌عامل:
ابزار:
گام‌های بازتولید:
انتظار:
نتیجه واقعی:
```

## لینک‌های مرجع

- `README.md`
- `docs/index.md`
- `docs/project-standards.md`
- `docs/developer-guide.md`
- `docs/review-policy.md`
- `docs/api.md`
- `docs/roadmap.md`
- `docs/deployment-roadmap.md`
