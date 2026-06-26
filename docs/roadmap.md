# PersianToolbox Roadmap — نقشه راه رشد و توسعه

**Last Updated**: 2026-06-26
**Version**: 6.7.0
**Status**: Active — Ready for Growth Phase

---

## هدف استراتژیک

> تبدیل PersianToolbox به **سایت شماره یک ابزارهای آنلاین فارسی** با **درآمد پایدار**.

---

## وضعیت فعلی (v6.7.0)

| شاخص        | مقدار                                                 |
| ----------- | ----------------------------------------------------- |
| ابزارها     | ۷۶ در ۶ دسته‌بندی                                     |
| مقالات بلاگ | ۵۱ مقاله باکیفیت                                      |
| تست‌ها      | ۵۴۱ — همه PASS                                        |
| OG Images   | ۱۰۰٪ پوشش                                             |
| صفحات SSG   | ۲۳۵+ صفحه                                             |
| API Routes  | ۴۹ مسیر                                               |
| جداول DB    | ۱۵ جدول                                               |
| پرداخت      | **Zarinpal فعال + اشتراک**                            |
| امنیت       | **Admin panel hardened**                              |
| لوگو        | **PT monogram SVG**                                   |
| CDN         | منتظر دامنه .com                                      |
| اتوماسیون   | **Python scripts (backup, deploy, health, security)** |

---

## فاز ۱ — تکمیل‌شده ✅ (v4.0.0 — v6.7.0)

هسته پلتفرم، ۷۶ ابزار، SEO، امنیت، اتوماسیون، dark mode، accessibility — همه انجام شده.

---

## فاز ۲ — تکمیل‌شده ✅

### ۲.۱ درگاه پرداخت Zarinpal — **تکمیل‌شده ✅**

- [x] Zarinpal adapter (v4 API)
- [x] Checkout + Callback API routes
- [x] صفحات موفق/ناموفق
- [x] Feature flag فعال روی VPS
- [x] **اتصال دکمه خرید در صفحه pricing به checkout API**
- [x] **صفحه checkout/[id] — نمایش اطلاعات سفارش + دکمه پرداخت**
- [x] **صفحه subscription — مدیریت اشتراک کاربر**
- [x] **وب‌هوک تأیید پرداخت با HMAC**
- [x] **محدودیت رایگان: ۱۰ استفاده روزانه بدون پلن**
- [x] **بعد از پرداخت: پلن فعال + usage limit نامحدود**

### ۲.۲ محتوای وبلاگ — **تکمیل‌شده ✅**

**۵۱ مقاله باکیفیت** — استاندارد Medium / dev.to / Vercel Blog

- [x] مقالات مالی (۱۵+): حقوق، مالیات، مهریه، چک برگشتی، استخدام، VAT
- [x] مقالات PDF (۵+): راهنمای جامع ابزارهای PDF
- [x] مقالات متنی (۵+): case converter, text tools, resume builder
- [x] مقالات تاریخ (۳+): تبدیل تاریخ شمسی/میلادی
- [x] مقالات اعتبارسنجی (۳+): کد ملی، شماره کارت، شبا
- [x] مقالات امنیتی (۳+): hash, base64, password security
- [x] مقالات تصویری (۳+): background remover, OCR
- [x] مقالات عمومی (۱۰+): SEO, QR code, investment, retirement

### ۲.۳ صفحه قیمت‌گذاری — **تکمیل‌شده ✅**

- [x] **اتصال دکمه‌های خرید به checkout API**
- [x] **toggle ماهانه/سالانه با نمایش صرفه‌جویی**
- [x] **۳ پلن: رایگان / پایه / حرفه‌ای**
- [x] **جدول مقایسه ویژگی‌ها**
- [x] **صفحه subscription — مدیریت اشتراک کاربر**
- [x] **محدودیت usage برای کاربران رایگان**

### ۲.۴ امنیت و تست — **تکمیل‌شده ✅**

- [x] **تست‌های ترکیبی: ۸۰ Vitest + 22 Playwright E2E + 27 security**
- [x] ** Harden admin panel — رفع ۷ باگ بحرانی**
- [x] **آپدیت Husky hooks برای v9**
- [x] **رفع خطای Turbopack build**
- [x] **حذف مسیر duplicate /subscription**
- [x] **SSH hardening: key-only, fail2ban, UFW**

### ۲.۵ لوگو و برندینگ — **تکمیل‌شده ✅**

- [x] **مونوگرام PT SVG — تم روشن (سرمه‌ای)**
- [x] **مونوگرام PT SVG — تم تیره (سفید)**
- [x] **آیکون‌های PNG: favicon, apple-touch, android-chrome**
- [x] **آپدیت manifest.webmanifest با آیکون‌های جدید**
- [x] **آپدیت Navigation برای استفاده از icon.svg**

---

## فاز ۳ — رشد 🚀 (v7.0.0+)

### ۳.۱ CDN و عملکرد — **اولویت P0**

- [ ] انتقال به دامنه .com
- [ ] تنظیم Cloudflare
- [ ] Edge caching
- [ ] بهینه‌سازی bundle size (tree shaking, code splitting)
- [ ] Service Worker caching strategy
- [ ] Image optimization (WebP/AVIF, lazy loading)

