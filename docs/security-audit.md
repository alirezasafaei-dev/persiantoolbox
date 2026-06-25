# ممیزی امنیتی

**تاریخ**: 2026-06-22

---

## بررسی‌های انجام‌شده

### ۱. فایل‌های محیطی

- `.env` در `.gitignore` ثبت شده ✅
- `.env.example` و `.env.production.example` با placeholder هستند ✅
- هیچ secret واقعی در فایل‌های نمونه وجود ندارد ✅

### ۲. Security Headers (تایید شد در live site)

| هدر                       | وضعیت                                  |
| ------------------------- | -------------------------------------- |
| Content-Security-Policy   | nonce-based + Enamad trustseal ✅      |
| X-Frame-Options           | DENY ✅                                |
| X-Content-Type-Options    | nosniff ✅                             |
| Strict-Transport-Security | 2 years + preload ✅                   |
| Referrer-Policy           | strict-origin-when-cross-origin ✅     |
| Permissions-Policy        | camera/mic/geo/payment/usb disabled ✅ |

### ۳. CSP جزئیات

```
default-src 'self'
img-src 'self' data: blob: https://trustseal.enamad.ir
font-src 'self' data:
script-src 'self' 'nonce-...'
connect-src 'self'
```

- Enamad trustseal اجازه دارد ✅
- هیچ منبع خارجی دیگری مجاز نیست ✅

### ۴. API Routeها

- `/api/auth/*`: لاگین/لاگاوت/رجیستر با rate limiting ✅
- `/api/admin/*`: نیاز به احراز هویت ✅
- `/api/payments/*`: CSRF protection ✅
- `/api/subscription/webhook`: HMAC signature verification ✅
- `/api/usage/*`: نیاز به احراز هویت ✅

### ۵. Rate Limiting

- PostgreSQL-based rate limiting ✅
- Auth endpoints: 5 تلاش در ۱۵ دقیقه ✅

### ۶. Password Hashing

- async scrypt (غیرblocking) ✅

### ۷. Session Management

- PostgreSQL-based sessions ✅

### ۸. CSRF Protection

- Checkout endpoint دارای CSRF guard ✅

### ۹. nginx

- `server_tokens off` فعال ✅
- www → non-www redirect ✅
- SSL/HTTPS فعال ✅

### ۱۰. Public Directory

- فایل خصوصی وجود ندارد ✅
- فقط assetهای عمومی (فونت، آیکن، OG) ✅

### ۱۱. Sentry Error Monitoring

- Sentry برای کلاینت، سرور و edge فعال ✅
- لاگ‌های خطا به صورت خودکار ارسال می‌شوند ✅
- PII stripping در Sentry فعال ✅

### ۱۲. Push Notifications (VAPID)

- کلیدهای VAPID برای احراز هویت استفاده می‌شوند ✅
- Service Worker برای دریافت نوتیفیکیشن ثبت شده ✅
- اشتراک‌ها در PostgreSQL ذخیره می‌شوند ✅

## ریسک‌های پیدا شده

### ریسک متوسط

1. **درگاه پرداخت واقعی نیست**: Mock adapter استفاده می‌شود — در production نباید نمایش داده شود
2. **history API disabled**: تمام /api/history غیرفعال است — کاربران ممکن است انتظار داشته باشند

### ریسک کم

1. **44 lint warning**: `no-console` در API routes — ممکن است اطلاعات حساس log شود
2. **no-non-null-assertion**: در test files — ریسک امنیتی ندارد

## وضعیت افشای secret

- ✅ هیچ secretی در کد یا Git commit وجود ندارد
- ✅ فایل `.env` gitignored است
- ✅ نمونه env فقط placeholder دارد
- ✅ CSP nonce-based است (نه hardcoded)

## کارهای لازم برای انسان

1. بررسی `.env` روی VPS — مطمئن شوید secretها قوی هستند
2. بررسی Payment webhook secret — آیا قوی است؟
3. بررسی SESSION_SECRET — آیا قوی است؟
4. اجرای `scripts/security/scan-secrets.mjs` برای اسکن خودکار

## پیشنهادهای اصلاحی

1. حذف `console.log` از API routes در production
2. بررسی دوره‌ای secretها (هر ۶ ماه)
3. ~~فعال‌سازی rate limiting Redis-based در صورت نیاز~~ ✅ فعال — Redis rate limiting deployed

## آیا secret rotation لازم است؟

- **در حال حاضر**: خیر — مگر اینکه secretها ضعیف باشند
- **بعد از هر leak احتمالی**: بله — فوراً
- **بهترین практиک**: هر ۶ ماه یکبار rotation
