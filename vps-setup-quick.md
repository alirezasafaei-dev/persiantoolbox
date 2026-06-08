# VPS Setup - Quick Manual Instructions

## اطلاعات VPS

- IP: 193.93.169.247
- User: ubuntu
- Port: 22
- Password: ArAd@#!23662366

## مرحله ۱: اتصال به VPS و تنظیم SSH Key

### ۱.۱ اتصال به VPS

```bash
ssh ubuntu@193.93.169.247
# رمز عبور: ArAd@#!23662366
```

### ۱.۲ ایجاد دایرکتوری SSH و کپی کلید عمومی

```bash
# در داخل VPS:
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# کلید عمومی خود را در فایل authorized_keys قرار دهید
nano ~/.ssh/authorized_keys

# کلید عمومی را از خروجی اسکریپت setup-ssh-key-manual.sh کپی کنید:
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQDD9avbD5uIgMGmEB2GIb2LdIxas4+YzRv6xLX0w6+fCyCzhvduRq/BUj189qsQ2+4qGTsn3Qh3BN1zbFEM160lrmGKvKiOjN3FaLQXxdQU2gpUBrGbmRjQnwg3pHjU0Y6S+iANe8SvQOPDP9CEaAJaJuSPbbayn/gK2LM+cQm9+NjJ3xoCdKr3k15a+tKTmXXmH5gYzrbZrBPBSURxfRN/48hVtXSS6wF9sAc9zcF88sYxeU1SDOeoWYAwpXEJZvsjunyCXuJd0wlYB+MSPT0DvXgEKSoqiJrKWXCVoBzW2pyoJeh77R7dGpi4SH/NPlXAtdvXF6MnXwE7bsphTuaoMXD2dED1mRYR1vhy54k6hrk86i9bLiUZffCc1bWSOxxU0J075SwFpNbepc21MDjwUvChMsX73ELo89vR1/DmNhuo7KJH619/U/1oMKo5/KB6XU61XXbNvpUyyuN0SOM1ehnvlMBpHEzSrFRO5aBqI7VJ7d5CiC7GDzKbEgy8q6/TA1F9GW/6ct90NWfnaSV5Ws/GkNY9EX0oJ2FOppeWazjRVZznw346HM1ew+vphWvk1XLtKJZ9N1I1lgrbZRrHGc2fMhyytIFPjjLIdFH9qLS3IHi3fUBYSP+zjECtTV+9/TXM5YhOZ99KjtZQp1e1OOGD1jTvLlOiyfDJwJRVJQ== persiantoolbox@asdev

# تنظیم مجوزها
chmod 600 ~/.ssh/authorized_keys
```

### ۱.۳ تست اتصال بدون رمز عبور

```bash
# از سیستم محلی:
ssh ubuntu@193.93.169.247
```

## مرحله ۲: آماده‌سازی VPS

### ۲.۱ به‌روزرسانی سیستم

```bash
sudo apt update && sudo apt upgrade -y
```

### ۲.۲ نصب Node.js (اگر نصب نیست)

```bash
# نصب Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# بررسی نسخه
node --version  # باید 20 یا بالاتر باشد
```

### ۲.۳ نصب pnpm

```bash
npm install -g pnpm
pnpm --version
```

### ۲.۴ نصب PM2

```bash
npm install -g pm2
```

## مرحله ۳: کپی و دیپلوی پروژه

### ۳.۱ ایجاد دایرکتوری پروژه در VPS

```bash
mkdir -p ~/persiantoolbox
cd ~/persiantoolbox
```

### ۳.۲ کپی کردن پروژه به VPS

**از سیستم محلی:**

```bash
# با rsync (پیشنهاد می‌شود)
rsync -avz --progress ~/my-project/sites/live/persiantoolbox/ ubuntu@193.93.169.247:~/persiantoolbox/

# یا با scp
scp -r ~/my-project/sites/live/persiantoolbox/* ubuntu@193.93.169.247:~/persiantoolbox/
```

**یا از طریق git در VPS:**

```bash
# در داخل VPS:
cd ~/persiantoolbox
git clone https://github.com/alirezasafaei-dev/persiantoolbox.git .
git checkout main
```

### ۳.۳ کپی فایل .env.production

```bash
# در داخل VPS:
nano .env.production

# محتوا را از فایل محلی .env.production کپی کنید
# یا از اسکریپت deploy-vps.sh کپی کنید
```

### ۳.۴ نصب dependencyها

```bash
pnpm install
```

### ۳.۵ ساخت production bundle

```bash
pnpm build
```

### ۳.۶ ایجاد دایرکتوری data

```bash
mkdir -p .data
```

## مرحله ۴: اجرا با PM2

### ۴.۱ ایجاد فایل ecosystem PM2

```bash
nano ecosystem.config.cjs
```

محتوا:

```javascript
module.exports = {
  apps: [
    {
      name: 'persiantoolbox',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      cwd: '.',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
    },
  ],
};
```

### ۴.2 ایجاد دایرکتوری logs

```bash
mkdir -p logs
```

### ۴.۳ اجرای برنامه

```bash
pm2 start ecosystem.config.cjs
pm2 save
```

### ۴.۴ بررسی وضعیت

```bash
pm2 status
pm2 logs persiantoolbox
```

## مرحله ۵: تنظیم systemd برای auto-start

```bash
sudo tee /etc/systemd/system/persiantoolbox.service <<'EOF'
[Unit]
Description=PersianToolbox - Persian Online Tools
After=network.target

[Service]
Type=forking
User=ubuntu
WorkingDirectory=/home/ubuntu/persiantoolbox
ExecStart=/usr/bin/pm2 start persiantoolbox --no-daemon
ExecStop=/usr/bin/pm2 stop persiantoolbox
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable persiantoolbox
sudo systemctl start persiantoolbox
```

## مرحله ۶: تنظیم Firewall

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3000/tcp
sudo ufw enable
```

## مرحله ۷: تست برنامه

```bash
# تست از داخل VPS
curl http://localhost:3000

# تست از خارج
curl http://193.93.169.247:3000
```

## مرحله ۸: تنظیم Nginx (اختیاری اما توصیه می‌شود)

### ۸.۱ نصب Nginx

```bash
sudo apt install nginx -y
```

### ۸.۲ تنظیم Nginx

```bash
sudo nano /etc/nginx/sites-available/persiantoolbox
```

محتوا:

```nginx
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
```

### ۸.۳ فعال‌سازی سایت

```bash
sudo ln -s /etc/nginx/sites-available/persiantoolbox /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## مرحله ۹: تنظیم SSL (اختیاری اما توصیه می‌شود)

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d persiantoolbox.ir -d www.persiantoolbox.ir
```

## مدیریت و مانیتورینگ

### بررسی وضعیت

```bash
pm2 status
pm2 monit
pm2 logs persiantoolbox
```

### ریستارت

```bash
pm2 restart persiantoolbox
# یا
sudo systemctl restart persiantoolbox
```

### آپدیت

```bash
cd ~/persiantoolbox
git pull
pnpm install
pnpm build
pm2 restart persiantoolbox
```

## نکات مهم

1. ✅ پس از دیپلوی موفق، می‌توانید password authentication را غیرفعال کنید
2. ✅ همیشه backup از .data داشته باشید
3. ✅ monitoring و alerting را فعال کنید
4. ✅ SSL را برای production فعال کنید
5. ✅ firewall را به سخت‌گیری تنظیم کنید
