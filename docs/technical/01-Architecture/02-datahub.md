# PTB-ARC-002 — DataHub (به‌روزرسانی داده معتبر بدون شکستن Local‑First)

## هدف
امکان آپدیت خودکار داده‌های حساس (مثلاً قوانین حقوق/مالیات) با این شروط:
- کلاینت هیچ اتصال خارجی نداشته باشد.
- در قطع اینترنت جهانی/تحریم، سیستم با آخرین داده معتبر کار کند یا پیام توقف بدهد.

## خروجی
- یک Endpoint داخلی: `GET /api/data/salary-laws`
- یک ذخیره‌ساز (DB یا فایل) برای cache داده
- یک مکانیزم update (Cron/Job) که در صورت دسترسی، داده را به‌روزرسانی کند
- UX پیام‌رسانی stale/disabled

## قرارداد API (Contract)
پاسخ باید شامل data و meta باشد:

```json
{
  "data": { },
  "meta": {
    "source": "string",
    "version": "string",
    "lastSuccessfulFetch": "YYYY-MM-DD",
    "stale": true,
    "staleReason": "network_blocked|source_down|unknown",
    "expiresAt": "YYYY-MM-DD",
    "checksum": "string"
  }
}
```

### قوانین
- `lastSuccessfulFetch` باید همیشه معتبر باشد وقتی data موجود است.
- اگر data موجود نیست: `data=null` و `meta` باید توضیح بدهد چرا.
- `checksum` برای تشخیص corruption/rollback استفاده شود.

## ذخیره‌سازی داده
یکی از این دو راه را انتخاب کنید (به اولویت اجرا):
1) **File-based cache**: JSON در مسیر server (ساده، سریع)
2) **SQLite/Postgres**: اگر چند dataset و تاریخچه لازم است

## Update Strategy (بدون زمان‌بندی)
- یک job `updateSalaryLaws()` پیاده‌سازی شود که:
  1) از منبع معتبر fetch کند (server-side)
  2) validate schema انجام دهد
  3) checksum تولید کند
  4) cache را atomically جایگزین کند
- اگر fetch شکست خورد: cache قبلی دست‌نخورده بماند.

## UX رفتار کلاینت
- هنگام نمایش خروجی Salary:
  - اگر `stale=false`: نمایش “آخرین بروزرسانی: <date>”
  - اگر `stale=true`: نمایش پیام هشدار کوچک + تاریخ
  - اگر `data=null`: نمایش خطای کنترل‌شده (ابزار موقتاً در دسترس نیست)

## معیار پذیرش
- با قطع اینترنت جهانی سرور، ابزار Salary با آخرین داده cache کار کند.
- UI تاریخ آخرین بروزرسانی را نشان دهد.
- اگر cache حذف شد/خراب شد، ابزار پیام توقف استاندارد بدهد.
