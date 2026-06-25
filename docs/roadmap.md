# PersianToolbox Roadmap — نقشه راه رشد و درآمدزایی

**Last Updated**: 2026-06-25
**Version**: 6.7.0
**Status**: Active — Growth Phase Complete

---

## هدف استراتژیک

> تبدیل PersianToolbox به **سایت شماره یک ابزارهای آنلاین فارسی** با **درآمد پایدار** از طریق ترافیک ارگانیک، تجربه کاربری برتر و مدل درآمدی چندگانه.

### KPIهای هدف

| شاخص              | هدف ۳ ماه | هدف ۶ ماه | هدف ۱۲ ماه |
| ----------------- | --------- | --------- | ---------- |
| بازدید روزانه     | ۵,۰۰۰     | ۱۵,۰۰۰    | ۵۰,۰۰۰     |
| صفحات ایندکس شده  | ۳۰۰       | ۵۰۰       | ۱۰۰۰       |
| نرخ تبدیل پریمیوم | ۱٪        | ۲٪        | ۳٪         |
| درآمد ماهانه      | ۵ میلیون  | ۱۵ میلیون | ۵۰ میلیون  |
| Core Web Vitals   | Pass      | Pass      | Pass       |

---

## خلاصه وضعیت فعلی

- **ابزارها**: ۷۶ ابزار واقعی در ۶ دسته‌بندی
- **بلاگ**: ۱۳ مقاله آموزشی (فقط محتوای باکیفیت ۲۰۰+ کلمه)
- **تست‌ها**: ۴۳۴ تست واحد — همه PASS
- **صفحات SSG**: ۲۲۱ صفحه
- **عملکرد**: Lighthouse 96, SEO 100, A11y 91
- **امنیت**: RBAC (admin/editor/user), HMAC, CSRF, CSP nonce
- **دیپلوی**: PM2 + standalone Next.js on VPS
- **Dark Mode**: بهبود یافته (تمام صفحات CSS variables)
- **Accessibility**: بهبود یافته (dialog roles, aria-labels فارسی)
- **Localization**: تمام متن‌های UI فارسی شد
- **ممیزی UX/UI**: ۲۰۲۶-۰۶-۲۵ — ۴ فاز بهبود شناسایی شد (ساختار، UX، دسترس‌پذیری، حکمرانی)

---

## P13 — ابزارهای پرتقاضا واقعی (v6.0.0)

> **اولویت: P0** — ابزارهایی که واقعاً ترافیک جذب می‌کنند و کاربران واقعی نیاز دارند

### ۴۱. QR Code سفارشی ✅ (قبلاً بازنویسی شده)

- تولید QR Code در مرورگر
- پشتیبانی از متن، URL، WiFi
- رنگ و لوگوی سفارشی
- دانلود PNG/SVG

### ۴۲. ابزار امضای آنلاین

- Canvas-based drawing
- ذخیره امضا به صورت PNG با پس‌زمینه شفاف
- اضافه کردن امضا به PDF
- پاک کردن و شروع مجدد

### ۴۳. مبدل PDF به Word واقعی

- استخراج متن از PDF با pdf.js
- تبدیل به فرمت Word (.docx) با docx.js
- حفظ ساختار پاراگراف
- پردازش کاملاً محلی

### ۴۴. ابزار حذف پس‌زمینه تصویر

- Web Worker برای پردازش سنگین
- الگوریتم GrabCut ساده
- خروجی PNG با شفافیت
- پیش‌نمایش زنده

---

## P14 — SEO فنی کامل (v6.1.0)

> **اولویت: P0** — رتبه گوگل مستقیماً از SEO فنی تأثیر می‌گیرد

### ۴۵. Breadcrumb schema سراسری

- اضافه کردن BreadcrumbList JSON-LD به تمام صفحات ابزار
- نمایش breadcrumb در UI
- ساختار: خانه → دسته‌بندی → ابزار

### ۴۶. FAQ schema برای تمام صفحات ابزار

- هر صفحه ابزار FAQ خود را دارد
- تبدیل به FAQPage JSON-LD
- Rich snippets در گوگل

### ۴۷. Internal linking خودکار

- در هر مقاله بلاگ، لینک به ابزارهای مرتبط
- در هر صفحه ابزار، لینک به مقالات مرتبط
- لینک به صفحات مقایسه

### ۴۸. OpenGraph image خودکار

- تولید OG image با رنگ و متن اختصاصی هر صفحه
- پشتیبانی Twitter Card
- ابعاد استاندارد 1200×630

---

## P15 — CTA و Conversion Optimization (v6.2.0)

> **اولویت: P0** — تبدیل بازدیدکننده به کاربر ثابت و پریمیوم

### ۴۹. CTA هوشمند در هر صفحه ابزار

- پس از ۳ بار استفاده → پیشنهاد ثبت‌نام
- پس از ۵ بار → پیشنهاد پریمیوم
- Banner غیرمزاحم با CTA واضح

### ۵۰. صفحه فرود هر دسته ابزار

- `/pdf-tools` صفحه فرود بهینه با meta اختصاصی
- `/image-tools` صفحه فرود بهینه
- `/text-tools` صفحه فرود بهینه
- هر صفحه شامل: معرفی + لیست ابزارها + FAQ + CTA

### ۵۱. Social proof نمایشی

- "X نفر امروز از این ابزار استفاده کردند" (شمارنده واقعی)
- badges اعتماد (حریم خصوصی، رایگان، سریع)
- نمایش تعداد ابزارها در صفحه اصلی

### ۵۲. Exit intent CTA

- هنگام خروج کاربر → پاپ‌آپ غیرمزاحم
- "ابزارهای بیشتر را کشف کنید"
- لینک به بلاگ یا ابزارهای محبوب

---

## P16 — Performance و Core Web Vitals (v6.3.0)

> **اولویت: P1** — Core Web Vitals مستقیماً روی رتبه گوگل تأثیر می‌گذارد

