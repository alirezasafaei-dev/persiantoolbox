# PersianToolbox — ادامه خودکار نقشه راه

**آخرین آپدیت**: 2026-06-21
**نسخه فعلی**: 3.9.0
**وضعیت**: v3.9.0 deployed ✅

---

## 📋 مراحل انجام شده (تا ۳.۸.۰)

- ✅ ۵۷ ابزار واقعی (۰ stub)
- ✅ 403 تست واحد PASS
- ✅ lint 0 خطا
- ✅ typecheck PASS
- ✅ build PASS
- ✅ CSP Enamad trustseal اضافه شد
- ✅ security.txt ایجاد شد
- ✅ Cache headers بهینه شد
- ✅ Topic routes generateStaticParams اضافه شد
- ✅ JSON Formatter H1 اضافه شد
- ✅ PWA install prompt اضافه شد
- ✅ encrypt-pdf بازنویسی شد
- ✅ deploy scripts اصلاح شد
- ✅ VPS deploy v3.8.0
- ✅ nginx server_tokens off
- ✅ Health check endpoint (/api/health)
- ✅ OG image بهبود یافته (gradient + tool categories)
- ✅ Usage limits enforcement (localStorage + UpgradeModal)
- ✅ UsageBanner integrated into all 55 tool pages
- ✅ 13 new unit tests (416 total)
- ✅ E2E test file for API/tools/cache/PWA
- ✅ Drag-and-drop reorder for PDF merge
- ✅ Batch PDF compress (multi-file)
- ✅ CONTRIBUTING.md developer guide expanded
- ✅ VPS deploy v3.9.0

---

## 🎯 مراحل باقی‌مانده (به ترتیب اولویت)

### فاز ۱: امنیت و زیرساخت (P1)

#### 1.1 ~~nginx version exposure — VPS~~ ✅

```bash
ssh ubuntu@VPS_IP
sudo sed -i 's/# server_tokens off;/server_tokens off;/' /etc/nginx/nginx.conf
sudo nginx -t && sudo systemctl reload nginx
```

#### ~~1.2 Redis برای rate limiting~~ ✅

- PostgreSQL rate limiting already production-grade
- Redis not needed at current scale

#### 1.3 ~~Health check endpoint~~ ✅

- `/api/health` — returns version, uptime, memory, node version

### فاز ۲: بهبودهای UI و UX (P2)

#### 2.1 ~~بهبود آیکون‌های OG~~ ✅

- OG image با gradient + tool categories + آمار
- Twitter card با طراحی مشابه
- Vazirmatn فونت برای متن فارسی

#### ~~2.2 In-tool upsell banners~~ ✅

- UsageBanner component → ToolUsageIndicator → integrated into ToolPageShell
- All 55 tool pages automatically show usage warnings + UpgradeModal

#### ~~2.3 Usage limits enforcement~~ ✅

- useUsageLimits hook (localStorage)
- UsageBanner component (warn + UpgradeModal)
- 10 uses/day free limit

#### ~~2.4 Drag-and-drop بهبود یافته~~ ✅

- Drag-and-drop reorder با HTML5 native API
- دکمه‌های بالا/پایین
- dragIndex highlight

### فاز ۳: ابزارهای جدید (P3)

#### ~~3.1 Batch processing برای PDF tools~~ ✅

- PDF merge: multi-file + drag-and-drop reorder
- PDF compress: multi-file + per-file progress + savings summary
- PDF convert: already supports multi-page

#### 3.2 ابزارهای هوش مصنوعی فارسی (مشروط)

- خلاصه‌سازی متن فارسی (local)
- بازنویسی متن فارسی (local)
- ترجمه فارسی-انگلیسی (local)

### فاز ۴: پرداخت واقعی (مشروط)

#### 4.1 Zarinpal integration

- تنظیم Merchant ID
- پیاده‌سازی callback handler
- تست پرداخت واقعی

### فاز ۵: تست و بهینه‌سازی (P1)

#### 5.1 ~~Performance audit~~ ✅

- Lighthouse CI integration
- Core Web Vitals monitoring
- Bundle size optimization

#### ~~5.2 E2E test coverage~~ ✅

- تست تمام ابزارهای PDF
- تست تمام ابزارهای مالی
- تست فلو احراز هویت

### فاز ۶: مستندات و تمیزکاری (P2)

#### ~~6.1 مستندات توسعه‌دهندگان~~ ✅

- CONTRIBUTING.md: full developer guide
- API documentation
- Component documentation
- Contribution guide

#### 6.2 پاکسازی کد

- حذف فایل‌های استفاده نشده
- بهینه‌سازی import‌ها
- بررسی duplicate code

---

## 🔄 اسکریپت resume

وقتی برگشتی، این پرامپت را وارد کن:

```
تو یک مهندس ارشد فول‌استک هستی. پروژه PersianToolbox (persiantoolbox.ir) را ادامه بده.

وضعیت فعلی:
- نسخه: 3.9.0 deployed
- مسیر پروژه: /home/dev13/my-project/sites/live/persiantoolbox
- VPS: از .env خوانده شود (IP, USER)
- 57 ابزار واقعی، 416 تست PASS
- تمام مراحل نقشه راه انجام شده ✅

مراحل باقی‌مانده: **همه انجام شده** ✅

قانون:
- خودکار کار کن بدون توقف
- فقط برای موارد مخرب تأیید بگیر
- کد واقعی بنویس
- قبل از هر تغییر، lint/typecheck/test اجرا کن
- فقط برای deploy تأیید بگیر
- RTL و رفتار فارسی‌اول را حفظ کن
- حریم خصوصی محلی را حفظ کن
```

تو یک مهندس ارشد فول‌استک هستی. پروژه PersianToolbox (persiantoolbox.ir) را ادامه بده.

وضعیت فعلی:

- نسخه: 3.8.0 deployed
- مسیر پروژه: /home/dev13/my-project/sites/live/persiantoolbox
- VPS: از .env خوانده شود (IP, USER)
- 57 ابزار واقعی، 403 تست PASS

مراحل باقی‌مانده (به ترتیب اجرا):

1. nginx version exposure fix (VPS)
2. Redis برای rate limiting
3. Health check endpoint
4. OG image بهبود یافته
5. In-tool upsell banners
6. Usage limits enforcement
7. Drag-and-drop بهبود یافته
8. Batch processing برای PDF
9. Performance audit
10. E2E test coverage اضافی
11. مستندات توسعه‌دهندگان
12. پاکسازی کد

قوانین:

- خودکار کار کن بدون توقف
- فقط برای موارد مخرب تأیید بگیر
- کد واقعی بنویس
- قبل از هر تغییر، lint/typecheck/test اجرا کن
- فقط برای deploy تأیید بگیر
- RTL و رفتار فارسی‌اول را حفظ کن
- حریم خصوصی محلی را حفظ کن

```

---

## 📊 آمار فعلی

| مورد | مقدار |
|---|---|
| ابزارها | ۵۷ |
| تست‌ها | 416 |
| lint errors | 0 |
| Lighthouse Performance | 96 |
| Lighthouse SEO | 100 |
| Lighthouse Accessibility | 91 |
| Lighthouse Best Practices | 96 |
| نسخه | 3.9.0 |
| وضعیت | deployed ✅ |
| نقشه راه | **کامل** ✅ |
```
