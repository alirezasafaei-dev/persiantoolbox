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

پس از DNS صحیح:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d persian-tools.ir -d www.persian-tools.ir -d staging.persian-tools.ir
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
4. production قبل از deploy، gateهای `ci:quick`, `ci:contracts`, `deploy:readiness:run`, `release:rc:run`, `release:launch:run` را اجرا می‌کند.
5. بعد از deploy، گزارش post-deploy به‌صورت خودکار تولید می‌شود و اگر smoke/security fail شود workflow شکست می‌خورد.
6. در صورت fail شدن مرحله post-deploy در production، rollback خودکار به release قبلی اجرا می‌شود.

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
  --base-url=https://persian-tools.ir \
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