### ۵۳. Image optimization خودکار

- WebP/AVIF fallback
- Responsive images با srcset
- Lazy loading برای تصاویر زیر fold
- Blur placeholder

### ۵۴. JavaScript code splitting

- Lazy load هر ابزار فقط وقتی کاربر نیاز دارد
- Dynamic import برای کامپوننت‌های سنگین
- Prefetch صفحات بعدی محتمل

### ۵۵. Font optimization

- Font subsetting برای فارسی
- font-display: swap
- Preload فونت اصلی

### ۵۶. Cache strategy

- Service Worker cache برای static assets
- stale-while-revalidate برای API
- Cache-Control headers بهینه

---

## P17 — نگه‌داشت کاربر (v6.4.0)

> **اولویت: P1** — کاربر برگشتی ۱۰ برابر ارزشمندتر از کاربر جدید است

### ۵۷. ذخیره سناریوهای مالی

- کاربر سناریوهای محاسبه حقوق/وام را ذخیره کند
- مقایسه چند سناریو با هم
- ذخیره در localStorage + امکان export

### ۵۸. اشتراک‌گذاری نتایج

- لینک اشتراک‌گذاری برای هر نتیجه
- OG image اختصاصی برای هر لینک اشتراک
- پیش‌نمایش زیبا در شبکه‌های اجتماعی

### ۵۹. اعلان‌های push

- اعلان ابزار جدید
- یادآوری استفاده از ابزار محبوب
- اخبار بروزرسانی قوانین مالی

### ۶۰. سیستم امتیاز و badges

- امتیاز برای هر بار استفاده
- badges: مبتدی، حرفه‌ای، متخصص
- رتبه‌بندی هفتگی

---

## P18 — درآمدزایی (منتظر زرین‌پال)

> **اولویت: P0** — فقط با تأیید درگاه پرداخت

### ۶۱. درگاه پرداخت واقعی

- Zarinpal merchant ID → فعال‌سازی
- تست sandbox → production
- webhook با HMAC verification
- صفحه موفق/ناموفق

### ۶۲. Plan پریمیوم واقعی

- Free: ۱۰ استفاده روزانه
- Pro: نامحدود + batch processing
- Enterprise: API + White-label

### ۶۳. تبلیغات هوشمند

- Google AdSense (منتظر تأیید)
- Banner در صفحات پرتقاضا
- AdSlot component موجود → فعال‌سازی

---

## P19 — زیرساخت و عملکرد (v7.0.0)

> **اولویت: P2** — برای مقیاس بزرگ ضروری

### ۶۴. Redis

- Rate limiting واقعی
- Cache برای API responses
- Session management

### ۶۵. CDN

- Cloudflare برای static assets
- Image optimization edge
- DDoS protection

### ۶۶. Monitoring

- Sentry برای error tracking
- Uptime monitoring
- Performance budget alerts

---

## P20 — اکوسیستم (v8.0.0+)

> **اولویت: P2** — بلندمدت

### ۶۷. Chrome Extension

- دسترسی سریع به ابزارها
- اشتراک‌گذاری صفحه فعلی

### ۶۸. Telegram Bot

- محاسبه سریع حقوق
- تبدیل تاریخ
- نرخ ارز

### ۶۹. API مستند

- REST API برای توسعه‌دهندگان
- مستندات Swagger/OpenAPI
- Rate limiting و API key

---

## وضعیت اجرا

### انجام شده ✅

