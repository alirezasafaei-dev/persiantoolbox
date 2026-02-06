---
name: persian-tools-engineering
version: 1.2
status: active
owner: persian-tools
short-description: 'استاندارد عملیاتی برای توسعه امن، پایدار و اولویت‌محور در Persian Tools'
---

# مهارت مهندسی Persian Tools

این مهارت، قواعد عملیاتی تیم برای تغییرات فنی در Persian Tools است.

## اهداف کلیدی

- حفظ کیفیت فنی در کنار سرعت توسعه.
- هم‌راستایی مستندات با رفتار واقعی کد.
- حفظ اصول local-first، RTL، privacy-by-default.

## اصول غیرقابل مذاکره

1. **Local-first**: پردازش در مرورگر، مگر با رضایت صریح.
2. **بدون وابستگی خارجی runtime**: بدون CDN یا script ثالث برای هسته.
3. **RTL صحیح**: استفاده از الگوهای منطقی `start/end`.
4. **دسترس‌پذیری پایه**: مسیرهای اصلی حداقل WCAG 2.1 AA.
5. **حریم خصوصی پیش‌فرض**: ads/analytics فقط با consent.

## مسیرهای اصلی پروژه

- `app/` روت‌ها و API
- `components/` اجزای UI
- `features/` منطق ابزارها
- `shared/` هسته مشترک
- `lib/` سرویس‌ها و لایه server
- `public/` دارایی self-host
- `docs/` مستندات مرجع

## فرآیند استاندارد تغییر

1. مرور `docs/project-standards.md`.
2. کشف دامنه تغییر با `rg`.
3. پیاده‌سازی کوچک و قابل تست.
4. اجرای `pnpm ci:quick`.
5. اجرای `pnpm test:e2e:ci` در تغییرات ریسکی.
6. به‌روزرسانی `docs/` و `docs/index.md`.

## استاندارد کیفیت کد

- TypeScript strict.
- بدون `any` غیرمستند.
- استفاده از design tokens.
- رعایت `prefers-reduced-motion`.
- در تغییرات SW، bump `CACHE_VERSION`.

## استاندارد مستندسازی

- مستندات باید **اولویت‌محور** باشند، نه زمان‌بندی‌محور.
- اسناد منسوخ یا فاقد کاربری باید حذف شوند.
- پس از حذف اسناد، همه ارجاع‌ها باید اصلاح شوند.

## ضدالگوهای پرخطر

- اضافه‌کردن script خارجی runtime.
- تغییر consent flow بدون test/update docs.
- نگه‌داشتن snapshot یا report منسوخ در شاخه اصلی.

## خروجی مورد انتظار

- کد پایدار و قابل تست.
- مستندات کوتاه، دقیق و هم‌راستا با اجرا.
- مسیر deploy و security قابل بررسی و تکرارپذیر.
