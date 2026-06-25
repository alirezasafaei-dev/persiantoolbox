# PersianToolbox

ابزار آنلاین فارسی — پردازش محلی در مرورگر، حریم خصوصی کامل.

Local-first Persian web toolbox built with Next.js 16 (RTL-first UI, SEO metadata, offline support, and operational CI gates).

## ویژگی‌ها

- **۶۶ ابزار واقعی** در ۶ دسته‌بندی — صفر ابزار جعلی
- OCR فارسی با Tesseract.js (پردازش کاملاً محلی)
- ابزارهای PDF: ادغام، تقسیم، فشرده‌سازی، تبدیل، استخراج، واترمارک
- ابزارهای تصویر: تبدیل فرمت (JPG/PNG/WebP)، برش، چرخش، تغییر اندازه، OCR فارسی
- ابزارهای مالی: ۱۸ ابزار (وام، حقوق، مالیات، بیمه، بازار)
- ابزارهای تاریخ: شمسی/میلادی/قمری، اختلاف تاریخ، تقویم فارسی
- ابزارهای متنی: شمارش کلمات، تبدیل اعداد، تبدیل آدرس، JSON، Hash، Base64
- QR Code و رمز عبور با پردازش کاملاً محلی

## تست‌ها

- **۴۳۵ تست واحد** (vitest)
- **۱۸ فایل تست E2E** (Playwright)
- Lighthouse: Performance 96, SEO 100, Best Practices 96

## شروع سریع

```bash
pnpm install
pnpm dev
```

## کیفیت

```bash
pnpm lint          # 0 خطا
pnpm typecheck     # PASS
pnpm vitest --run  # PASS
pnpm build         # PASS
```

## دیپلوی

```bash
bash deploy-vps-auto.sh  # اتوماتیک: typecheck + lint + test + build + deploy
```

## ساختار پروژه

- `app/`: صفحات Next.js App Router + API routes
- `components/`: کامپوننت‌های UI و صفحات
- `features/`: منطق ابزارها و پیاده‌سازی
- `lib/`: ماژول‌های مشترک (SEO، امنیت، سیاست‌ها)
- `shared/`: ابزارهای مشترک، analytics، UI primitives
- `tests/`: تست‌های unit، contract و e2e
- `docs/`: مستندات عملیاتی، نقشه راه، لایسنس

## امنیت

- CSP nonce-based
- HSTS
- HMAC webhook signature verification
- Async scrypt password hashing
- CSRF protection
- Rate limiting
- اینماد (نماد اعتماد الکترونیکی)

## فونت‌ها

- **Vazirmatn**: متن فارسی (اولویت اول)
- **Noto Sans**: متن انگلیسی
- **IRANSansX**: fallback

## مجوز

MIT License — مشاهده `LICENSE`