| #   | آیتم                                                        | نسخه   | وضعیت |
| --- | ----------------------------------------------------------- | ------ | ----- |
| ۱   | سیستم بلاگ                                                  | v4.0.0 | ✅    |
| ۲   | Charts CSS-only                                             | v4.0.0 | ✅    |
| ۳   | RBAC (admin/editor/user)                                    | v4.0.0 | ✅    |
| ۴   | اشتراک تاریخچه API                                          | v4.1.0 | ✅    |
| ۵   | ۱۷ مقاله بلاگ                                               | v5.0.0 | ✅    |
| ۶   | صفحه مقایسه ابزارها                                         | v5.0.0 | ✅    |
| ۷   | صفحه Use Case                                               | v5.0.0 | ✅    |
| ۸   | رزومه‌ساز آنلاین                                            | v5.0.0 | ✅    |
| ۹   | Schema markup (HowTo, AggregateRating)                      | v5.0.0 | ✅    |
| ۱۰  | CTA صفحه اصلی بهبود یافته                                   | v5.0.0 | ✅    |
| ۱۱  | QR Code سفارشی                                              | v5.0.0 | ✅    |
| ۱۲  | ابزار امضای آنلاین                                          | v6.0.0 | ✅    |
| ۱۳  | Breadcrumb visible در UI                                    | v6.2.0 | ✅    |
| ۱۴  | Dark mode — تمام صفحات                                      | v6.2.0 | ✅    |
| ۱۵  | UpgradeModal accessibility                                  | v6.2.0 | ✅    |
| ۱۶  | متن‌های انگلیسی → فارسی                                     | v6.2.0 | ✅    |
| ۱۷  | Mobile menu حساب کاربری                                     | v6.2.0 | ✅    |
| ۱۸  | Footer لینک تلگرام + بلاگ                                   | v6.2.0 | ✅    |
| ۱۹  | Enamad seal alt text فارسی                                  | v6.2.0 | ✅    |
| ۲۰  | Payment pages SiteShell                                     | v6.2.0 | ✅    |
| ۲۱  | Dark mode hardcoded colors → CSS variables                  | v6.3.0 | ✅    |
| ۲۲  | Financial constants centralization                          | v6.3.0 | ✅    |
| ۲۳  | Blog → Tool internal linking (BlogToolCTA)                  | v6.3.0 | ✅    |
| ۲۴  | AggregateRating schema for tools                            | v6.3.0 | ✅    |
| ۲۵  | Footer reorganization (3 columns + trust signals)           | v6.3.0 | ✅    |
| ۲۶  | Mobile menu search link                                     | v6.3.0 | ✅    |
| ۲۷  | Homepage CTA + category quick-links                         | v6.3.0 | ✅    |
| ۲۸  | CSS dark mode documentation                                 | v6.3.0 | ✅    |
| ۲۹  | OG image tool count update                                  | v6.3.0 | ✅    |
| ۳۰  | Tax calculator brackets match salary laws                   | v6.3.0 | ✅    |
| ۳۱  | Tax calculator uses centralized constants                   | v6.3.0 | ✅    |
| ۳۳  | Insurance calculator base calculation fix                   | v6.3.0 | ✅    |
| ۳۴  | About page with tool links + contact                        | v6.3.0 | ✅    |
| ۳۵  | Tax calculator: fix double-exemption bug                    | v6.3.0 | ✅    |
| ۳۶  | Currency converter: Toman display + rounding                | v6.3.0 | ✅    |
| ۳۷  | Fix ugly hover underline on buttons/cards                   | v6.3.0 | ✅    |
| ۳۸  | De-index useless tools (bank-rate, living-cost, etc)        | v6.3.0 | ✅    |
| ۳۹  | Homepage rebuild (categories, newest, social proof)         | v6.3.0 | ✅    |
| ۴۰  | Support page: real help center (not donation)               | v6.3.0 | ✅    |
| ۴۱  | Footer: remove small icons                                  | v6.3.0 | ✅    |
| ۴۲  | Back button on all tool/category pages                      | v6.3.0 | ✅    |
| ۴۳  | Financial tools dashboard redesign                          | v6.3.0 | ✅    |
| ۴۴  | Payslip (فیش حقوقی) export                                  | v6.3.0 | ✅    |
| ۴۵  | Feedback survey component                                   | v6.3.0 | ✅    |
| ۴۶  | Topics page redesign with tool cards                        | v6.3.0 | ✅    |
| ۴۷  | Terms page expanded (5 sections)                            | v6.3.0 | ✅    |
| ۴۸  | CSRF proxy support (nginx reverse proxy)                    | v6.3.0 | ✅    |
| ۴۹  | Remove open-source developer section (private repo)         | v6.3.0 | ✅    |
| ۵۰  | PostgreSQL setup on VPS + ecosystem.config.js               | v6.3.0 | ✅    |
| ۵۱  | Deploy script updated for ecosystem config                  | v6.3.0 | ✅    |
| ۵۲  | PDF→Word converter (pdfjs-dist + docx)                      | v6.3.0 | ✅    |
| ۵۳  | حذف پس‌زمینه تصویر (@imgly/background-removal)              | v6.3.0 | ✅    |
| ۵۴  | OG image خودکار برای تمام صفحات ابزار                       | v6.3.0 | ✅    |
| ۵۵  | Performance: font preload, WebP/AVIF, cache headers         | v6.3.0 | ✅    |
| ۵۶  | Financial sub-tools merged into salary hub (7 tabs)         | v6.3.0 | ✅    |
| ۵۷  | Admin panel: social, contact, SEO, API key settings         | v6.3.0 | ✅    |
| ۵۸  | ذخیره سناریو + مقایسه + خروجی JSON/CSV                      | v6.4.0 | ✅    |
| ۵۹  | Smart CTA: ۳ استفاده→ثبت‌نام، ۵ استفاده→پریمیوم             | v6.4.0 | ✅    |
| ۶۰  | Exit intent popup: کشف ابزارهای بیشتر                       | v6.4.0 | ✅    |
| ۶۱  | Chrome Extension: دسترسی سریع به ابزارها                    | v6.4.0 | ✅    |
| ۶۲  | Telegram Bot: دسترسی سریع به ابزارها                        | v6.4.0 | ✅    |
| ۶۳  | A11y fixes: Persian aria-labels, image priority             | v6.4.0 | ✅    |
| ۶۴  | Blog: 4 مقاله جدید (PDF→Word, BG removal, ext, scenarios)   | v6.4.0 | ✅    |
| ۶۵  | FAQ schema سراسری برای تمام صفحات ابزار                     | v6.4.0 | ✅    |
| ۶۶  | Social proof: ابزار فعال + امتیازات کاربر                   | v6.4.0 | ✅    |
| ۶۷  | اشتراک‌گذاری نتایج (Web Share API + clipboard)              | v6.4.0 | ✅    |
| ۶۸  | سیستم امتیاز و badges (مبتدی تا استاد)                      | v6.4.0 | ✅    |
| ۶۹  | Dark mode fixes: 8 فایل مالی/ابزار                          | v6.4.0 | ✅    |
| ۷۰  | FAQ schema: 4 ابزار PDF اضافه شد                            | v6.4.0 | ✅    |
| ۷۱  | Blog: 6 مقاله جدید (مالی، PDF، تصویر، تقویم، ارز، مالیات)   | v6.4.0 | ✅    |
| ۷۲  | Admin dashboard: ابزارهای پربازدید + وضعیت سلامت            | v6.4.0 | ✅    |
| ۷۳  | Blog: 33 مقاله آموزشی SEO                                   | v6.4.0 | ✅    |
| ۷۴  | Dark mode fixes: 8 فایل مالی/ابزار                          | v6.4.0 | ✅    |
| ۷۵  | FAQ schema: 4 ابزار PDF اضافه شد                            | v6.4.0 | ✅    |
| ۷۶  | Blog: 60 مقاله آموزشی SEO (تمام ابزارها پوشش داده شد)       | v6.4.0 | ✅    |
| ۷۷  | Audit: version sync, API error handling, hardcoded URLs     | v6.4.0 | ✅    |
| ۷۸  | Lint: 28 errors auto-fixed                                  | v6.4.0 | ✅    |
| ۷۹  | E2E tests: 86/93 passed (7 timeout-only failures)           | v6.4.0 | ✅    |
| ۸۰  | Audit: 37 issues found and fixed                            | v6.4.0 | ✅    |
| ۸۱  | HowTo schema سراسری برای تمام صفحات ابزار                   | v6.4.0 | ✅    |
| ۸۲  | Scroll-to-top + ابزارهای سریع (FAB)                         | v6.4.0 | ✅    |
| ۸۳  | OG image برای ۴ ابزار باقی‌مانده                            | v6.4.0 | ✅    |
| ۸۴  | BreadcrumbList JSON-LD سراسری                               | v6.4.0 | ✅    |
| ۸۵  | Sitemap: ۵ صفحه جدید + homepage structured data             | v6.4.0 | ✅    |
| ۸۶  | SoftwareApplication JSON-LD سراسری                          | v6.4.0 | ✅    |
| ۸۷  | BlogPostSchema Article JSON-LD                              | v6.4.0 | ✅    |
| ۸۸  | Blog: 65 مقاله آموزشی SEO                                   | v6.4.0 | ✅    |
| ۸۹  | OfflineIndicator + mobile menu animation                    | v6.4.0 | ✅    |
| ۹۰  | Blog: 70 مقاله آموزشی SEO                                   | v6.4.0 | ✅    |
| ۹۱  | ItemList JSON-LD برای تمام صفحات دسته‌بندی                  | v6.4.0 | ✅    |
| ۹۲  | Blog: 75 مقاله آموزشی SEO                                   | v6.4.0 | ✅    |
| ۹۳  | Meta descriptions: ۸ صفحه بهبود یافته                       | v6.4.0 | ✅    |
| ۹۴  | Blog: 80 مقاله آموزشی SEO                                   | v6.4.0 | ✅    |
| ۹۵  | Accessibility: aria labels, tab IDs, live regions           | v6.4.0 | ✅    |
| ۹۶  | Admin analytics: date filter, charts, CSV export            | v6.4.0 | ✅    |
| ۹۷  | Admin tools: dynamic registry, search, bulk actions         | v6.4.0 | ✅    |
| ۹۸  | Account page: profile, usage stats, timeline, notifications | v6.4.0 | ✅    |
| ۹۹  | Admin audit log: API, page, sidebar integration             | v6.4.0 | ✅    |
| ۱۰۰ | Blog: 85 مقاله آموزشی SEO                                   | v6.4.0 | ✅    |
| ۱۰۱ | Admin dashboard: auto-refresh, health, charts, audit feed   | v6.4.0 | ✅    |
| ۱۰۲ | Blog: 90 مقاله آموزشی SEO                                   | v6.4.0 | ✅    |
| ۱۰۳ | Admin content editor: Markdown, preview, bulk, categories   | v6.4.0 | ✅    |
| ۱۰۴ | Blog: 95 مقاله آموزشی SEO                                   | v6.4.0 | ✅    |
| ۱۰۵ | Admin users: modal, roles, ban, usage, CSV, pagination      | v6.4.0 | ✅    |
| ۱۰۶ | Admin monetization: revenue, analytics, coupons             | v6.4.0 | ✅    |
| ۱۰۷ | Blog: 105 مقاله آموزشی SEO                                  | v6.4.0 | ✅    |
| ۱۰۸ | Admin ops: 7 tabbed sections (resources, logs, DB, etc)     | v6.4.0 | ✅    |
| ۱۰۹ | Blog: 115 مقاله آموزشی SEO                                  | v6.4.0 | ✅    |
| ۱۱۰ | Admin funnel: conversion, A/B, cohorts, revenue             | v6.4.0 | ✅    |
| ۱۱۱ | Blog: 125 مقاله آموزشی SEO                                  | v6.4.0 | ✅    |
| ۱۱۲ | Admin site settings: 7 new tabs                             | v6.4.0 | ✅    |
| ۱۱۳ | Blog: 135 مقاله آموزشی SEO                                  | v6.4.0 | ✅    |
| ۱۱۴ | Blog overhaul: cover images, TOC, search, pagination        | v6.4.0 | ✅    |
| ۱۱۵ | Blog overhaul: share buttons, reading time, author section  | v6.4.0 | ✅    |
| ۱۱۶ | Blog series, difficulty levels, bookmarks, reactions        | v6.4.0 | ✅    |
| ۱۱۷ | Blog print styles, bookmarks page                           | v6.4.0 | ✅    |

