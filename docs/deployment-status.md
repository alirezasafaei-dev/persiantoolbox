# گزارش وضعیت سایت زنده

**تاریخ**: 2026-06-22
**آدرس**: https://persiantoolbox.ir/

---

## وضعیت کلی

| مورد          | وضعیت                    |
| ------------- | ------------------------ |
| سایت اصلی     | 200 ✅                   |
| نسخه deployed | 3.9.0 ✅                 |
| Node.js       | v20.20.2 ✅              |
| Uptime        | > 1 ساعت ✅              |
| حافظه مصرفی   | 138MB RSS / 62MB Heap ✅ |

## وضعیت APIها

| endpoint       | HTTP   | محتوا                                |
| -------------- | ------ | ------------------------------------ |
| `/api/health`  | 200 ✅ | status=ok, version=3.9.0             |
| `/api/ready`   | 200 ✅ | status=ready, service=persiantoolbox |
| `/api/version` | 200 ✅ | version=3.9.0                        |

## وضعیت مسیرهای اصلی (همه 200 ✅)

| مسیر           | HTTP |
| -------------- | ---- |
| `/`            | 200  |
| `/pdf-tools`   | 200  |
| `/image-tools` | 200  |
| `/date-tools`  | 200  |
| `/text-tools`  | 200  |
| `/tools`       | 200  |
| `/topics`      | 200  |
| `/privacy`     | 200  |
| `/terms`       | 200  |
| `/about`       | 200  |
| `/support`     | 200  |
| `/trust`       | 200  |
| `/developers`  | 200  |
| `/search`      | 200  |
| `/robots.txt`  | 200  |
| `/sitemap.xml` | 200  |

## وضعیت ابزارهای نمونه (همه 200 ✅)

| ابزار                  | HTTP |
| ---------------------- | ---- |
| PDF Merge              | 200  |
| PDF Compress           | 200  |
| Image Format Converter | 200  |
| Loan Calculator        | 200  |
| Salary Calculator      | 200  |
| Persian Password       | 200  |
| Persian OCR            | 200  |
| JSON Formatter         | 200  |

## وضعیت Sitemap و Robots

- **Sitemap**: 99 URL ثبت‌شده ✅
- **robots.txt**: مسیرهای admin/auth/api/account/checkout/dashboard بسته شده‌اند ✅
- **search?**: در robots.txt Disallow شده (جلوگیری از index شدن جستجو) ✅

## وضعیت امنیت هدرها

| هدر                       | مقدار                                 | وضعیت |
| ------------------------- | ------------------------------------- | ----- |
| Content-Security-Policy   | nonce-based + Enamad img-src          | ✅    |
| X-Frame-Options           | DENY                                  | ✅    |
| X-Content-Type-Options    | nosniff                               | ✅    |
| Strict-Transport-Security | 2 years + includeSubDomains + preload | ✅    |
| Referrer-Policy           | strict-origin-when-cross-origin       | ✅    |
| Permissions-Policy        | camera/mic/geo/payment disabled       | ✅    |

## مشکلات پیدا شده

### ۱. نوشتار نادرست در صفحه قوانین

- **مشکل**: در `app/terms/page.tsx` خط ۴۱ عبارت `میکند` بدون نیم‌فاصله نوشته شده
- **نیاز به اصلاح**: `میکند` → `می‌کند`
- **اولویت**: متوسط (تاثیر بر سئو و خوانایی)

### ۲. Breadcrumb تکراری «خانه»

- **مشکل**: در صفحات ابزارها ممکن است «خانه» دو بار نمایش داده شود
- **تعداد «خانه» در صفحه /loan**: ۲ بار
- **نیاز به بررسی**: آیا breadcrumb خودکار + دستی تکرار شده؟
- **اولویت**: متوسط (تاثیر بر UX)

### ۳. متن «در حال بارگذاری...» در خروجی اولیه

- **مشکل**: ۲ بار در HTML اولیه صفحه اصلی ظاهر می‌شود
- **تاثیر**: ممکن است بر خوانایی موتورهای جستجو تاثیر بگذارد
- **اولویت**: کم (SSR rendered content وجود دارد)

### ۴. لینک «همه ابزارها» در Footer

- **وضعیت**: به `/topics` لینک می‌شود — این **عمدی** است (صفحه موضوعات)
- **نیاز به بررسی**: آیا بهتر نیست به `/tools` لینک شود؟
- **اولویت**: کم

### ۵. صفحه جستجو SSR ضعیف

- **وضعیت**: metadata و title SSR می‌شوند ولی محتوای اصلی Client-only است
- **تاثیر**: موتورهای جستجو محتوای ابزارها را نمی‌بینند
- **اولویت**: کم

### ۶. لینک‌های پرداخت/پشتیبانی

- **وضعیت**: لینک‌های پرداخت به درگاه وصل نیستند (mock adapter)
- **تاثیر**: کاربران ممکن است گیج شوند
- **اولویت**: متوسط

## مواردی که قابل بررسی نبود

- **وضعیت واقعی render در مرورگر**: curl فقط HTML خام برمی‌گرداند — نیاز به بررسی دستی در مرورگر
- **عملکرد Lighthouse**: نیاز به اجرای Lighthouse CI
- **Workbox/PWA offline**: نیاز به بررسی دستی offline mode

## پیشنهاد اصلاحی

1. اصلاح `میکند` → `می‌کند` در terms page
2. بررسی breadcrumb تکراری
3. بررسی لینک footer «همه ابزارها»
4. بررسی وضعیت پرداخت در production

## پیشنهاد نهایی برای deploy

- **وضعیت فعلی**: سایت زنده و کاربردی است — نسخه 3.9.0
- **مشکل بحرانی**: ندارد
- **پیشنهاد**: اصلاحات minor اعمال شود و سپس commit + push انجام شود
- **دیپلوی بعدی**: فقط بعد از commit کردن تغییرات فعلی
