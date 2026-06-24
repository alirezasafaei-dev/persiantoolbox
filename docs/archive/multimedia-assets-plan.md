# برنامه Multimedia و ساخت Assetها

**تاریخ**: 2026-06-22

---

## قابلیت‌های multimedia فعلی پروژه

### ابزارهای تصویر موجود

- Resize Image (JPEG/PNG/WebP + quality slider)
- Rotate Image
- Text on Image
- Image Format Converter (Canvas API)
- Image Background Remover
- Persian OCR (Tesseract.js)

### Assetهای فعلی

| Asset            | مسیر                          | وضعیت        |
| ---------------- | ----------------------------- | ------------ |
| Logo اصلی        | `public/icon.svg`             | ✅           |
| Apple Touch Icon | `public/apple-touch-icon.svg` | ✅           |
| Favicon          | `public/favicon.ico`          | ✅           |
| OG Default       | `public/og-default.png`       | ✅           |
| OG Default SVG   | `public/og-default.svg`       | ✅           |
| Ad Banners       | `public/ads/`                 | ✅           |
| Fonts            | `public/fonts/`               | ✅ (23 فایل) |

### OpenGraph Images

- `app/opengraph-image.tsx`: Dynamic OG image با gradient + tool categories + آمار ✅
- `app/twitter-image.tsx`: Twitter card با طراحی مشابه ✅
- `app/(tools)/interest/opengraph-image.tsx`: OG اختصاصی برای صفحه سود ✅

### Visual Regression Tests

- `tests/e2e/visual-regression.spec.ts`: تست‌های بصری Playwright ✅

## وضعیت OpenGraph Images

- **主页**: Dynamic gradient + categories + stats ✅
- **ابزارها**: اکثر ابزارها OG اختصاصی ندارند (فقط default)
- **پیشنهاد**: برای هر دسته ابزار، OG اختصاصی بسازید

## تولید مستقیم تصویر هنری با هوش مصنوعی

**تولید مستقیم تصویر هنری با هوش مصنوعی به‌صورت native در این پروژه فعال نیست.**

### جایگزین‌های عملی

#### ۱. SVG-based generation

- ابزارهای تصویر موجود از Canvas API استفاده می‌کنند
- امکان ساخت بنر با SVG و تبدیل به PNG

#### ۲. HTML/CSS → Playwright → PNG

- اسکریپت‌های Playwright می‌توانند صفحات HTML را render کنند
- خروجی PNG با کیفیت بالا

#### ۳. Next.js OG Image API

- `next/og` برای ساخت OG images داینامیک ✅ (فعلی)
- پشتیبانی از فونت Vazirmatn ✅

#### ۴. طراحی دستی

- چک‌لیست بررسی طراحی توسط انسان

## پیشنهاد ساختار پوشه‌ها

```
public/
  brand/
    logo.svg
    logo-dark.svg
    logo-light.svg
    mark.svg
  generated/
    banners/
      instagram-story-1080x1920.png
      instagram-post-1080x1080.png
      website-banner-1600x600.png
    og/
      pdf-tools-1200x630.png
      image-tools-1200x630.png
      finance-tools-1200x630.png
    logos/
      logo-variant-01.svg
      logo-variant-02.svg
      logo-variant-03.svg
```

## پیشنهاد Scriptها

```
scripts/
  media/
    generate-banners.mjs
    generate-og-assets.mjs
    generate-logo-variants.mjs
```

## سایزهای بنر پیشنهادی

| نوع             | سایز      | کاربرد                   |
| --------------- | --------- | ------------------------ |
| Instagram Story | 1080×1920 | استوری اینستاگرام        |
| Instagram Post  | 1080×1080 | پست اینستاگرام           |
| OpenGraph       | 1200×630  | لینک در شبکه‌های اجتماعی |
| Website Banner  | 1600×600  | بنر سایت                 |

## برنامه ساخت Logo Variants

### نسخه‌های پیشنهادی

1. **Logo اصلی**: `icon.svg` فعلی — بهینه‌سازی شده
2. **Logo تیره**: `logo-dark.svg` — برای background تیره
3. **Logo روشن**: `logo-light.svg` — برای background روشن
4. **Mark**: `mark.svg` — فقط آیکون بدون متن

### قواعد

- از لوگوی شخص ثالث استفاده نکنید
- از فونت‌های رایگان و مجاز استفاده کنید
- فایل‌های موجود را overwrite نکنید
- نسخه‌ها با نام جداگانه ذخیره شوند

## راهنمای رنگ و تایپوگرافی برند

### رنگ‌ها

| نام          | متغیر CSS         | مقدار             |
| ------------ | ----------------- | ----------------- |
| Primary      | `--color-primary` | `#2563eb`         |
| Success      | `--color-success` | `#22c55e`         |
| Warning      | `--color-warning` | `#eab308`         |
| Danger       | `--color-danger`  | `#ef4444`         |
| Background   | `--bg-primary`    | `#f5f7fb`         |
| Surface 1    | `--surface-1`     | سفید              |
| Text Primary | `--text-primary`  | سیاه/خاکستری تیره |

### تایپوگرافی

| کاربرد           | فونت      |
| ---------------- | --------- |
| فارسی (اولیت)    | Vazirmatn |
| فارسی (fallback) | IRANSansX |
| انگلیسی          | Noto Sans |

## نکات Copyright و Safety

- فونت‌ها: Vazirmatn (OFL), Noto Sans (Apache 2.0), IRANSansX (personal use)
- آیکن‌ها: اختصاصی پروژه
- OG Images: اختصاصی پروژه
- Ad Banners: اختصاصی پروژه

## کارهای لازم برای Human Review

1. بررسی طراحی OG images جدید
2. بررسی رنگ‌ها و تایپوگرافی بنرها
3. تایید Logo variants
4. بررسی کیفیت خروجی PNG