### در حال اجرا 🔄

| #   | آیتم | نسخه | وضعیت |
| --- | ---- | ---- | ----- |

### انجام شده (v6.5.0) ✅

| #   | آیتم                                                                                                                        | نسخه   | وضعیت |
| --- | --------------------------------------------------------------------------------------------------------------------------- | ------ | ----- |
| ۱۱۸ | حساب کاربری: UI مدرن تب‌بندی ورود/ثبت‌نام                                                                                   | v6.5.0 | ✅    |
| ۱۱۹ | Redis caching: rate limiting + session cache                                                                                | v6.5.0 | ✅    |
| ۱۲۰ | Nginx cache: static + pages + API                                                                                           | v6.5.0 | ✅    |
| ۱۲۱ | Push Notifications: VAPID + API + Service Worker                                                                            | v6.5.0 | ✅    |
| ۱۲۲ | محاسبه‌گر خسارت تأخیر تأدیه چک                                                                                              | v6.5.0 | ✅    |
| ۱۲۳ | محاسبه‌گر مالیات بر ارزش افزوده (VAT)                                                                                       | v6.5.0 | ✅    |
| ۱۲۴ | محاسبه‌گر مهریه به نرخ روز                                                                                                  | v6.5.0 | ✅    |
| ۱۲۵ | محاسبه‌گر حاشیه سود و قیمت‌گذاری                                                                                            | v6.5.0 | ✅    |
| ۱۲۶ | محاسبه‌گر هزینه واقعی استخدام                                                                                               | v6.5.0 | ✅    |
| ۱۲۷ | ۵ مقاله بلاگ SEO برای ابزارهای جدید مالی                                                                                    | v6.5.0 | ✅    |
| ۱۲۸ | Security: حذف passwordHash از /api/auth/me                                                                                  | v6.5.0 | ✅    |
| ۱۲۹ | مقاله بلاگ: ۵ مقاله برای ابزارهای جدید مالی                                                                                 | v6.5.0 | ✅    |
| ۱۳۰ | Audit: گزارش فنی کامل + ۵ رفع اولویت                                                                                        | v6.5.0 | ✅    |
| ۱۳۱ | Search: ابزارهای محبوب در حالت خالی                                                                                         | v6.5.0 | ✅    |
| ۱۳۲ | Finance: FinancialTransparencyBox component                                                                                 | v6.5.0 | ✅    |
| ۱۳۳ | Ops: اسکریپت بررسی آمادگی تولید                                                                                             | v6.5.0 | ✅    |
| ۱۳۴ | Tests: ۶ تست طلایی ابزارهای مالی                                                                                            | v6.5.0 | ✅    |
| ۱۳۵ | Premium: رفع باگ‌های پایه (Plan ID, Price, Usage)                                                                           | v6.5.0 | ✅    |
| ۱۳۶ | Premium: داشبورد مالی حرفه‌ای (Financial Dashboard)                                                                         | v6.5.0 | ✅    |
| ۱۳۷ | Premium: سیستم entitlements (رایگان/پریمیوم)                                                                                | v6.5.0 | ✅    |
| ۱۳۸ | Premium: Report Generator (PDF گزارش مالی/حقوقی)                                                                            | v6.5.0 | ✅    |
| ۱۳۹ | Premium: Invoice Generator (فاکتور و صورتحساب)                                                                              | v6.5.0 | ✅    |
| ۱۴۰ | Account: بج پریمیوم + اطلاعات پلن + دکمه ارتقا                                                                              | v6.5.0 | ✅    |
| ۱۴۱ | Account: لینک داشبورد مالی در پیوندهای سریع                                                                                 | v6.5.0 | ✅    |
| ۱۴۲ | Plans: جدول مقایسه ویژگی‌ها + بخش FAQ                                                                                       | v6.5.0 | ✅    |
| ۱۴۳ | Blog: ۵ مقاله جدید (داشبورد، فاکتور، گزارش، پریمیوم، حقوق)                                                                  | v6.5.0 | ✅    |
| ۱۴۴ | Premium: Legal Document Generator (۵ نوع سند حقوقی PDF)                                                                     | v6.5.0 | ✅    |
| ۱۴۵ | Blog: راهنمای سندساز حقوقی                                                                                                  | v6.5.0 | ✅    |
| ۱۴۶ | Blog: حذف ۶۸ مقاله عمومی بی‌کیفیت + اصلاح coverImage                                                                        | v6.5.0 | ✅    |
| ۱۴۷ | Lint: رفع تمام خطاهای lint (0 error)                                                                                        | v6.5.0 | ✅    |
| ۱۴۸ | SEO: باز کردن ۴ ابزار مخفی برای ایندکس گوگل                                                                                 | v6.5.0 | ✅    |
| ۱۴۹ | SEO: حذف ابزار تکراری page-numbers                                                                                          | v6.5.0 | ✅    |
| ۱۵۰ | Trust: جایگزینی شمارنده جعلی با آمار واقعی                                                                                  | v6.5.0 | ✅    |
| ۱۵۱ | UX: بهبود صفحه خطا با لینک ناوبری                                                                                           | v6.5.0 | ✅    |
| ۱۵۲ | Performance: اسکلت لودینگ با Skeleton UI                                                                                    | v6.5.0 | ✅    |
| ۱۵۳ | SEO: FAQ schema صفحه ابزارهای مالی                                                                                          | v6.5.0 | ✅    |
| ۱۵۴ | SEO: Noindex صفحات پریمیوم در robots.txt                                                                                    | v6.5.0 | ✅    |
| ۱۵۵ | SW: کش آفلاین API با 24 ساعت TTL                                                                                            | v6.5.0 | ✅    |
| ۱۵۶ | Observability: endpoint لاگ خطا با rate limiting                                                                            | v6.5.0 | ✅    |
| ۱۵۷ | PWA: فایل manifest.webmanifest برای نصب                                                                                     | v6.5.0 | ✅    |
| ۱۵۸ | SEO: Structured data صفحه مقایسه + راهنماها                                                                                 | v6.5.0 | ✅    |
| ۱۵۹ | SEO: BreadcrumbSchema برای ToolsRouteShell                                                                                  | v6.5.0 | ✅    |
| ۱۶۰ | Internal linking: ویجت ابزارهای پیشنهادی در BlogSidebar                                                                     | v6.5.0 | ✅    |
| ۱۶۱ | SEO: HowTo schema برای ۵ ابزار مالی                                                                                         | v6.5.0 | ✅    |
| ۱۶۲ | UX: استایل چاپ برای مقالات بلاگ                                                                                             | v6.5.0 | ✅    |
| ۱۶۳ | SEO: حذف ۶۵ مقاله کم‌کیفیت (زیر ۲۰۰ کلمه)                                                                                   | v6.5.0 | ✅    |
| ۱۶۴ | Performance: preconnect hint برای enamad.ir                                                                                 | v6.5.0 | ✅    |
| ۱۶۵ | SEO: BreadcrumbSchema برای /tools hub + /market sub-pages                                                                   | v6.5.0 | ✅    |
| ۱۶۶ | SEO: ItemList JSON-LD برای صفحه بازار                                                                                       | v6.5.0 | ✅    |
| ۱۶۷ | SEO: HowTo schema کامل برای تمام ۲۱ ابزار مالی                                                                              | v6.5.0 | ✅    |
| ۱۶۸ | A11y: اصلاح label-input در ۵ ماشین‌حساب (WCAG A)                                                                            | v6.5.0 | ✅    |
| ۱۶۹ | A11y: aria-live در ۱۰ نتیجه محاسبه + progressbar                                                                            | v6.5.0 | ✅    |
| ۱۷۰ | A11y: aria-pressed دکمه‌های toggle در VAT + حاشیه سود                                                                       | v6.5.0 | ✅    |
| ۱۷۱ | A11y: keyboard + table semantics در FinancialDashboard                                                                      | v6.5.0 | ✅    |
| ۱۷۲ | A11y: caption + scope در جداول SavedFinanceCalculations                                                                     | v6.5.0 | ✅    |
| ۱۷۳ | Trust: FinancialTransparencyBox برای ۹ ابزار مالی                                                                           | v6.5.0 | ✅    |
| ۱۷۴ | Localization: ترجمه رشته‌های انگلیسی Base64Tool, InvoiceGenerator                                                           | v6.5.0 | ✅    |
| ۱۷۵ | SEO: HowTo + BreadcrumbSchema برای تمام ابزارهای متنی (۶ صفحه)                                                              | v6.5.0 | ✅    |
| ۱۷۶ | SEO: HowTo + BreadcrumbSchema برای تمام ابزارهای تصویر (۵ صفحه)                                                             | v6.5.0 | ✅    |
| ۱۷۷ | SEO: HowTo + BreadcrumbSchema برای تمام ابزارهای تاریخ (۴ صفحه)                                                             | v6.5.0 | ✅    |
| ۱۷۸ | SEO: BreadcrumbSchema ابزارهای اعتبارسنجی + امضا + رزومه                                                                    | v6.5.0 | ✅    |
| ۱۷۹ | SEO: HowTo برای ابزارهای باقی‌مانده (base64, json, ocr, ...)                                                                | v6.5.0 | ✅    |
| ۱۸۰ | TypeScript: BreadcrumbItem.url optional fix                                                                                 | v6.5.0 | ✅    |
| ۱۸۱ | Homepage: ToolShowcase suggested tools + TrustStats 4-col grid + FAQ 7 items + blog year + SmartCTA welcome + dynamic tools | v6.5.0 | ✅    |
| ۱۸۲ | Admin: deterministic content stats + error handling on quick actions + auto-save real + funnel layout + user stats labels   | v6.5.0 | ✅    |
| ۱۸۳ | Sentry: @sentry/nextjs + client/server/edge configs + instrumentation.ts + global-error + CSP + tunnel route                | v6.5.0 | ✅    |

