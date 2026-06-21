# PersianToolbox

ابزار آنلاین فارسی — پردازش محلی در مرورگر، حریم خصوصی کامل.

Local-first Persian web toolbox built with Next.js 16 (RTL-first UI, SEO metadata, offline support, and operational CI gates).

## ویژگی‌ها

- **۵۶ ابزار واقعی** در ۶ دسته‌بندی — صفر ابزار جعلی
- OCR فارسی با Tesseract.js (پردازش کاملاً محلی)
- ابزارهای PDF: ادغام، تقسیم، فشرده‌سازی، تبدیل، استخراج، واترمارک
- ابزارهای تصویر: تبدیل فرمت (JPG/PNG/WebP)، برش، چرخش، تغییر اندازه
- ابزارهای مالی: ۱۹ ابزار (وام، حقوق، مالیات، بیمه، بازار)
- ابزارهای تاریخ: شمسی/میلادی/قمری، اختلاف تاریخ، تقویم فارسی
- ابزارهای متنی: شمارش کلمات، تبدیل اعداد، تبدیل آدرس، JSON، Hash، Base64
- QR Code و رمز عبور با پردازش کاملاً محلی

## تست‌ها

- **۴۰۳ تست واحد** (vitest) — ۱۰۰ فایل تست
- **۴۳ تست E2E** (Playwright)
- **۹ تست visual regression**
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
pnpm vitest --run  # 403/403 PASS
pnpm build         # PASS
```

## دیپلوی

```bash
# VPS
rsync -avz --exclude node_modules --exclude .next ./ ubuntu@193.93.169.32:~/persiantoolbox/
ssh ubuntu@193.93.169.32 "cd ~/persiantoolbox && pnpm install && pnpm build && cp -r .next/static .next/standalone/.next/static && cp -r public .next/standalone/public && pm2 restart persiantoolbox"
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
