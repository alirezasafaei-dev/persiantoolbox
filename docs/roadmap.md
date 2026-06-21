# PersianToolbox Roadmap — وضعیت فعال محصول

**Last Updated**: 2026-06-21
**Version**: 3.5.0
**Status**: Active

---

## خلاصه وضعیت

- **ابزارها**: ۵۱ ابزار واقعی در ۶ دسته‌بندی — ۰ ابزار جعلی
- **تست‌ها**: ۳۸۱ تست واحد (۹۷ فایل) + ۷۱ E2E (Playwright) — همه PASS
- **کیفیت**: lint (0 خطا), typecheck, vitest, build — همه PASS
- **عملکرد**: Lighthouse Performance 96, Accessibility 91, Best Practices 96, SEO 100
- **امنیت**: HMAC webhook signature, async scrypt, CSRF, CSP nonce-based, HSTS
- **سئو**: canonical tags, FAQPage, robots.txt, sitemap.xml, structured data
- **دیپلوی**: https://persiantoolbox.ir (v3.5.0) — PM2 + standalone Next.js
- **Market Data**: CoinGecko + exchangerate-api (داده واقعی)
- **Dark Mode**: toggle در ناوبری فعال

---

## P1 — تکمیل فیچرهای پایه ✅

### ۱. احراز هویت (auth) ✅

- API لاگین/لاگاوت/رجیستر/me
- Session management با PostgreSQL
- CSRF protection
- Rate limiting (5 تلاش/۱۵ دقیقه)
- **امنیت**: async scrypt برای هش رمز عبور (غیرblocking)

### ۲. حساب کاربری (account) ✅

- صفحه account با فرم ورود/ثبت‌نام
- نمایش اطلاعات کاربر و وضعیت اشتراک
- انتخاب طرح و checkout

### ۳. اشتراک‌ها (subscription) ✅

- API route‌ها: checkout, confirm, status, webhook
- **امنیت**: Webhook با HMAC signature verification (نه isSameOrigin)
- CSRF protection در checkout
- Feature flag guard در checkout

### ۴. طرح‌های اشتراک (plans) ✅

- ۴ طرح: basic_monthly, basic_yearly, pro_monthly, pro_yearly
- Premium page از SUBSCRIPTION_PLANS واقعی استفاده می‌کنه (نه hardcoded)

### ۵. تسویه (checkout) ✅

- صفحه checkout واقعی
- اتصال به سیستم پرداخت
- Runtime/dynamic exports

### ۶. داشبورد (dashboard) ✅

- پنل اپراتوری با داده‌های واقعی
- Auto-refresh هر ۳۰ ثانیه

---

## P2 — پریمیوم و تبلیغات ✅

### ۷. شفافیت تبلیغات (ads) ✅

### ۸. پنل ادمین تنظیمات (admin-site-settings) ✅

### ۹. پنل ادمین درآمدزایی (admin-monetization) ✅

### ۱۰. صفحه Premium ✅

- بازنویسی با SUBSCRIPTION_PLANS واقعی
- Design system tokens (نه inline CSS)
- Client component با checkout واقعی

---

## P3 — توسعه‌دهندگان و ابزارها ✅

### ۱۱. راهنمای توسعه‌دهندگان (developers) ✅

### ۱۲. ابزارهای PDF ✅ (۱۶ ابزار واقعی)

- ادغام، تقسیم، فشرده‌سازی، تبدیل، استخراج، واترمارک
- **حذف شد**: pdf-to-excel, add-header-footer, add-page-numbers (edit), flatten-pdf, crop-pdf — همه stub بودن
- **بازنویسی**: QR Code با پردازش کاملاً محلی (حذف API خارجی)

### ۱۳. ابزارهای تصویر ✅ (۵ ابزار واقعی)

- **بازنویسی**: image-format-converter با Canvas API واقعی (JPG/PNG/WebP)
- **جایگزین**: image-background-remover → image-crop با نسبت‌های پیش‌فرض
- rotate-image, resize-image, text-on-image — واقعی با Canvas API

### ۱۴. ابزارهای مالی ✅ (۱۹ ابزار)