### انجام شده (سشن فرانت‌اند ۲۰۲۶-۰۶-۲۴) ✅

جزئیات کامل: `docs/audit/frontend-session-2026-06-24.md`

| آیتم                                                            | PR  | وضعیت |
| --------------------------------------------------------------- | --- | ----- |
| بلاگ: مرور برچسب، خوراک RSS، مقاله‌های محبوب                    | #73 | ✅    |
| بلاگ: breadcrumb schema + Article schema غنی‌شده                | #73 | ✅    |
| فرانت‌اند: فونت woff2 + کاهش preload                            | #74 | ✅    |
| فرانت‌اند: حذف framer-motion مرده + type دکمه‌ها + loading      | #74 | ✅    |
| صفحه اصلی: آمار پویا (۶۴ ابزار) + پیش‌نمایش بلاگ + کارت دسته‌ها | #75 | ✅    |

### انجام شده (ممیزی UX/UI — ۲۰۲۶-۰۶-۲۵) ✅

| #   | آیتم                                                                                        | فاز | وضعیت |
| --- | ------------------------------------------------------------------------------------------- | --- | ----- |
| ۱   | `lib/navigation.ts` — تنظیمات یکپارچه ناوبری (source of truth)                              | A   | ✅    |
| ۲   | `Navigation.tsx` — اتصال به navigation config                                               | A   | ✅    |
| ۳   | `Footer.tsx` — اتصال به navigation config                                                   | A   | ✅    |
| ۴   | `lib/tool-search.ts` — ۲۵+ synonym فارسی جدید                                               | A   | ✅    |
| ۵   | صفحه جستجو — zero-state با ابزارهای محبوب + دسته‌بندی                                       | A   | ✅    |
| ۶   | `getToolCountForDisplay()` — منبع واحد شمار ابزارها                                         | A   | ✅    |
| ۷   | `ToolPageShell.tsx` — PortfolioCTA بعد از RelatedTools (نه قبل)                             | B   | ✅    |
| ۸   | OCR page — حذف BreadcrumbSchema تکراری                                                      | B   | ✅    |
| ۹   | OCR page — skeleton loading جایگزین dynamic import بدون loading                             | B   | ✅    |
| ۱۰  | PDF-to-Word page — skeleton loading اضافه شد                                                | B   | ✅    |
| ۱۱  | PersianOcr — sr-only file input + aria-label صریح                                           | B   | ✅    |
| ۱۲  | PersianOcr — aria-live برای processing state                                                | B   | ✅    |
| ۱۳  | PersianOcr — role=alert برای error state                                                    | B   | ✅    |
| ۱۴  | SEO: canonical یکپارچه (non-www)                                                            | C   | ✅    |
| ۱۵  | Premium messaging: feature flag gating تأیید شد                                             | C   | ✅    |
| ۱۶  | Typo check: "اسند" و mixed-script — تمیز                                                    | C   | ✅    |
| ۱۷  | `lib/tools-registry.ts` — ۶ validator inline به catalog اضافه شد (رفع mismatch)             | D   | ✅    |
| ۱۸  | `HomePage.tsx` — متنوع‌سازی ابزارهای جدید بر اساس دسته‌بندی                                 | D   | ✅    |
| ۱۹  | `HomePage.tsx` — بخش «مسیرها بر اساس نقش» (۶ نقش)                                           | D   | ✅    |
| ۲۰  | `HomePage.tsx` — بخش «چرا اعتماد کنم؟» (۳ proof point)                                      | D   | ✅    |
| ۲۱  | `app/pricing/page.tsx` — صفحه قیمت‌گذاری با ۳ پلن (رایگان/حرفه‌ای/کسب‌وکار)                 | D   | ✅    |
| ۲۲  | `PricingContent.tsx` — جدول مقایسه ویژگی‌ها + FAQ                                           | D   | ✅    |
| ۲۳  | `lib/navigation.ts` — لینک قیمت‌گذاری به footer اضافه شد                                    | D   | ✅    |
| ۲۴  | `ToolsRouteShell.tsx` — حذف BreadcrumbSchema تکراری (هر صفحه مسئول breadcrumb خود)          | D   | ✅    |
| ۲۵  | `shared/analytics/events.ts` — رویدادنگاری ۱۵ رویداد (search, tool, engagement, conversion) | C   | ✅    |
| ۲۶  | B4: فرم حقوق — progressive disclosure از قبل موجود بود (showAdvanced toggle)                | B   | ✅    |
| ۲۷  | B6+C4: a11y axe-core tests (۹ مسیر) + Lighthouse budgets از قبل موجود بود                   | B   | ✅    |

