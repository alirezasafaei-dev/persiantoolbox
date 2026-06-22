# ممیزی کامل پروژه

**تاریخ**: 2026-06-22
**نسخه**: 3.9.0

---

## خلاصه معماری پروژه

PersianToolbox یک وب‌اپلیکیشن Next.js با App Router است که ۵۷ ابزار آنلاین در ۶ دسته‌بندی ارائه می‌دهد. تمام پردازش‌ها در مرورگر کاربر انجام می‌شود (حریم خصوصی).

**Stack**: Next.js 16 + TypeScript + Tailwind CSS + Vitest + Playwright
**Database**: SQLite (local) / PostgreSQL (production)
**Process Manager**: PM2
**Web Server**: Nginx (reverse proxy) + Next.js standalone

## مسیرهای اصلی app

### دسته‌بندی ابزارها

| دسته       | مسیر                 | تعداد ابزار  |
| ---------- | -------------------- | ------------ |
| PDF        | `/pdf-tools/`        | ۱۶ ابزار     |
| تصویر      | `/image-tools/`      | ۵ ابزار      |
| مالی       | `/tools/`            | ۱۹ ابزار     |
| تاریخ      | `/date-tools/`       | ۴ ابزار      |
| متنی       | `/text-tools/`       | ۶ ابزار      |
| اعتبارسنجی | `/validation-tools/` | ۲ ابزار      |
| **مجموع**  |                      | **۵۷ ابزار** |

### API Routeها

- Auth: login, logout, me, register
- Payments: checkout, callback
- Subscription: checkout, confirm, status, webhook
- Health: health, ready, version
- Market: market data (currencies, gold, crypto)
- Admin: site-settings, monetization, ops
- Usage: check, track
- Other: security-txt, enamad-verification, data/salary-laws, analytics, errors, history

### صفحات غیرابزاری

- `/about`, `/privacy`, `/terms`, `/support`, `/trust`, `/developers`
- `/search`, `/topics`, `/guides`, `/how-it-works`
- `/account`, `/premium`, `/subscription`, `/ads`
- `/admin/` (site-settings, monetization, funnel)

## وضعیت ابزارهای PDF (۱۶ ابزار)

- Merge PDF: ✅ واقعی + drag-and-drop reorder
- Split PDF: ✅ واقعی
- Compress PDF: ✅ واقعی + batch multi-file
- Encrypt PDF: ✅ واقعی (UI کامل)
- Decrypt PDF: ✅ واقعی
- Image to PDF: ✅ واقعی
- Word to PDF: ✅ واقعی
- PDF to Image: ✅ واقعی
- PDF to Text: ✅ واقعی
- Extract Text: ✅ واقعی
- Extract Pages: ✅ واقعی
- Rotate Pages: ✅ واقعی
- Reorder Pages: ✅ واقعی
- Delete Pages: ✅ واقعی
- Add Page Numbers: ✅ واقعی
- Add Watermark: ✅ واقعی

## وضعیت ابزارهای تصویر (۵ ابزار)

- Resize Image: ✅ JPEG/PNG/WebP + quality slider
- Rotate Image: ✅ واقعی
- Text on Image: ✅ واقعی
- Image Format Converter: ✅ Canvas API واقعی
- Image Background Remover: ✅ ( cropping-based )

## وضعیت ابزارهای مالی (۱۹ ابزار)

- Loan Calculator: ✅ + جدول اقساط
- Salary Calculator: ✅ + قوانین کار ۱۴۰۵
- Interest Calculator: ✅
- Currency Converter: ✅ + نرخ لحظه‌ای
- Inflation Calculator: ✅
- Investment Calculator: ✅
- Tax Calculator: ✅
- Bank Rate Comparator: ✅
- Living Cost Calculator: ✅
- Insurance Calculator: ✅
- Bonus Calculator: ✅
- Severance Calculator: ✅
- Leave Calculator: ✅
- Real Purchasing Power: ✅
- Overtime Calculator: ✅
- Rent vs Buy: ✅
- Loan vs Investment: ✅
- Retirement Calculator: ✅

