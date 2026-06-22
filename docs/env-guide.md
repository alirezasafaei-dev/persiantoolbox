# راهنمای متغیرهای محیطی

**تاریخ**: 2026-06-22

---

## فایل‌های مرجع

- `.env.example` — نمونه برای توسعه محلی
- `.env.production.example` — نمونه برای production

## راهنمای متغیرها

### متغیرهای اصلی

| نام                    | کاربرد       | مقدار نمونه                 | Required | امنیت |
| ---------------------- | ------------ | --------------------------- | -------- | ----- |
| `NODE_ENV`             | حالت اجرا    | `production`                | بله      | —     |
| `PORT`                 | پورت سرور    | `3000`                      | بله      | —     |
| `NEXT_PUBLIC_SITE_URL` | آدرس سایت    | `https://persiantoolbox.ir` | بله      | —     |
| `DATABASE_PATH`        | مسیر دیتابیس | `.data/persiantoolbox.db`   | بله      | —     |

### Feature Flags

| نام                                   | کاربرد                       | مقدار نمونه |
| ------------------------------------- | ---------------------------- | ----------- |
| `FEATURE_AUTH_ENABLED`                | فعال‌سازی احراز هویت         | `1`         |
| `FEATURE_ACCOUNT_ENABLED`             | فعال‌سازی حساب کاربری        | `1`         |
| `FEATURE_SUBSCRIPTION_ENABLED`        | فعال‌سازی اشتراک             | `1`         |
| `FEATURE_PLANS_ENABLED`               | فعال‌سازی طرح‌ها             | `1`         |
| `FEATURE_CHECKOUT_ENABLED`            | فعال‌سازی پرداخت             | `1`         |
| `FEATURE_DASHBOARD_ENABLED`           | فعال‌سازی داشبورد            | `1`         |
| `FEATURE_HISTORY_ENABLED`             | فعال‌سازی تاریخچه            | `1`         |
| `FEATURE_ADS_ENABLED`                 | فعال‌سازی تبلیغات            | `1`         |
| `FEATURE_DEVELOPERS_ENABLED`          | فعال‌سازی صفحه توسعه‌دهندگان | `1`         |
| `FEATURE_SUPPORT_ENABLED`             | فعال‌سازی پشتیبانی           | `1`         |
| `FEATURE_ADMIN_SITE_SETTINGS_ENABLED` | فعال‌سازی تنظیمات ادمین      | `1`         |
| `FEATURE_ADMIN_MONETIZATION_ENABLED`  | فعال‌سازی درآمدزایی ادمین    | `1`         |

### Secretها (نمونه امن — هرگز مقادیر واقعی را commit نکنید)

| نام                    | کاربرد                  | مقدار نمونه  |
| ---------------------- | ----------------------- | ------------ |
| `SESSION_TTL_SECONDS`  | مدت اعتبار session      | `604800`     |
| `RATE_LIMIT_ENABLED`   | فعال‌سازی rate limiting | `true`       |
| `RATE_LIMIT_WINDOW_MS` | پنجره rate limit        | `60000`      |
| `CSP_MODE`             | حالت CSP                | `production` |

### متغیرهای احتمالی (اختیاری)

| نام                                    | کاربرد             | مقدار نمونه                        |
| -------------------------------------- | ------------------ | ---------------------------------- |
| `PAYMENT_WEBHOOK_SECRET`               | رمز webhook پرداخت | `replace_with_real_webhook_secret` |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | تایید گوگل         | `replace_with_verification_code`   |
| `NEXT_PUBLIC_ANALYTICS_ID`             | شناسه آنالیتیکس    | `replace_with_analytics_id`        |

## چطور مقادیر واقعی را جایگزین کنیم

1. فایل `.env.production.example` را کپی کنید:

   ```bash
   cp .env.production.example .env.production
   ```

2. مقادیر واقعی را جایگزین کنید (از ویرایشگر متن استفاده کنید، نه Git)

3. فایل را به سرور منتقل کنید:
   ```bash
   scp .env.production user@server:/path/to/project/.env
   ```

## انتقال امن `.env` به سرور

```bash
# انتقال فایل
scp .env user@server:/home/ubuntu/persiantoolbox/.env

# SSH به سرور
ssh user@server

# تنظیم permission
chmod 600 /home/ubuntu/persiantoolbox/.env

# بررسی
ls -la /home/ubuntu/persiantoolbox/.env
```

## Restart سرویس

```bash
# PM2
pm2 restart persiantoolbox
pm2 status

# بررسی لاگ‌ها
pm2 logs persiantoolbox --lines 50
```

## بررسی عدم ورود secret به Git

```bash
# جستجو در تاریخچه Git
git log --all -p | grep -i "password\|secret\|api_key\|token" | head -10

# اگر چیزی پیدا شد، فوراً rotate کنید
```