### انجام شده (رشد v6.7.0 — ۲۰۲۶-۰۶-۲۵) ✅

| #   | آیتم                                                                  | فاز | وضعیت |
| --- | --------------------------------------------------------------------- | --- | ----- |
| ۱   | ۱۵ OG image برای ۱۱ ابزار + ۴ دسته‌بندی جدید                          | P14 | ✅    |
| ۲   | `ToolBlogCTA` — لینک‌دهی ابزار→بلاگ (پیشنهاد مقاله مرتبط)             | P14 | ✅    |
| ۳   | `BlogSidebar` — لینک‌های پویا بر اساس برچسب مقاله (جایگزین hardcoded) | P14 | ✅    |
| ۴   | `ShareResult` — Web Share API + تلگرام + کپی لینک                     | P17 | ✅    |
| ۵   | اشتراک‌گذاری در ۵ ابزار پرتقاضا (حقوق، وام، مالیات، مهریه، چک)        | P17 | ✅    |
| ۶   | حذف ۱۸ فایت TTF غیرضروری (~۳.۴ مگابایت صرفه‌جویی)                     | P16 | ✅    |
| ۷   | حذف fallback TTF از @font-face (فقط woff2)                            | P16 | ✅    |
| ۸   | اضافه کردن preload فونت SemiBold برای عناوین                          | P16 | ✅    |
| ۹   | اسکلت لودینگ برای ۳۷ صفحه ابزار                                       | P16 | ✅    |
| ۱۰  | `ssr: false` برای ۲۴ ابزار سنگین کلاینت‌محور                          | P16 | ✅    |

