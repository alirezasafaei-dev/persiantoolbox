# چک‌لیست کارهایی که انسان باید انجام دهد

**تاریخ**: 2026-06-22

---

## کارهایی که Agent نمی‌تواند انجام دهد

### ۱. بررسی بصری سایت در مرورگر

- **چرا**: Agent فقط می‌تواند HTTP status و HTML خام بررسی کند
- **دستور**: در مرورگر به `https://persiantoolbox.ir/` بروید
- **چک کنید**: آیا CSS اعمال شده؟ آیا فونت‌ها load می‌شوند؟ آیا RTL صحیح است؟

### ۲. بررسی PWA offline

- **چرا**: نیاز به disconnect اینترنت دارد
- **دستور**: بعد از load سایت، اینترنت را قطع کنید
- **چک کنید**: آیا صفحه offline نمایش داده می‌شود؟

### ۳. بررسی Dark Mode

- **چرا**: نیاز به toggle در مرورگر دارد
- **دستور**: toggle dark mode را در navigation فشار دهید
- **چک کنید**: آیا رنگ‌ها صحیح تغییر می‌کنند؟

### ۴. بررسی mobile responsive

- **چرا**: نیاز به viewport موبایل دارد
- **دستور**: DevTools → Toggle device toolbar → iPhone/Android
- **چک کنید**: آیا layout روی موبایل صحیح است؟

### ۵. اجرای Lighthouse audit

- **دستور**: DevTools → Lighthouse → Analyze page load
- **نتیجه موفق**: Performance > 90, SEO > 95, Accessibility > 90

### ۶. بررسی payment flow

- **چرا**: درگاه پرداخت واقعی نیست
- **دستور**: روی دکمه ارتقا کلیک کنید
- **چک کنید**: آیا پیام مناسبی نمایش داده می‌شود؟

### ۷. بررسی search page

- **دستور**: به `/search` بروید و جستجو کنید
- **چک کنید**: آیا نتایج نمایش داده می‌شوند؟

### ۸. اجرای E2E tests

- **دستور**: `pnpm test:e2e`
- **نکته**: نیاز به dev server دارد

## دستورهای دقیق برای اجرا روی VPS

### بررسی وضعیت سرویس

```bash
ssh ubuntu@<VPS_IP>
pm2 status
pm2 logs persiantoolbox --lines 20
```

### بررسی nginx

```bash
sudo nginx -t
sudo systemctl status nginx
```

### بررسی SSL

```bash
sudo certbot certificates
```

### بررسی port

```bash
curl -s http://localhost:3000/api/health
```

### Restart سرویس

```bash
pm2 restart persiantoolbox
```

### Rollback

```bash
# اگر نسخه قبلی stable بود:
cd /home/ubuntu/persiantoolbox
git log --oneline -5  # پیدا کردن commit قبلی
git checkout <commit-before-deploy>
pnpm install --ignore-scripts
NODE_ENV=production npx next build
cp -r .next/static .next/standalone/.next/static
cp -r public .next/standalone/public
cd .next/standalone && pm2 restart persiantoolbox
```

## چطور production بعد از deploy بررسی شود

1. `curl -s https://persiantoolbox.ir/api/health` — باید version جدید را نشان دهد
2. `curl -s -o /dev/null -w "%{http_code}" https://persiantoolbox.ir/` — باید 200 باشد
3. `curl -s -o /dev/null -w "%{http_code}" https://persiantoolbox.ir/_next/static/chunks/44htpu8mp80nb.css` — باید 200 باشد
4. در مرورگر سایت را باز کنید و CSS/fonks را بررسی کنید
