# راهنمای Brand Assets

**تاریخ**: 2026-06-22

---

## Brand Identity

### نام

- **فارسی**: جعبه ابزار فارسی
- **انگلیسی**: Persian Toolbox
- **دامنه**: persiantoolbox.ir

### شعار

- ابزارهای فارسی بدون شلوغی و حواس‌پرتی

### ارزش‌های برند

- حریم خصوصی (پردازش محلی)
- سرعت
- سادگی
- قابلیت اتکا

## رنگ‌های رسمی

### Primary Blue

```
HEX: #2563eb
RGB: 37, 99, 235
CSS: var(--color-primary)
```

### Success Green

```
HEX: #22c55e
RGB: 34, 197, 94
CSS: var(--color-success)
```

### Warning Yellow

```
HEX: #eab308
RGB: 234, 179, 8
CSS: var(--color-warning)
```

### Danger Red

```
HEX: #ef4444
RGB: 239, 68, 68
CSS: var(--color-danger)
```

### Background

```
HEX: #f5f7fb
CSS: var(--bg-primary)
```

## فونت‌های رسمی

### Vazirmatn (فارسی — اولیت)

- Regular: 400
- Medium: 500
- SemiBold: 600
- Bold: 700
- فرمت: TTF

### IRANSansX (فارسی — fallback)

- Regular
- Bold
- فرمت: WOFF2 + TTF

### Noto Sans (انگلیسی)

- Regular: 400
- Bold: 700
- فرمت: TTF

## ساختار فایل‌های Brand

```
public/
  icon.svg              # آیکون اصلی
  apple-touch-icon.svg  # آیکون iOS
  favicon.ico           # فایوآیکون
  og-default.png        # OG image پیش‌فرض
  og-default.svg        # OG image SVG
  brand/                # (پیشنهادی)
    logo.svg
    logo-dark.svg
    logo-light.svg
    mark.svg
```

## قواعد استفاده از Logo

### مجاز

- استفاده در سایت و اپلیکیشن
- استفاده در OG images
- استفاده در مستندات پروژه

### ممنوع

- تغییر رنگ‌های رسمی
- تغییر نسبت ابعاد
- استفاده در محصولات شخص ثالث
- ترکیب با لوگوهای دیگر بدون مجوز

## نکات Technical

- SVG برای scalability ترجیح داده می‌شود
- PNG برای OG images و social media
- ICO برای مرورگرهای قدیمی
- تمام assetها باید optimized باشند
