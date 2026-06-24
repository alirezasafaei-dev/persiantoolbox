# PersianToolbox Roadmap — نقشه راه رشد و درآمدزایی

**Last Updated**: 2026-06-23
**Version**: 6.4.0
**Status**: Active — Growth Phase

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

- **ابزارها**: ۵۹ ابزار واقعی در ۶ دسته‌بندی
- **بلاگ**: ۱۷ مقاله آموزشی
- **تست‌ها**: ۴۲۱ تست واحد + ۴۳ E2E — همه PASS
- **صفحات SSG**: ۱۷۰ صفحه
- **عملکرد**: Lighthouse 96, SEO 100, A11y 91
- **امنیت**: RBAC (admin/editor/user), HMAC, CSRF, CSP nonce
- **دیپلوی**: PM2 + standalone Next.js on VPS
- **Dark Mode**: بهبود یافته (تمام صفحات CSS variables)
- **Accessibility**: بهبود یافته (dialog roles, aria-labels فارسی)
- **Localization**: تمام متن‌های UI فارسی شد

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

### در حال اجرا 🔄

| #   | آیتم | نسخه | وضعیت |
| --- | ---- | ---- | ----- |

### برنامه‌ریزی شده 📋

| #   | آیتم               | نسخه   | اولویت |
| --- | ------------------ | ------ | ------ |
| ۱۵  | Breadcrumb schema  | v6.1.0 | P0 ✅  |
| ۱۶  | Internal linking   | v6.1.0 | P0 ✅  |
| ۱۷  | OG image خودکار    | v6.1.0 | P0 ✅  |
| ۱۸  | CTA هوشمند         | v6.2.0 | P0 ✅  |
| ۱۹  | صفحات فرود         | v6.2.0 | P0 ✅  |
| ۲۰  | Performance        | v6.3.0 | P1 ✅  |
| ۲۱  | ذخیره سناریو       | v6.4.0 | P1 ✅  |
| ۲۲  | Push notifications | v6.4.0 | P1     |
| ۲۳  | درگاه پرداخت       | v7.0.0 | P0     |
| ۲۴  | Redis + CDN        | v7.0.0 | P2     |
| ۲۵  | Chrome Extension   | v6.4.0 | P2 ✅  |
| ۲۶  | Telegram Bot       | v6.4.0 | P2 ✅  |

### منتظر 🕐

| #   | آیتم           | دلیل           |
| --- | -------------- | -------------- |
| ۲۷  | درگاه پرداخت   | تأیید زرین‌پال |
| ۲۸  | Google AdSense | تأیید گوگل     |

---

## قوانین توسعه

1. **هر ابزار جدید باید کامل و واقعی باشد** — بدون stub یا placeholder
2. **typecheck + lint + test قبل از هر deploy** — بدون استثنا
3. **RTL و Dark Mode** — در تمام کامپوننت‌ها
4. **پردازش محلی** — تمام ابزارها در مرورگر کار کنند
5. **SEO first** — هر صفحه باید metadata, OG, JSON-LD داشته باشد
6. **Mobile first** — تمام UI واکنش‌گرا باشد
