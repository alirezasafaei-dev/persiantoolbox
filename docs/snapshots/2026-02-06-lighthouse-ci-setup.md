# 2026-02-06 — Codex Cloud + Lighthouse CI Setup Snapshot

## انجام‌شده‌ها

- افزودن پلی‌بوک Codex Cloud برای ممیزی و رفکتور Next.js در `docs/codex-audit-playbook.md`.
- اضافه کردن اسکریپت‌های `start:prod`, `lighthouse`, `lighthouse:ci` در `package.json` برای اجرای پایدار Lighthouse روی build پروداکشن.
- افزودن فایل `lighthouserc.json` با threshold های perf/SEO/accessibility و اجرای ۳ باره برای کاهش نوسان.
- پوشش مسیرهای حیاتی (`/`, PDF merge, image tools, loan, salary, offline) در پروفایل Lighthouse.
- به‌روز کردن `.gitignore` برای جلوگیری از کامیت گزارش‌های Lighthouse.
- تکمیل `docs/operations.md` با بخش پایش Lighthouse و نحوه اجرا در dev/CI.
- اضافه کردن ورک‌فلو GitHub Actions `lighthouse-ci.yml` برای اجرای خودکار روی push/PR و ذخیره artifact.
- رفع خطاهای lint (indent) در چند فایل موجود برای سبز شدن `pnpm lint`.

## اقدام‌های بعدی پیشنهادی

- اتصال `pnpm lighthouse:ci` به لوله CI اصلی و ذخیره گزارش‌ها به‌صورت artifact.
- افزودن مسیرهای حیاتی بیشتر (PDF، وام، حقوق، ابزار تصویر) به `lighthouserc.json` با پروفایل جداگانه.
- اضافه کردن تست‌های Playwright برای بنر به‌روزرسانی SW و بنر رضایت تبلیغات در کنار تست‌های Lighthouse.
