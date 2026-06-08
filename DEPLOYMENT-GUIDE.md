# PersianToolbox VPS Deployment Guide

این راهنما برای دیپلوی پروژه PersianToolbox روی VPS جدید طراحی شده است.

## پیش‌نیازها

- **VPS جدید:** با IP `193.93.169.247` و کاربر `ubuntu`
- **دسترسی SSH:** با رمز عبور یا کلید خصوصی
- **Node.js:** نسخه 20 یا بالاتر روی VPS
- **پهنای باند:** برای تمام ابزارها و assets

## مرحله ۱: تنظیم SSH Key برای اتصال بدون رمز عبور

### گزینه A: استفاده از اسکریپت خودکار (توصیه می‌شود)

```bash
# ابتدا اسکریپت SSH key setup را اجرا کنید
./setup-ssh-key-manual.sh

# این اسکریپت:
# 1. جفت کلید SSH را ایجاد می‌کند
# 2. کلید عمومی را نشان می‌دهد
# 3. دستورالعمل کپی کردن کلید به VPS را می‌دهد
# 4. اتصال بدون رمز عبور را تست می‌کند
# 5. SSH config را برای اتصال آسان تنظیم می‌کند
```

### گزینه B: تنظیم دستی

```bash
# 1. ایجاد کلید SSH
ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa -N "" -C "persiantoolbox@$(hostname)"

# 2. کپی کردن کلید عمومی به VPS
ssh-copy-id ubuntu@193.93.169.247

# یا به صورت دستی:
ssh ubuntu@193.93.169.247 "mkdir -p ~/.ssh && echo '$(cat ~/.ssh/id_rsa.pub)' >> ~/.ssh/authorized_keys && chmod 700 ~/.ssh && chmod 600 ~/.ssh/authorized_keys"

# 3. تست اتصال بدون رمز عبور
ssh ubuntu@193.93.169.247
```

## مرحله ۲: آماده‌سازی محیط Production

### بررسی فایل .env

فایل `.env` را بررسی کنید که شامل اطلاعات VPS باشد:

```bash
IP=193.93.169.247
USER=ubuntu
PORT=22
PASSWORD=ArAd@#!23662366
```

### بررسی فایل .env.production

فایل `.env.production` از قبل ایجاد شده و شامل تنظیمات production است.

## مرحله ۳: دیپلوی روی VPS

### اجرای اسکریپت دیپلوی

```bash
# اسکریپت deployment را اجرا کنید
./deploy-vps.sh

# این اسکریپت:
# 1. فایل .env.production را به VPS کپی می‌کند
# 2. dependencyها را نصب می‌کند
# 3. production bundle را می‌سازد
# 4. دایرکتوری data را ایجاد می‌کند
# 5. PM2 را برای process management تنظیم می‌کند
# 6. systemd service را برای auto-start تنظیم می‌کند
# 7. firewall را پیکربندی می‌کند
```

## مرحله ۴: احراز هویت دستی (در صورت عدم موفقیت اسکریپت)

اگر اسکریپت خودکار کار نکرد، می‌توانید این مراحل را دستی انجام دهید:

```bash
# 1. اتصال به VPS
ssh ubuntu@193.93.169.247

# 2. ایجاد پوشه پروژه
mkdir -p ~/persiantoolbox
cd ~/persiantoolbox

# 3. کپی کردن پروژه به VPS
# از سیستم محلی:
rsync -avz --progress ~/my-project/sites/live/persiantoolbox/ ubuntu@193.93.169.247:~/persiantoolbox/

# یا از داخل VPS با git:
git clone https://github.com/alirezasafaei-dev/persiantoolbox.git .
git checkout main

# 4. نصب dependencyها
npm install -g pnpm
pnpm install

# 5. کپی کردن فایل .env.production
# (از اسکریپت محلی یا به صورت دستی)

# 6. ساخت production bundle
pnpm build

# 7. ایجاد دایرکتوری data
mkdir -p .data

# 8. نصب و تنظیم PM2
npm install -g pm2
pm2 start ecosystem.config.cjs
pm2 save

# 9. تنظیم systemd service
sudo systemctl enable persiantoolbox
sudo systemctl start persiantoolbox

# 10. تنظیم firewall
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## مرحله ۵: تنظیم Nginx (اختیاری اما توصیه می‌شود)

برای بازتاب SSL و load balancing:

```bash
# 1. نصب Nginx
sudo apt update
sudo apt install nginx

# 2. ایجاد فایل پیکربندی
sudo nano /etc/nginx/sites-available/persiantoolbox