### برنامه‌ریزی شده 📋

| #   | آیتم         | نسخه   | اولویت |
| --- | ------------ | ------ | ------ |
| ۲۳  | درگاه پرداخت | v7.0.0 | P0     |

### منتظر 🕐

| #   | آیتم         | دلیل           |
| --- | ------------ | -------------- |
| ۲۸  | درگاه پرداخت | تأیید زرین‌پال |

---

## فاز A — تثبیت ساختار اطلاعات و کشف‌پذیری (از ممیزی UX/UI)

> **اولویت: P0** — بزرگ‌ترین ضعف فعلی: کاربر نمی‌فهمد از کجا شروع کند. معماری اطلاعات چندپاره و نام‌گذاری مبهم صفحات discovery

### A1. ممیزی taxonomy و نقشه مسیرها

- بررسی کامل تمام routeهای موجود: `/tools`، `/topics`، `/tools/specialized`، `/search`
- مستندسازی نقش هر صفحه: discovery vs education vs trust
- شناسایی هم‌پوشانی‌ها و مبهمات نام‌گذاری

### A2. یکسان‌سازی taxonomy و route labels

- ایجاد `lib/navigation.ts` به‌عنوان source of truth برای تمام مسیرها
- هر route باید role مشخص داشته باشد: discover / category / tool / learn / trust
- نام هر route باید با محتوایش منطبق باشد (مثلاً `/tools` = فهرست کل ابزارها یا rename به `/finance-tools`)
- breadcrumb config از یک منبع تغذیه شود

### A3. بازطراحی صفحه جستجو → Command Palette

- تبدیل صفحه جستجوی فعلی به command palette با پیشنهاد لحظه‌ای
- فیلتر بر اساس دسته‌بندی
- synonyms فارسی (مثلاً "حقوق" = "حقوق و دستمزد" = "فیش حقوقی")
- zero-state شامل موارد محبوب و دسته‌بندی‌ها
- deep-link مستقیم به ابزار
- fuzzy index محلی و structured search model

### A4. یکپارچه‌سازی breadcrumb و ناوبری

- حذف breadcrumbهای تکراری از تمام صفحات ابزار
- اطمینان از یکتا و صحیح بودن breadcrumb در همه صفحات
- جداسازی nav ثانویه از main content در source order

### A5. اصلاح canonical و host偏好ی

- یکسان‌سازی preferred domain (www vs non-www)
- 301 redirect در nginx/next.config
- rel=canonical صحیح در تمام صفحات ایندکس‌شونده
- بررسی دوره‌ای metadata در search console

### A6. منبع واحد شمار ابزارها

- شمار ابزارها در تمام metadata، OG، snippets و UI باید از یک source of truth بیاید
- حذف عددسازی‌های متفاوت (55+، 58، 66) در صفحات مختلف
- auto-sync با tool registry واقعی

---

## فاز B — بهبود UX صفحات ابزار و دسترس‌پذیری (از ممیزی UX/UI)

> **اولویت: P0** — stateهای ناپایدار، source-order پرنویز، و مشکلات دسترس‌پذیری perceived quality را پایین می‌آورند

