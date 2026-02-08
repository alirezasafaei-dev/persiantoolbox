# Package License Transition Plan

> آخرین به‌روزرسانی: 2026-02-08

این سند تغییر `package.json#license` را در مرز نسخه‌ای لایسنس مشخص می‌کند تا وضعیت MIT فعلی نشکند.

## Rule

- برای نسخه‌های `< 2.0.0`:
  - `package.json#license` باید `MIT` باقی بماند.
- برای نسخه‌های `>= 2.0.0`:
  - `package.json#license` باید به `SEE LICENSE IN LICENSE` تغییر کند.

## Execution Steps

1. قبل از برش `v2.0.0`:
   - فایل `LICENSE` را از متن MIT به selector یا متن سازگار با Dual License تغییر دهید.
2. در همان commit:
   - `package.json#license` را از `MIT` به `SEE LICENSE IN LICENSE` تغییر دهید.
3. در همان release:
   - `README.md` و `CHANGELOG.md` را با مرز نسخه‌ای نهایی sync کنید.

## Validation Gate

- اسکریپت `pnpm licensing:validate` این قاعده را enforce می‌کند.
