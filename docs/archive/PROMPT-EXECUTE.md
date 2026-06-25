# پرامپت اجرای کامل نقشه راه PersianToolbox

این پرامپت را در چت جدید وارد کنید تا نقشه راه به صورت خودکار اجرا شود:

---

تو یک مهندس ارشد فول‌استک، QA engineer، DevOps engineer و release manager هستی.

پروژه:

- مسیر: /home/dev13/my-project/sites/live/persiantoolbox
- سایت: https://persiantoolbox.ir
- VPS: <VPS_IP> (کاربر: ubuntu، پورت: 22)
- رمز SSH در فایل .env موجود است

مأموریت:
نقشه راه کامل پروژه را اجرا کن. تمام فیچرهای غیرفعال و نیمه‌کاره را تکمیل کن. همه چیز باید کامل و واقعی باشد.

قوانین:

- خودکار کار کن بدون توقف
- فقط برای موارد مخرب یا مبهم تأیید بگیر
- کد واقعی بنویس، placeholder نذار
- RTL و رفتار فارسی‌اول را حفظ کن
- حریم خصوصی محلی را حفظ کن
- تست بنویس
- قبل از دیپلوی quality gates را اجرا کن

مراحل اجرا (به ترتیب):

## فاز ۱: احراز هویت و حساب کاربری

1. خواندن lib/server/auth.ts, lib/server/sessions.ts, lib/server/passwords.ts
2. بررسی API route‌ها: app/api/auth/login, logout, me, register
3. بررسی صحت جریان لاگین/لاگاوت/رجیستر
4. فعال‌سازی فلگ `auth` در lib/features/availability.ts
5. خواندن app/account/page.tsx
6. فعال‌سازی فلگ `account`
7. تست کامل جریان احراز هویت

## فاز ۲: اشتراک و پرداخت

1. خواندن lib/subscriptions/, lib/subscriptionPlans.ts
2. بررسی API route‌ها: app/api/subscription/\*
3. فعال‌سازی فلگ `subscription`
4. فعال‌سازی فلگ `plans`
5. فعال‌سازی فلگ `checkout`
6. خواندن app/(tools)/subscription/page.tsx و حذف بنر "به‌زودی"
7. خواندن app/(tools)/premium/page.tsx و حذف بنر "به‌زودی"
8. فعال‌سازی فلگ `subscription`
9. تست کامل جریان اشتراک

## فاز ۳: پریمیوم و تبلیغات

1. خواندن lib/premium/premium-features.ts
2. فعال‌سازی premium features
3. فعال‌سازی فلگ `ads`
4. تست صفحه تبلیغات

## فاز ۴: پنل ادمین

1. فعال‌سازی فلگ `admin-site-settings`
2. فعال‌سازی فلگ `admin-monetization`
3. فعال‌سازی فلگ `dashboard`
4. تست پنل‌های ادمین

## فاز ۵: توسعه‌دهندگان و ابزارها

1. فعال‌سازی فلگ `developers`
2. بررسی ابزارهای Base64 و JSON Formatter
3. پیاده‌سازی یا حذف رمزگذاری PDF (encrypt-pdf)
4. تست تمام ابزارها

## فاز ۶: تست و کیفیت

1. اجرای pnpm lint
2. اجرای pnpm typecheck
3. اجرای pnpm vitest --run
4. اجرای pnpm test:ci
5. اجرای pnpm build
6. رفع تمام خطاها

## فاز ۷: دیپلوی

1. بروزرسانی version در package.json
2. هماهنگ‌سازی کد با VPS (rsync)
3. build روی VPS
4. ریستارت PM2
5. بررسی تمام مسیرها روی سایت زنده

## فاز ۸: مستندات و تمیزکاری

1. بروزرسانی docs/roadmap.md
2. حذف placeholder و stub کدها
3. پاکسازی فایل‌های استفاده نشده
4. کامیت نهایی

خروجی نهایی:

- تمام فلگ‌های غیرفعال فعال شده باشند
- تمام بنرهای "به‌زودی" حذف شده باشند
- تمام ابزارها کاربردی باشند
- اپ موبایل تکمیل شده باشد
- تست‌ها کامل باشند
- سایت زنده و کاربردی باشد
- مستندات بروز شده باشد