### B1. حذف loaderهای متنی و بهبود state management

- جایگزینی متن‌های "در حال بارگذاری..." با skeleton UI واقعی و کوتاه‌عمر
- اطمینان از اینکه main heading و فرم ابزار در source order پیش از boilerplate بیاید
- footer و secondary nav در landmark مشخص و جدا از main content

### B2. اصلاح source-order در صفحات ابزار

- در صفحات کلیدی (/salary، /tools/persian-ocr، /pdf-tools/convert/pdf-to-word):
  - heading اصلی اول
  - فرم/ابزار دوم
  - نتیجه سوم
  - محتوای مکمل (FAQ, guides) چهارم
  - nav/footer آخر
- بررسی DOM order مطابق با visual order باشد

### B3. بازچینی CTAها — اولویت‌بندی محتوا

- حذف CTA "مشاوره رایگان" از first viewport ابزارها
- CTA اصلی هر صفحه فقط "استفاده از ابزار" یا "شروع/محاسبه/آپلود"
- لینک مشاوره به انتهای صفحه یا ناحیه after-success منتقل شود
- اعمال روی: صفحه حقوق، OCR، PDF-to-Word و سایر ابزارها

### B4. ساده‌سازی فرم حقوق و Progressive Disclosure

- حالت پایه: فقط ۳–۵ فیلد ضروری (سنوات، سابقه، حقوق پایه)
- "حالت پیشرفته" برای فیلدهای تکمیلی (اضافه‌کاری، شب‌کاری، بن)
- presetهای آماده: "کارمند تمام‌وقت"، "سناریوی ساده"، "حقوق با اضافه‌کاری"
- tooltip برای مفاهیم تخصصی (سنوات، حق عائله‌مندی و...)
- معیار: کاربر با کمتر از ۵ ورودی به نتیجه اولیه برسد

### B5. دسترس‌پذیری ابزارهای آپلودی

- صفحه OCR: اضافه کردن `<input type="file">` قابل‌فوکوس با label صریح
- drag-and-drop باید با keyboard هم کار کند
- دکمه visible upload به‌عنوان جایگزین drag-and-drop
- live region برای stateهای async (آپلود، پردازش، تکمیل)
- skip links و landmarks در تمام صفحات ابزار

### B6. تست‌های دسترس‌پذیری CI

- اضافه کردن axe-core/playwright به تست‌های E2E
- تست keyboard flow برای صفحات کلیدی (OCR، PDF-to-Word، حقوق)
- focus-visible و کنتراست روی CTAها، تب‌ها و کنترل‌های سفارشی
- معیار: حداقل ۵ صفحه کلیدی بدون violation بحرانی axe

### B7. تست ریسپانسیو روی breakpoints استاندارد

- تست در ۳۹۰px (موبایل کوچک)، ۷۶۸px (تبلت)، ۱۰۲۴px (دسکتاپ کوچک)، ۱۴۴۰px (دسکتاپ بزرگ)
- بررسی vertical overload در صفحه اصلی و فرم حقوق
- بررسی CTA displacement در موبایل
- بررسی context loss در dropzone OCR

---

## فاز C — کیفیت محتوا، SEO و حکمرانی اندازه‌گیری (از ممیزی UX/UI)

> **اولویت: P1** — بهبود بدون داده سخت است؛ ناهماهنگی‌های اعتماد/سئو هزینه CTR و برند دارند

### C1. هم‌راستایی messaging پریمیوم و پرداخت

- بررسی تمام صفحات عمومی که از plan/اشتراک صحبت می‌کنند
- اگر پریمیوم هنوز public نیست: تغییر به "به‌زودی" یا "در دست توسعه"
- صفحه account باید state صریح "وارد نشده‌اید" یا CTA ورود داشته باشد
- حذف وعده‌های تجاری قبل از فعال‌سازی واقعی

### C2. رویدادنگاری و funnel analytics (privacy-safe)

- تعریف event taxonomy:
  - `search_open`، `search_submit`، `search_result_click`
  - `tool_open`، `tool_input_change`، `tool_run`، `tool_error`
  - `tool_result_view`، `tool_export_click`
  - `help_open`، `cta_consult_click`
- داده‌ها anonymized و opt-in باشند (مطابق سیاست حریم خصوصی سایت)
- داشبورد funnel برای مسیر search → tool → result → export

### C3. Pass محتوایی و ریزمتن (Micro-copy)

- بررسی و اصلاح typoها (مثلاً "اسند" → "اسناد")
- اصلاح ترکیب‌های mixed-script در UI
- حذف labelهای نیمه‌فنی بدون توضیح ساده‌تر
- تعریف glossary فارسی ثابت محصول
- lint محتوایی برای typoها و script-mixing

### C4. Lighthouse baseline و performance budgets

- گرفتن baseline موبایل و دسکتاپ برای صفحات کلیدی:
  - صفحه اصلی، صفحه حقوق، OCR، PDF-to-Word
- اهداف: LCP < 2.5s، INP < 200ms، CLS < 0.1
- اضافه کردن Lighthouse CI به pipeline
- performance budget در lighthouserc.json

### C5. تست canonical و metadata نهایی

- اطمینان از resolve شدن همه URLها به host ترجیحی
- بررسی snippets و metadata با شمار ابزارهای واقعی
- title/meta review دوره‌ای

---

## قوانین توسعه

1. **هر ابزار جدید باید کامل و واقعی باشد** — بدون stub یا placeholder
2. **typecheck + lint + test قبل از هر deploy** — بدون استثنا
3. **RTL و Dark Mode** — در تمام کامپوننت‌ها
4. **پردازش محلی** — تمام ابزارها در مرورگر کار کنند
5. **SEO first** — هر صفحه باید metadata, OG, JSON-LD داشته باشد
6. **Mobile first** — تمام UI واکنش‌گرا باشد