### ۳.۲ SEO و محتوا — **اولویت P0**

- [ ] **Google AdSense** (در انتظار تأیید)
- [ ] **Blog pillar pages** برای هر دسته‌بندی
- [ ] **Internal linking strategy** — لینک‌دهی هوشمند بین مقالات
- [ ] **Schema markup** — FAQ, HowTo, BreadcrumbList در تمام صفحات
- [ ] **Sitemap optimization** — priority, changefreq
- [ ] **Core Web Vitals** — LCP < 2.5s, FID < 100ms, CLS < 0.1
- [ ] **Blog series** — مقالات مرتبط در سری‌ها

### ۳.۳ اکوسیستم — **اولویت P1**

- [ ] **API مستند** برای توسعه‌دهندگان (OpenAPI/Swagger)
- [ ] **Chrome Extension** — بهبود و انتشار در Chrome Web Store
- [ ] **Telegram Bot** — بهبود و انتشار
- [ ] **Widget** برای وب‌سایت‌های دیگر
- [ ] **PWA enhancements** — offline mode, push notifications

### ۳.۴ مقیاس‌پذیری — **اولویت P1**

- [ ] **Redis cluster** برای caching
- [ ] **Background job queue** (BullMQ)
- [ ] **Monitoring dashboard** (Grafana + Prometheus)
- [ ] **Error tracking** (Sentry integration)
- [ ] **Analytics dashboard** (admin panel)

### ۳.۵ کیفیت کد — **اولویت P1**

- [ ] **AccountPage decomposition** (~900 lines → smaller components)
- [ ] **RTL migration** — logical properties project-wide
- [ ] **Test coverage** — increase to 90%+
- [ ] **TypeScript strict mode** — full strict
- [ ] **ESLint rules** — additional rules for quality

### ۳.۶ محتوای جدید — **اولویت P2**

- [ ] **Video tutorials** برای ابزارهای محبوب
- [ ] **Interactive guides** — مراحل استفاده از ابزارها
- [ ] **Case studies** — نمونه‌های عملی استفاده
- [ ] **API documentation** — راهنمای توسعه‌دهندگان

### ۳.۷ بین‌المللی‌سازی — **اولویت P2**

- [ ] **Multi-language** — English, Arabic, Turkish
- [ ] **Localization** — اعداد، تاریخ، ارز
- [ ] **Regional pricing** — قیمت‌گذاری بر اساس منطقه

---

## قوانین توسعه

1. **کیفیت > تعداد** — ۱۰ مقاله غنی > ۱۰۰ مقاله الکی
2. **هر مقاله باید در حد Medium/dev.to باشد**
3. **typecheck + lint + test قبل از هر deploy**
4. **RTL و Dark Mode** — در تمام کامپوننت‌ها
5. **پردازش محلی** — تمام ابزارها در مرورگر
6. **SEO first** — metadata, OG, JSON-LD
7. **امنیت** — SSH key-only, rate limiting, CSRF
8. **اتوماسیون** — Python scripts برای backup, deploy
9. **One AT A TIME** — هر تغییر production-ready باشد
10. **No auto-deploy** — بدون تأیید کاربر deploy نکن

---

## معیارهای موفقیت

| شاخص            | هدف ۳ ماهه     | هدف ۶ ماهه      | هدف ۱۲ ماهه     |
| --------------- | -------------- | --------------- | --------------- |
| مقالات بلاگ     | ۷۰+            | ۱۰۰+            | ۲۰۰+            |
| تست‌ها          | ۶۰۰+           | ۸۰۰+            | ۱۰۰۰+           |
| صفحات SSG       | ۳۰۰+           | ۴۰۰+            | ۵۰۰+            |
| کاربران فعال    | ۱,۰۰۰+         | ۵,۰۰۰+          | ۲۰,۰۰۰+         |
| درآمد ماهانه    | ۵ میلیون تومان | ۲۰ میلیون تومان | ۵۰ میلیون تومان |
| Core Web Vitals | Good           | Good            | Good            |

---

## یادداشت‌های فنی

### پرداخت

- Zarinpal v4 API فعال
- Merchant ID: تنظیم شده روی VPS
- Feature flag: FEATURE_CHECKOUT_ENABLED=true
- Callback: /api/subscription/confirm (GET + POST)
- Webhook: /api/subscription/webhook (HMAC verified)

### اشتراک

- ۴ پلن: basic-monthly, basic-yearly, pro-monthly, pro-yearly
- قیمت‌ها: ۹۹K/۸۹۰K (پایه), ۱۹۹K/۱۷۹۰K (حرفه‌ای)
- محدودیت رایگان: ۱۰ استفاده ابزار در روز
- Entitlements: financial_scenarios, reports, pdf, ai

### تست

- Vitest: ۵۴۱ تست (111 فایل)
- Playwright: ۲۲ تست E2E
- Security: ۲۷ تست امنیتی
- Coverage thresholds: 85/85/80/85

### استقرار

- PM2 + standalone Next.js
- PostgreSQL (localhost:5432)
- Redis (optional, REDIS_URL)
- Nginx cache (pages 10min, API 1min, static 30d)
- Daily backups (3 AM cron)