- وام، حقوق، سود بانکی، اضافه‌کاری، سنوات، مرخصی، بیمه، عیدانه
- مالیات، مقایسه بانک‌ها، هزینه زندگی، مبدل ارز
- **جدید**: قدرت خرید واقعی، اضافه‌کاری، اجاره/خرید، وام/سرمایه‌گذاری، بازنشستگی

### ۱۵. ابزارهای متنی ✅ (۶ ابزار)

- شمارش کلمات، تبدیل اعداد، حذف فاصله، تبدیل case، استخراج اطلاعات، تبدیل آدرس

### ۱۶. ابزارهای تاریخ ✅ (۴ ابزار)

- شمسی-میلادی، اختلاف تاریخ، تقویم فارسی، یادآوری رویدادها

---

## P4 — تست و کیفیت ✅

### ۱۷. تست‌ها ✅

- **Unit**: ۳۸۱/۳۸۱ PASS (vitest)
- **E2E**: ۷۱/۷۱ PASS (Playwright)
- **Visual Regression**: ۹/۹ PASS
- **Lint**: 0 خطا, 33 هشدار
- **Typecheck**: PASS

### ۱۸. Lighthouse ✅

- Performance: **96** (از 73 بهبود یافت)
- LCP: **1.4s** (از 5.6s بهبود یافت)
- TBT: **0ms** (از 300ms بهبود یافت)
- SEO: **100**
- Accessibility: **91**
- Best Practices: **96**

---

## P5 — دیپلوی و زیرساخت ✅

### ۱۹. دیپلوی VPS ✅

- `.env.production` با تمام feature flags
- PM2 + standalone Next.js
- تمام مسیرها HTTP 200
- Cache headers: `/_next/static/` immutable

### ۲۰. امنیت ✅

- **Webhook**: HMAC signature verification (نه isSameOrigin)
- **Checkout**: CSRF protection + isFeatureEnabled guard
- **Password hashing**: async scrypt (غیرblocking)
- CSP nonce-based, HSTS, COOP, CORP, Permissions-Policy
- Runtime/dynamic exports در تمام API routes

### ۲۱. Service Worker ✅

- Cache invalidation, shell assets

---

## P6 — سئو ✅

### ۲۲. سئو ✅

- Structured data (JSON-LD): Organization, WebSite, SoftwareApplication, FAQPage, CollectionPage
- canonical tags, sitemap.xml, robots.txt
- noindex صفحه جستجو
- www → non-www redirect
- OpenGraph + Twitter Card metadata

---

## P7 — تمیزکاری و مستندات ✅

### ۲۳. پاکسازی کد مرده ✅

- ۷ ابزار جعلی حذف شد (setTimeout stubs)
- dead code "به‌زودی" حذف شد
- manifest.webmanifest conflict حل شد

### ۲۴. مستندات ✅

- roadmap.md بروزرسانی شد
- v3.4.0 + v3.5.0 changelog اضافه شد

---

## P8 — توسعه هاب مالی ✅

### فاز ۱ — MVP ✅

- Dashboard بازار (فقط-خواندنی)
- نرخ ارز + طلا/سکه + crypto (CoinGecko + exchangerate-api)
- Investment return simulator
- data freshness UX

### فاز ۲ — Insight Layer ✅

- historical comparison
- compare against inflation
- preset scenarios + saved local scenarios

### فاز ۳ — User Layer (مشروط)

- [ ] watchlist, price alerts, portfolio tracking

---

## چیزهایی که هنوز نیاز به کار دارد (آینده)

### پرداخت واقعی

- اتصال به درگاه پرداخت واقعی (Zarinpal merchant ID تنظیم نشده)
- فعال‌سازی درگاه‌های idpay/nextpay (الان mock adapter دارن)

### بهبودهای UI

- PWA install prompt
- بهبود آیکون‌های OG (متنی → طراحی‌شده)

### زیرساخت

- Redis برای rate limiting
- CDN برای static assets
- Monitoring و alerting

### ابزارهای جدید

- encrypt-pdf (بازنویسی)
- batch processing برای PDF tools
