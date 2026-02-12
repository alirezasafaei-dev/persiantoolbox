# Runbook استقرار روی VPS (Ubuntu 22.04 + PM2 + Nginx)

> آخرین به‌روزرسانی: 2026-02-11

این runbook برای استقرار `staging -> production` با GitHub Actions + SSH است.

## 1) پیش‌نیازهای سرور

```bash
sudo apt update
sudo apt install -y nginx postgresql postgresql-contrib curl git rsync ufw fail2ban

# Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# pnpm + pm2
sudo corepack enable
corepack prepare pnpm@9.15.0 --activate
sudo npm install -g pm2
```

جایگزین سریع (همه مراحل پایه بالا):

```bash
sudo DEPLOY_USER=deploy BASE_DIR=/var/www/persian-tools bash scripts/deploy/bootstrap-ubuntu-vps.sh
```

## 2) ساخت کاربر deploy و مسیرها

```bash
sudo adduser --disabled-password --gecos "" deploy
sudo mkdir -p /var/www/persian-tools/{releases,current,shared/env,shared/logs,tmp}
sudo chown -R deploy:deploy /var/www/persian-tools
```

برای چندسایته (recommended):

- برای هر پروژه یک base-dir جدا نگه دارید:
  - Persian Tools: `/var/www/persian-tools`
  - My Portfolio: `/var/www/my-portfolio`
- برای هر پروژه پورت staging/production جدا تعریف کنید.
  - Persian Tools: `3001` / `3000`
  - My Portfolio: `3011` / `3010`

## 3) PostgreSQL (روی همان VPS)

```bash
sudo -u postgres psql <<'SQL'
CREATE USER persian_tools_staging WITH ENCRYPTED PASSWORD 'change_staging';
CREATE USER persian_tools_prod WITH ENCRYPTED PASSWORD 'change_prod';

CREATE DATABASE persian_tools_staging OWNER persian_tools_staging;
CREATE DATABASE persian_tools_prod OWNER persian_tools_prod;
SQL
```

## 4) تنظیم Nginx

```bash
sudo cp ops/nginx/persian-tools.conf /etc/nginx/sites-available/persian-tools.conf
sudo ln -s /etc/nginx/sites-available/persian-tools.conf /etc/nginx/sites-enabled/persian-tools.conf
sudo nginx -t
sudo systemctl reload nginx
```

حالت scalable برای چند پروژه:

```bash
sudo pnpm deploy:nginx:provision -- \
  --app-slug persian-tools \
  --prod-domain persiantoolbox.ir \
  --staging-domain staging.persiantoolbox.ir \
  --prod-port 3000 \
  --staging-port 3001
```

نمونه برای `my_portfolio`:

```bash
sudo pnpm deploy:nginx:provision -- \
  --app-slug my-portfolio \
  --prod-domain <portfolio-domain> \
  --staging-domain staging.<portfolio-domain> \
  --prod-port 3010 \
  --staging-port 3011
```

پس از DNS صحیح:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d persiantoolbox.ir -d www.persiantoolbox.ir -d staging.persiantoolbox.ir
```

## 5) فایل‌های env

- از `env.staging.example` و `env.production.example` به عنوان قالب استفاده کنید.
- نسخه واقعی را base64 کنید و در GitHub Secrets بگذارید.

```bash
pnpm deploy:env:encode -- .env.staging.real
pnpm deploy:env:encode -- .env.production.real
```

## 6) GitHub Secrets موردنیاز

- `DEPLOY_SSH_HOST`
- `DEPLOY_SSH_PORT`
- `DEPLOY_SSH_USER`
- `DEPLOY_SSH_KEY`
- `STAGING_ENV_FILE_B64`
- `PRODUCTION_ENV_FILE_B64`

## 7) گردش استقرار

1. `deploy-staging.yml` روی push به `main` اجرا می‌شود.
2. deploy staging، migration، health check و prune release را انجام می‌دهد.
3. بعد از تایید staging، `deploy-production.yml` به صورت دستی اجرا می‌شود.
   - اگر DNS هنوز در حال انتشار است، می‌توانید موقتاً `post_report_strict=false` بگذارید تا دیپلوی انجام شود ولی گزارش post-deploy workflow را fail نکند.
   - در همین حالت، `base_url` را روی دامنه نهایی نگه دارید و پس از فعال شدن DNS یک اجرای مجدد با `post_report_strict=true` انجام دهید.
4. production قبل از deploy، gateهای `ci:quick`, `ci:contracts`, `deploy:readiness:run`, `release:rc:run`, `release:launch:run` را اجرا می‌کند.
5. بعد از deploy، گزارش post-deploy به‌صورت خودکار تولید می‌شود و اگر smoke/security fail شود workflow شکست می‌خورد.
   - گزارش post-deploy دارای retry/backoff داخلی برای خطاهای موقت شبکه است.
   - هنگام `base_url` روی apex (مثل `https://persiantoolbox.ir`) اسکریپت در صورت خطای موقت، fallback روی `www` را هم بررسی می‌کند.
6. در صورت fail شدن مرحله post-deploy در production، rollback خودکار به release قبلی اجرا می‌شود.
   - در rollback خودکار، releaseهای فاقد `ecosystem.config.cjs` نادیده گرفته می‌شوند و release معتبر بعدی انتخاب می‌شود.

برای deploy پروژه دوم (`my_portfolio`):

1. در ریپوی `my_portfolio` همان workflow deploy را با این مقادیر تنظیم کنید:
   - `APP_SLUG=my-portfolio`
   - `DEPLOY_BASE_DIR=/var/www/my-portfolio`
2. Secrets همان VPS را با env مخصوص همان پروژه ست کنید.
3. staging و production روی پورت‌های جدا (مثال: `3011/3010`) اجرا شوند.

## 8) rollback

روی سرور:

```bash
sudo -u deploy bash /var/www/persian-tools/current/production/ops/deploy/rollback.sh \
  --env production \
  --base-dir /var/www/persian-tools
```

یا برای release مشخص:

```bash
sudo -u deploy bash /var/www/persian-tools/current/production/ops/deploy/rollback.sh \
  --env production \
  --base-dir /var/www/persian-tools \
  --target-release production-<release-id>
```

## 9) Post-deploy گزارش اجباری

بعد از هر deploy production:

- مسیرهای smoke: `/`, `/tools`, `/loan`, `/salary`, `/date-tools`, `/offline`
- مسیر ادمین: `/admin/site-settings`
- گزارش: یک فایل جدید بر اساس `docs/deployment/reports/post-deploy-report-template.md`

نمونه تولید گزارش نیمه‌خودکار:

```bash
pnpm deploy:post:report -- \
  --base-url=https://persiantoolbox.ir \
  --environment=production \
  --git-ref=v2.0.0 \
  --workflow-run-url=https://github.com/<org>/<repo>/actions/runs/<id> \
  --deployer=<name>
```

## 10) بکاپ دیتابیس (حداقل)

Cron روزانه (نمونه):

```bash
0 2 * * * pg_dump -U persian_tools_prod -h 127.0.0.1 persian_tools_prod | gzip > /var/backups/persian-tools/prod-$(date +\%F).sql.gz
```

Retention حداقل 14 روز نگه داشته شود.
