# PersianToolbox Roadmap — وضعیت نهایی

**Last Updated**: 2026-06-17
**Version**: 3.2.0
**Status**: Complete

---

## خلاصه وضعیت نهایی

- **ابزارها**: ۴۶+ ابزار فعال در ۶ دسته‌بندی
- **تست‌ها**: ۳۲۸ تست واحد (۹۱ فایل تست)
- **کیفیت**: lint, typecheck, vitest, build — همه PASS
- **امنیت**: CSP nonce-based, HSTS, COOP, CORP, Permissions-Policy
- **دیپلوی**: https://persiantoolbox.ir (v3.2.0)
- **گیت‌هاب**: `origin/main` — آخرین کامیت `178a1c6`

---

## P0 — بلاکرهای تولید

هیچ بلاکر فعالی وجود ندارد. ✅

---

## P1 — تکمیل فیچرهای نیمه‌کاره

### 1. احراز هویت (auth) ✅

- فلگ فعال شد
- API لاگین/لاگاوت/رجیستر/me کامل
- Session management با PostgreSQL
- CSRF protection فعال

### 2. حساب کاربری (account) ✅

- فلگ فعال شد
- صفحه account با اتصال به سیستم احراز هویت
- نمایش اطلاعات کاربر و تاریخچه

### 3. اشتراک‌ها (subscription) ✅

- فلگ فعال شد
- API route‌ها: checkout, confirm, status, webhook
- صفحه subscription با انتخاب طرح و پرداخت

### 4. طرح‌های اشتراک (plans) ✅

- فلگ فعال شد
- ۴ طرح: basic_monthly, basic_yearly, pro_monthly, pro_yearly

### 5. تسویه (checkout) ✅

- فلگ فعال شد
- اتصال به سیستم پرداخت

### 6. داشبورد (dashboard) ✅

- فلگ فعال شد
- پنل اپراتوری با وضعیت سرویس

---

## P2 — پریمیوم و تبلیغات

### 7. شفافیت تبلیغات (ads) ✅

- فلگ فعال شد
- صفحه شفافیت تبلیغات کامل

### 8. پنل ادمین تنظیمات (admin-site-settings) ✅

- فلگ فعال شد
- مدیریت لینک ثبت سفارش و نمونه‌کارها

### 9. پنل ادمین درآمدزایی (admin-monetization) ✅

- فلگ فعال شد
- داشبورد درآمدزایی

---

## P3 — توسعه‌دهندگان و ابزارها

### 10. راهنمای توسعه‌دهندگان (developers) ✅

- فلگ فعال شد
- صفحه کامل با نمونه کدها و API docs
- JSON Formatter و Base64 Tool کاربردی

### 11. ابزارهای PDF جدید ✅

- **افزودن شماره صفحه** (add-page-numbers): pdf-lib
- **استخراج متن** (extract-text): pdfjs-dist
- **تبدیل PDF به متن** (pdf-to-text): pdfjs-dist
- **تبدیل Word به PDF** (word-to-pdf): browser print
- **رمزگذاری PDF** (encrypt-pdf): بازنویسی با محدودیت‌های مرورگر

---

## P4 — تست و کیفیت

### 12. تست‌ها ✅

- ۳۲۸/۳۲۸ تست رد شد
- lint بدون خطا
- typecheck بدون خطا
- build موفق

---

## P5 — دیپلوی و زیرساخت

### 13. دیپلوی VPS ✅

- `.env.production` با تمام feature flags
- PostgreSQL database ایجاد شد
- PM2 با `--update-env` ریستارت شد
- تمام ۲۸ مسیر HTTP 200

### 14. امنیت ✅

- Security middleware فعال (proxy.ts → middleware)
- CSP nonce-based
- HSTS
- COOP, CORP, Permissions-Policy

### 15. Service Worker ✅

- آپدیت v9→v10 (رفع مشکل کش)
- ۲۰ shell asset
- Cache invalidation

---

## P6 — تمیزکاری و مستندات

### 16. پاکسازی کد مرده ✅

- ۳۰ فایل حذف شد (~۶۱۳۱ خط)
- agent automation stubs
- duplicate modules
- unused business logic

### 17. بروزرسانی مستندات ✅

- roadmap.md بروزرسانی شد
- deploy scripts بروزرسانی شد
- .env.production.example بروزرسانی شد

---

## چیزهایی که هنوز نیاز به کار دارد (آینده)

### پرداخت واقعی

- اتصال به درگاه پرداخت واقعی (zarinpal/idpay)
- ذخیره‌سازی اشتراک در PostgreSQL (نه in-memory)

### بهبودهای UI

- بهینه‌سازی کش مرورگر برای کاربران جدید
- PWA install prompt
- Dark mode toggle در ناوبری

### زیرساخت

- Redis برای rate limiting (جایگزین in-memory)
- CDN برای static assets
- Monitoring و alerting
