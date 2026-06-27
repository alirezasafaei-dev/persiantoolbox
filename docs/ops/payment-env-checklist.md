# Payment Environment Checklist — PersianToolbox

**Date:** 2026-06-27

## Required Environment Variables

### Production (VPS)

| Variable                       | Required | Status            | Notes                                |
| ------------------------------ | -------- | ----------------- | ------------------------------------ |
| `NEXT_PUBLIC_SITE_URL`         | YES      | ✅ Set            | `https://persiantoolbox.ir`          |
| `ZARINPAL_MERCHANT_ID`         | YES      | ✅ Set            | Production merchant ID               |
| `ZARINPAL_MODE`                | YES      | ✅ Set            | `production`                         |
| `EXPORT_TOKEN_SECRET`          | YES      | ⚠️ NOT SET        | **Must set for export verification** |
| `NEXTAUTH_SECRET`              | YES      | ⚠️ NOT SET        | Used for auth sessions               |
| `FEATURE_CHECKOUT_ENABLED`     | Optional | ✅ Default `true` | Enables checkout flow                |
| `FEATURE_SUBSCRIPTION_ENABLED` | Optional | ✅ Default `true` | Enables subscription flow            |

### Development (Local)

| Variable               | Required | Status               | Notes                       |
| ---------------------- | -------- | -------------------- | --------------------------- |
| `NEXT_PUBLIC_SITE_URL` | YES      | ✅ Set               | `https://persiantoolbox.ir` |
| `ZARINPAL_MERCHANT_ID` | YES      | ✅ Set               | Production merchant ID      |
| `ZARINPAL_MODE`        | YES      | ✅ Set               | `production`                |
| `EXPORT_TOKEN_SECRET`  | Optional | ⚠️ Uses dev fallback | OK for development          |
| `NEXTAUTH_SECRET`      | Optional | ⚠️ Uses dev fallback | OK for development          |

## Action Items

1. **CRITICAL:** Set `EXPORT_TOKEN_SECRET` on VPS

   ```bash
   ssh ubuntu@193.93.169.32
   echo 'EXPORT_TOKEN_SECRET=<random-secret>' >> /home/ubuntu/persiantoolbox/.env
   pm2 restart persiantoolbox
   ```

2. **CRITICAL:** Set `NEXTAUTH_SECRET` on VPS (if not already set)

   ```bash
   ssh ubuntu@193.93.169.32
   echo 'NEXT_AUTH_SECRET=<random-secret>' >> /home/ubuntu/persiantoolbox/.env
   pm2 restart persiantoolbox
   ```

3. **Verify:** After setting secrets, test export token endpoint:

   ```bash
   curl -X POST https://persiantoolbox.ir/api/export/token \
     -H "Content-Type: application/json" \
     -d '{"product":"business"}'
   ```

   Expected: `{"ok":false,"error":"برای دریافت خروجی حرفه‌ای باید وارد شوید."}`

4. **Monitor:** Check PM2 logs for export token issuance:
   ```bash
   pm2 logs persiantoolbox --lines 50 | grep "export"
   ```

## Security Notes

- Never print or commit secret values
- Use `openssl rand -hex 32` to generate secrets
- Rotate secrets periodically
- Keep `.env` files outside git (already excluded)
