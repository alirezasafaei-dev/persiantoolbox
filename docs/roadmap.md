# PersianToolbox Roadmap — نقشه راه رشد و توسعه

**Last Updated**: 2026-06-26
**Version**: 6.7.0
**Status**: Active — Phase 2 Execution

---

## هدف استراتژیک

> تبدیل PersianToolbox به **سایت شماره یک ابزارهای آنلاین فارسی** با **درآمد پایدار**.

### KPIهای هدف

| شاخص              | هدف ۳ ماه | هدف ۶ ماه | هدف ۱۲ ماه |
| ----------------- | --------- | --------- | ---------- |
| بازدید روزانه     | ۵,۰۰۰     | ۱۵,۰۰۰    | ۵۰,۰۰۰     |
| صفحات ایندکس شده  | ۳۰۰       | ۵۰۰       | ۱,۰۰۰      |
| نرخ تبدیل پریمیوم | ۱٪        | ۲٪        | ۳٪         |
| درآمد ماهانه      | ۵ میلیون  | ۱۵ میلیون | ۵۰ میلیون  |
| Core Web Vitals   | Pass      | Pass      | Pass       |

---

## وضعیت فعلی (v6.7.0)

| شاخص        | مقدار                                |
| ----------- | ------------------------------------ |
| ابزارها     | **۷۶** در ۶ دسته‌بندی                |
| مقالات بلاگ | **۱۳** (فقط باکیفیت ۲۰۰+ کلمه)       |
| تست‌ها      | **۴۳۴** — همه PASS                   |
| صفحات SSG   | **۲۳۵+**                             |
| OG Images   | **۷۰+** (۱۰۰٪ پوشش)                  |
| فونت‌ها     | **۱۰ فایل** (۳.۴MB صرفه‌جویی)        |
| امنیت       | SSH key-only + fail2ban + UFW        |
| دیپلوی      | PM2 + standalone + Python automation |
| پرداخت      | Zarinpal آماده (منتظر merchant ID)   |
| CDN         | منتظر دامنه .com (آروان کلود فعلی)   |

---

## فاز ۱ — تکمیل‌شده ✅ (v4.0.0 — v6.7.0)

### هسته پلتفرم

- ۷۶ ابزار واقعی در ۶ دسته‌بندی
- سیستم بلاگ با ۱۳ مقاله SEO
- پنل ادمین (analytics, tools, users, audit, funnel, ops, site-settings, GSC)
- حساب کاربری: ورود/ثبت‌نام، داشبورد مالی، پریمیوم
- RTL فارسی + Dark Mode + Accessibility

### SEO و ساختار

- FAQ, HowTo, BreadcrumbList, SoftwareApplication, Article JSON-LD
- OG images برای تمام صفحات
- Sitemap پویا با ابزارها
- Internal linking: BlogToolCTA + ToolBlogCTA + BlogSidebar پویا

### عملکرد

- اسکلت لودینگ روی ۳۷ صفحه
- Dynamic imports برای تمام ابزارها
- Service Worker با ۳ لایه کش
- فونت‌های بهینه‌شده (woff2 only)

### امنیت و زیرساخت

- SSH key-only + fail2ban + UFW
- Sentry error monitoring
- Redis caching
- PostgreSQL + PM2
- SSL (Let's Encrypt)
- اتوماسیون deploy با Python (backup, health, security, rollback)

---

## فاز ۲ — در حال اجرا 🔄 (v6.8.0 — v7.0.0)

### ۲.۱ درگاه پرداخت واقعی (الان)

**وضعیت**: کد آماده، منتظر فعال‌سازی

- [x] Zarinpal adapter (v4 API)
- [x] Checkout + Callback API routes
- [x] صفحات موفق/ناموفق پرداخت
- [x] Feature flag `checkout`
- [ ] فعال‌سازی `FEATURE_CHECKOUT_ENABLED=true` روی VPS
- [ ] تست sandbox → production
- [ ] صفحه pricing با دکمه خرید واقعی

### ۲.۲ تبلیغات هوشمند

**وضعیت**: AdSlot ساخته شده، فعال‌سازی نیاز به AdSense دارد

- [x] `AdSlot` component با A/B testing
- [x] `SiteAdBanner` wrapper
- [x] فعال‌سازی در homepage, tool pages, blog
- [ ] انتظار تأیید Google AdSense
- [ ] جایگزین: تبلیغات داخلی (ابزارهای مرتبط)

### ۲.۳ محتوای بلاگ

**وضعیت**: ۱۳ مقاله فعلی، نیاز به افزایش کیفیت

- [ ] ۵ مقاله جدید برای ابزارهای مالی جدید
- [ ] ۳ مقاله مقایسه‌ای (ابزار A vs ابزار B)
- [ ] سری مقالات "راهنمای جامع" برای هر دسته‌بندی
- [ ] بهبود internal linking در مقالات موجود

---

## فاز ۳ — آینده (v7.0.0+)

### ۳.۱ CDN و عملکرد جهانی

**وضعیت**: منتظر دامنه .com

- [ ] انتقال به دامنه .com
- [ ] تنظیم Cloudflare
- [ ] Edge caching برای static assets
- [ ] Image optimization در edge
- [ ] DDoS protection

### ۳.۲ اکوسیستم

**وضعیت**: Chrome Extension و Telegram Bot ساخته شده‌اند

- [x] Chrome Extension
- [x] Telegram Bot
- [ ] API مستند برای توسعه‌دهندگان
- [ ] Mobile app (React Native)
- [ ] Widget برای وب‌سایت‌های دیگر

### ۳.۳ مقیاس‌پذیری

- [ ] Redis cluster برای rate limiting
- [ ] Database read replicas
- [ ] Background job queue
- [ ] Monitoring dashboard (Grafana)

---

## قوانین توسعه

1. **هر ابزار جدید باید کامل و واقعی باشد** — بدون stub
2. **typecheck + lint + test قبل از هر deploy**
3. **RTL و Dark Mode** — در تمام کامپوننت‌ها
4. **پردازش محلی** — تمام ابزارها در مرورگر کار کنند
5. **SEO first** — هر صفحه metadata, OG, JSON-LD داشته باشد
6. **Mobile first** — تمام UI واکنش‌گرا باشد
7. **امنیت** — SSH key-only, rate limiting, CSRF, CSP
8. **اتوماسیون** — اسکریپت‌های Python برای backup, deploy, monitoring
