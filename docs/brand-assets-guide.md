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
  logo.png                  # لوگوی اصلی 512x512
  icon-128.png              # آیکون اصلی رابط کاربری
  icon-256.png              # آیکون میانی
  icon-512.png              # آیکون اصلی PWA/metadata
  android-chrome-192.png    # آیکون PWA اندروید
  android-chrome-512.png    # آیکون PWA اندروید
  apple-touch-icon-180.png  # آیکون iOS
  favicon-16.png            # فایوآیکون 16x16
  favicon-32.png            # فایوآیکون 32x32
  favicon-48.png            # فایوآیکون 48x48
  favicon.ico               # فایوآیکون چندسایزه
  dark/
    android-chrome-192.png
    android-chrome-512.png
    icon-128.png
    favicon-32.png
  og-default.png            # OG image پیش‌فرض
  og-default.svg            # OG image SVG
```

منبع لوگوی فعلی:

- PNG ارسالیِ تاییدشده از سمت نگهدارنده که در 2026-07-07 برای web assets بازتولید شد

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

- PNG فایل مرجع برند در وب‌اپ فعلی است
- ICO برای مرورگرهای قدیمی نگه داشته می‌شود
- هر تغییر لوگو باید تمام سایزهای بالا را با هم به‌روزرسانی کند
- تمام assetها باید optimized باشند
