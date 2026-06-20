# PersianToolbox Roadmap — وضعیت فعال محصول

**Last Updated**: 2026-06-20
**Version**: 3.4.0
**Status**: Active

---

## خلاصه وضعیت

- **ابزارها**: ۴۱+ ابزار فعال در ۶ دسته‌بندی
- **تست‌ها**: ۳۶۶ تست واحد (۹۶ فایل تست)
- **کیفیت**: lint (0 خطا), typecheck, vitest (366/366), build — همه PASS
- **امنیت**: CSP nonce-based, HSTS, COOP, CORP, Permissions-Policy
- **سئو**: canonical tags, BreadcrumbList, FAQPage, robots.txt, sitemap.xml
- **دیپلوی**: https://persiantoolbox.ir (v3.4.0)
- **canonical host**: www → non-www 301 redirect فعال
- **Market Data**: CoinGecko + exchangerate-api (live data)

### تصمیم محصولی جدید

- PersianToolbox **نباید** به یک محصول مالی مستقل یا پلتفرم معامله‌گری تبدیل شود.
- PersianToolbox **باید** هاب مالی موجود خود را با ابزارهای market-aware، read-only و SEO-friendly تقویت کند.
- سند مرجع این تصمیم: `docs/technical/01-Architecture/05-finance-market-data-strategy.md`

### v3.4.0 Changelog

- فعال‌سازی کامل feature flags: subscription, plans, checkout, dashboard, admin-monetization, history
- Market API: جایگزینی hardcoded placeholder با CoinGecko + exchangerate-api (داده واقعی)
- حذف dead code "به‌زودی" از PdfToolsPage
- رفع 40 خطای lint (trailing spaces, prefer-template, nullish coalescing, curly braces)
- سازگاری shared payments package با strict TypeScript (VPS)
- آپدیت مستندات و roadmap

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
- صفحه checkout با نمایش وضعیت پرداخت
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

- ۳۶۶/۳۶۶ تست رد شد
- lint بدون خطا (0 error, 33 warnings)
- typecheck بدون خطا
- build موفق

---

## P5 — دیپلوی و زیرساخت

### 13. دیپلوی VPS ✅

- `.env.production` با تمام feature flags فعال
- PM2 ریستارت شد (v3.4.0)
- تمام مسیرها HTTP 200
- Market API: CoinGecko + exchangerate-api (داده واقعی)

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

## P6 — سئو و بهینه‌سازی (v3.3.0)

### 16. رفع باگ i18n ✅

- `محاسبه差异 تاریخ` → `محاسبه اختلاف تاریخ` (title, H1, breadcrumb, keywords)

### 17. حذف breadcrumb تکراری ✅

- حذف از ۱۶ کامپوننت (ToolsRouteShell خودکار تولید می‌کند)

### 18. noindex صفحه جستجو ✅

- `robots: { index: false, follow: true }` به metadata
- حذف `/search` از sitemap
- اضافه شدن `/search?` به robots.txt disallow

### 19. canonical host ✅

- www → non-www 301 redirect در nginx
- `NEXT_PUBLIC_SITE_URL=https://persiantoolbox.ir`

### 20. تست‌های SEO ✅

- ۱۶ تست جامع: sitemap, robots.txt, buildMetadata, tools-registry i18n

### 21. صفحه checkout ✅

- جایگزین stub با صفحه واقعی وضعیت پرداخت

### 22. پاکسازی متن "به‌زودی" ✅

- حذف از admin site-settings hint
- حذف dead code "coming-soon" از PdfToolsPage
- حذف `status` field از PdfToolItem type

---

## P7 — تمیزکاری و مستندات

### 23. پاکسازی کد مرده ✅

- ۳۰ فایل حذف شد (~۶۱۳۱ خط)
- agent automation stubs
- duplicate modules
- unused business logic

### 24. بروزرسانی مستندات ✅

- roadmap.md بروزرسانی شد
- deploy scripts بروزرسانی شد

---

## P8 — توسعه هاب مالی موجود (پیشنهادی)

### چرا این بخش باید وجود داشته باشد

- هاب مالی از قبل بخشی از هویت محصول است و fit طبیعی با PersianToolbox دارد.
- queryهای مالی فارسی می‌توانند هم **SEO traffic** و هم **repeat visits** بسازند.
- توسعه این بخش باعث تقویت use caseهای فعلی مثل وام، حقوق، سود بانکی و سرمایه‌گذاری می‌شود.
- رویکرد درست، توسعه **هاب فعلی `/tools`** است؛ نه ساخت یک محصول مستقل.

### چرا باید incremental اجرا شود

- داده‌های بازار maintenance و risk بیشتری نسبت به calculatorهای کاملاً local دارند.
- قبل از account, alert, portfolio باید ارزش snapshot و historical simulator اثبات شود.
- phase‌بندی باعث کنترل cost, ops burden و scope creep می‌شود.

### فاز ۱ — MVP: Market-Aware Decision Tools ✅

- [x] Dashboard فقط-خواندنی برای snapshot بازار
- [x] نمایش نرخ ارزهای اصلی + طلا/سکه + چند crypto اصلی
- [x] Historical investment return simulator
- [x] نمودارهای ساده با بازه‌های محدود
- [x] data freshness UX: source, updatedAt, stale state
- [x] landing pageهای SEO برای use caseهای اصلی

**خارج از MVP**

- [ ] بدون حساب کاربری اجباری
- [ ] بدون price alert
- [ ] بدون portfolio tracking
- [ ] بدون realtime websocket

### فاز ۲ — Insight Layer ✅

- [x] historical comparison بین چند دارایی
- [x] compare against inflation
- [x] advanced lightweight charts (bar chart visualization)
- [x] preset scenarios
- [x] saved local scenarios در مرورگر

### فاز ۳ — User Layer (مشروط)

- [ ] watchlist
- [ ] price alerts
- [ ] account sync
- [ ] portfolio tracking
- [ ] notification delivery

**شرط شروع فاز ۳**

- retention قابل اندازه‌گیری
- data operations پایدار
- cost model روشن
- نیاز واقعی کاربر

### راهبرد فنی فشرده

- Data access فقط از same-origin API
- الگوی DataHub برای snapshot و history
- cache با last-known-good data
- background jobs برای refresh دوره‌ای
- rate limiting برای data endpoints
- schema و metadata مناسب برای hub/tool pages
- disclaimer شفاف: decision-support, not financial advice

---

## چیزهایی که هنوز نیاز به کار دارد (آینده)

### پرداخت واقعی

- اتصال به درگاه پرداخت واقعی (Zarinpal merchant ID تنظیم نشده)
- ذخیره‌سازی اشتراک در PostgreSQL (نه in-memory)

### بهبودهای UI

- بهینه‌سازی کش مرورگر برای کاربران جدید
- PWA install prompt
- Dark mode toggle در ناوبری

### زیرساخت

- Redis برای rate limiting (جایگزین in-memory)
- CDN برای static assets
- Monitoring و alerting

### ابزارهای جدید (v3.5+)

- encrypt-pdf (بازنویسی با محدودیت‌های مرورگر)
- batch processing برای PDF tools