## وضعیت ابزارهای تاریخ (۴ ابزار)

- Shamsi-Gregorian: ✅
- Date Difference: ✅
- Persian Calendar: ✅
- Event Reminder: ✅

## وضعیت ابزارهای متنی (۶ ابزار)

- Word Counter: ✅
- Number Converter: ✅
- Remove Spaces: ✅
- Case Converter: ✅
- Extract Info: ✅
- Address Fa to En: ✅

## وضعیت ابزارهای اعتبارسنجی (۲ ابزار)

- Image to QR: ✅ (پردازش محلی)
- Persian Password: ✅ (Web Crypto API)

## وضعیت ابزارهای توسعه‌دهندگان (۳ ابزار)

- JSON Formatter: ✅
- Hash Generator: ✅
- Base64 Tool: ✅

## وضعیت OCR

- Persian OCR: ✅ Tesseract.js + فارسی/انگلیسی

## وضعیت Public Assets

- فونت‌ها: Vazirmatn (6 وزن) + IRANSansX (8 وزن) + Noto Sans (2 وزن) + DejaVu ✅
- آیکن‌ها: icon.svg, apple-touch-icon.svg, favicon.ico ✅
- OG Images: opengraph-image.tsx + twitter-image.tsx (dynamic) ✅
- Service Worker: sw.js ✅
- Manifest: app/manifest.ts ✅
- ads/: پوشه وجود دارد ✅
- security.txt: از طریق API route ✅
- Enamad verification: /34914740.txt ✅

## وضعیت تست‌ها

- **Unit Tests**: ۴۱۶ تست در ۱۰۳ فایل — همه PASS ✅
- **E2E Tests**: فایل‌های Playwright موجود (نیاز به اجرای جداگانه)
- **Lint**: 0 خطا، 44 warning (benign) ✅
- **Typecheck**: PASS ✅
- **Build**: PASS ✅

## وضعیت Deployment Scripts

| اسکریپت                  | توضیح                                                        |
| ------------------------ | ------------------------------------------------------------ |
| `deploy-vps-auto.sh`     | **اصلی** — rsync + build + copy static + fix perms + restart |
| `deploy-vps.sh`          | جایگزین — SSH-based                                          |
| `vps-deploy-complete.sh` | نصب اولیه VPS                                                |
| `auto-deploy.sh`         | deployment خودکار                                            |
| `quick-deploy.sh`        | deploy سریع                                                  |
| `deploy.py`              | deployment Python-based                                      |
| `copy-project-to-vps.sh` | کپی فایل‌ها                                                  |

## وضعیت مستندات

- 23 فایل docs/ ✅
- CONTRIBUTING.md ✅
- README.md ✅
- roadmap.md ✅
- AUTOMATION-PLAN.md ✅

## نقاط ضعف و Technical Debt

1. **تعداد زیاد اسکریپت‌های deploy**: ۱۰+ اسکریپت — نیاز به consolidation
2. **مکرر بودن خطای CSS بعد از deploy**: root cause رفع شده ولی نیاز به test
3. **Breadcrumb تکراری**: ممکن است «خانه» دوبار نمایش داده شود
4. **terms page typo**: `میکند` بدون نیم‌فاصله
5. **44 lint warning**: non-null assertions و console statements
6. **404 route**: `/pdf-tools/edit/add-page-numbers` در sitemap ولی صفحه واقعی ندارد (redirect به paginate)
7. **History API disabled**: تمام /api/history endpoints غیرفعال هستند

## پیشنهادهای بعدی

1. ✅ commit کردن تمام تغییرات فعلی
2. اصلاح typo در terms page
3. بررسی breadcrumb تکراری
4. حذف duplicate routes از sitemap
5. consolidation اسکریپت‌های deploy
6. اضافه کردن E2E test برای صفحات ابزار
