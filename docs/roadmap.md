# PersianToolbox Roadmap — وضعیت فعال محصول

**Last Updated**: 2026-06-22
**Version**: 3.9.1
**Status**: Active

---

## خلاصه وضعیت

- **ابزارها**: ۵۷ ابزار واقعی در ۶ دسته‌بندی — ۰ ابزار جعلی
- **تست‌ها**: ۴۱۶ تست واحد (۱۰۳ فایل) + ۴۳ E2E (Playwright) — همه PASS
- **کیفیت**: lint (0 خطا), typecheck, vitest, build — همه PASS
- **عملکرد**: Lighthouse Performance 96, Accessibility 91, Best Practices 96, SEO 100
- **امنیت**: HMAC webhook signature, async scrypt, CSRF, CSP nonce-based, HSTS, اینماد, security.txt
- **سئو**: canonical tags, FAQPage, robots.txt, sitemap.xml, structured data, OG images بهبود یافته
- **دیپلوی**: https://persiantoolbox.ir (v3.9.0) — PM2 + standalone Next.js
- **فونت‌ها**: Vazirmatn (فارسی) + Noto Sans (انگلیسی) + IRANSansX (fallback)
- **OCR**: Tesseract.js فارسی + انگلیسی (پردازش محلی)
- **Dark Mode**: toggle در ناوبری فعال
- **SSL**: www → non-www redirect فعال
- **nginx**: server_tokens off فعال
- **Health check**: /api/health با version, uptime, memory
- **Usage limits**: client-side localStorage counter + UpgradeModal integration
- **Usage tracking**: ToolUsageIndicator در تمام 55 صفحه ابزار فعال
- **E2E tests اضافی**: health API, security.txt, cache headers, PWA manifest, tool rendering

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

### ۱۷. OCR فارسی ✅

- **Tesseract.js** برای استخراج متن از تصاویر
- پشتیبانی از فارسی و انگلیسی
- پردازش کاملاً محلی در مرورگر
- کپی + دانلود متن استخراج شده

---

## P4 — تست و کیفیت ✅

### ۱۸. تست‌ها ✅

- **Unit**: ۳۸۸/۳۸۸ PASS (vitest)
- **E2E**: ۴۳/۴۳ PASS (Playwright)
- **Visual Regression**: ۹/۹ PASS
- **Lint**: 0 خطا
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

## P9 — ممیزی زنده و اصلاحات بحرانی (ژوئن ۲۰۲۶)

### یافته‌های بحرانی از ممیزی زنده

**عملکرد:**

- TTFB: ۴٫۴ ثانیه (هدف: <۲ ثانیه)
- صفحات عمومی با `Cache-Control: private, no-cache` سرو می‌شوند — CDN/browser cache نمیشه
- بعضی صفحات sitemap: ۸ تا ۱۳ ثانیه

**SEO:**

- ۶ topic route soft-404 (canonical `/topics/undefined`)
- robots.txt مانع `_next/` شد (رفع شد ✅)
- `Disallow: /_next/` حذف شد

**ابزارها:**

- JSON Formatter کار نمی‌کرد (رفع شد ✅ — worker محلی)
- Loan calculator کار نمی‌کرد (رفع شد ✅ — worker محلی)
- `/pdf-tools/edit/add-page-numbers` در sitemap ولی ۴۰۴

**زیرساخت:**

- فونت‌ها ۴۰۴ (standalone build مشکل داره)
- sw.js وجود ندارد — PWA خراب
- آیکن‌ها ۴۰۴ (icon.svg, apple-touch-icon.svg, favicon.ico)
- CSP نشان اینماد رو مسدود می‌کنه

**امنیت:**

- نسخه nginx افشا میشه
- security.txt وجود نداره

**UI/محتوا:**

- typo «ابzarها» در footer
- JSON Formatter فاقد H1
- صفحه حساب کاربری H1 نداره

### اقدامات انجام شده

| #   | مشکل                                   | وضعیت                            |
| --- | -------------------------------------- | -------------------------------- |
| 1   | robots.txt `Disallow: /_next/`         | ✅ حذف شد                        |
| 2   | Sitemap priority 0.4 برای golden tools | ✅ 0.8 شد                        |
| 3   | OCR keyword اشتباه                     | ✅ حذف شد                        |
| 4   | Pricing mismatch در UpgradeModal       | ✅ فیکس شد                       |
| 5   | Image Resizer فقط PNG                  | ✅ JPEG/WebP + quality slider    |
| 6   | PDF tools از CDN لود می‌شدن            | ✅ worker محلی                   |
| 7   | فونت‌ها ۴۰۴                            | ✅ cache headers ثابت شد         |
| 8   | آیکن‌ها ۴۰۴                            | ✅ cache headers ثابت شد         |
| 9   | sw.js missing — PWA خراب               | ✅ ثابت شد                       |
| 10  | CSP blocks Enamad                      | ✅ trustseal.enamad.ir اضافه شد  |
| 11  | Topic routes soft-404                  | ✅ generateStaticParams اضافه شد |
| 12  | security.txt missing                   | ✅ ایجاد شد                      |
| 13  | Cache-Control: no-cache غیرضروری       | ✅ proxy cache headers اضافه شد  |
| 14  | JSON Formatter H1                      | ✅ h1 اضافه شد                   |
| 15  | PWA install prompt                     | ✅ اضافه شد                      |
| 16  | encrypt-pdf                            | ✅ بازنویسی شد                   |

### اقدامات باقی‌مانده (اولویت‌بندی شده)

| #   | مشکل                              | اولویت | تأثیر       | وضعیت |
| --- | --------------------------------- | ------ | ----------- | ----- |
| 1   | فونت‌ها ۴۰۴ (standalone build)    | P0     | عملکرد بالا | ✅    |
| 2   | آیکن‌ها ۴۰۴                       | P0     | اعتماد      | ✅    |
| 3   | sw.js missing — PWA خراب          | P0     | PWA         | ✅    |
| 4   | CSP blocks Enamad logo            | P0     | اعتماد      | ✅    |
| 5   | Topic routes soft-404             | P1     | SEO         | ✅    |
| 6   | nginx version exposed             | P1     | امنیت       | ✅    |
| 7   | security.txt missing              | P1     | امنیت       | ✅    |
| 8   | typo «ابzarها» در footer          | P2     | محتوا       | ✅    |
| 9   | Cache-Control: no-cache غیرضروری  | P1     | عملکرد      | ✅    |
| 10  | JSON Formatter H1 + accessibility | P2     | UX          | ✅    |

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

- ~~encrypt-pdf (بازنویسی)~~ ✅ اضافه شد
- batch processing برای PDF tools