# 3. محتوا:
server {
    listen 80;
    server_name persiantoolbox.ir www.persiantoolbox.ir;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# 4. فعال‌سازی سایت
sudo ln -s /etc/nginx/sites-available/persiantoolbox /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## مرحله ۶: تنظیم SSL با Let's Encrypt (اختیاری اما توصیه می‌شود)

```bash
# 1. نصب Certbot
sudo apt install certbot python3-certbot-nginx

# 2. دریافت و نصب SSL
sudo certbot --nginx -d persiantoolbox.ir -d www.persiantoolbox.ir

# 3. تنظیم auto-renewal
sudo certbot renew --dry-run
```

## مرحله ۷: تنظیم DNS

دامنه `persiantoolbox.ir` را به VPS IP `193.93.169.247` point کنید:

```
A Record: persiantoolbox.ir → 193.93.169.247
A Record: www.persiantoolbox.ir → 193.93.169.247
```

## مانیتورینگ و مدیریت

### بررسی وضعیت PM2

```bash
ssh persiantoolbox 'pm2 status'
ssh persiantoolbox 'pm2 monit'
ssh persiantoolbox 'pm2 logs persiantoolbox'
```

### ریستارت سرویس

```bash
ssh persiantoolbox 'pm2 restart persiantoolbox'
# یا
ssh persiantoolbox 'sudo systemctl restart persiantoolbox'
```

### آپدیت پروژه

```bash
# 1. آپدیت در VPS
ssh persiantoolbox 'cd ~/persiantoolbox && git pull'

# 2. نصب dependencyهای جدید
ssh persiantoolbox 'cd ~/persiantoolbox && pnpm install'

# 3. ساخت مجدد
ssh persiantoolbox 'cd ~/persiantoolbox && pnpm build'

# 4. ریستارت PM2
ssh persiantoolbox 'pm2 restart persiantoolbox'
```

## مشکلات رایج و راهکارها

### مشکل: "Permission denied" برای SSH

**راهکار:**

```bash
# بررسی و تنظیم مجوزهای SSH
chmod 700 ~/.ssh
chmod 600 ~/.ssh/id_rsa
chmod 644 ~/.ssh/id_rsa.pub
chmod 600 ~/.ssh/authorized_keys
```

### مشکل: "pm2: command not found"

**راهکار:**

```bash
# نصب PM2 به صورت global
npm install -g pm2
# یا از طریق pnpm
pnpm add -g pm2
```

### مشکل: Port 3000 باز نیست

**راهکار:**

```bash
# باز کردن پورت در firewall
sudo ufw allow 3000/tcp
sudo ufw reload
```

### مشکل: Memory不足

**راهکار:**

```bash
# تنظیم swap در VPS
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

## امنیت

### غیرفعال کردن رمز عبور SSH (بعد از دیپلوی موفق)

```bash
# 1. ویرایش sshd_config
sudo nano /etc/ssh/sshd_config

# 2. تنظیم:
PasswordAuthentication no
PubkeyAuthentication yes

# 3. ریستارت SSH
sudo systemctl restart sshd
```

### تنظیم firewall محدود

```bash
# فقط پورت‌های ضروری را باز کنید
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw enable
```

## پشتیبان‌گیری (Backup)

### Backup database و data

```bash
# ایجاد backup script
cat > backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/ubuntu/backups"
mkdir -p $BACKUP_DIR

# Backup database
cp ~/persiantoolbox/.data/persiantoolbox.db $BACKUP_DIR/persiantoolbox_$DATE.db

# Backup data files
tar -czf $BACKUP_DIR/persiantoolbox_data_$DATE.tar.gz ~/persiantoolbox/.data/

# حذف backupهای قدیمی (بیشتر از 7 روز)
find $BACKUP_DIR -mtime +7 -delete
EOF

chmod +x backup.sh
```

### تنظیم cron برای backup خودکار

```bash
# اضافه کردن به cron (روزانه ساعت 2 صبح)
crontab -e
# اضافه کردن:
0 2 * * * /home/ubuntu/backup.sh
```

## فایل‌های مهم

- `.env` - اطلاعات اتصال VPS
- `.env.production` - تنظیمات production
- `deploy-vps.sh` - اسکریپت دیپلوی خودکار
- `setup-ssh-key-manual.sh` - اسکریپت تنظیم SSH key
- `.archive/` - فایل‌های منسوخ (backup)

## پشتیبانی

در صورت بروز مشکل:

1. لاگ‌های PM2 را بررسی کنید: `pm2 logs persiantoolbox`
2. لاگ‌های systemd را بررسی کنید: `sudo journalctl -u persiantoolbox`
3. لاگ‌های Nginx را بررسی کنید: `sudo tail -f /var/log/nginx/error.log`
4. وضعیت build را بررسی کنید: `pnpm build --debug`

## نکات مهم

1. ✅ همیشه قبل از دیپلوی production، environment را تست کنید
2. ✅ از SSH key به جای رمز عبور استفاده کنید
3. ✅ backupهای منظم داشته باشید
4. ✅ firewall را فعال نگه دارید
5. ✅ SSL را برای production فعال کنید
6. ✅ monitoring را برای سلامت سرویس فعال کنید
