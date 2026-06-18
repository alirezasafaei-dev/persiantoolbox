#!/bin/bash
# Complete VPS Deployment - Run this ON THE VPS
set -e

echo "🚀 PersianToolbox VPS Deployment - Run on VPS"
echo "=============================================="

# Check if running as correct user
if [ "$USER" != "ubuntu" ]; then
    echo "⚠️  Please run as ubuntu user or modify script accordingly"
fi

# Step 1: Update system
echo "📦 Step 1: Updating system..."
sudo apt update && sudo apt upgrade -y

# Step 2: Install Node.js 20
echo "📥 Step 2: Installing Node.js 20..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi
node --version
npm --version

# Step 3: Install pnpm
echo "📥 Step 3: Installing pnpm..."
if ! command -v pnpm &> /dev/null; then
    npm install -g pnpm
fi
pnpm --version

# Step 4: Install PM2
echo "📥 Step 4: Installing PM2..."
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
fi
pm2 --version

# Step 5: Create project directory
echo "📁 Step 5: Creating project directory..."
mkdir -p ~/persiantoolbox
cd ~/persiantoolbox

# Step 6: Setup data directory
echo "📊 Step 6: Setting up data directory..."
mkdir -p .data
mkdir -p logs

# Step 7: Setup environment
echo "🔧 Step 7: Setting up environment..."
cat > .env.production << 'ENVEOF'
NEXT_PUBLIC_SITE_URL=https://persiantoolbox.ir
NEXT_PUBLIC_SITE_NAME=جعبه ابزار فارسی
DATABASE_PATH=.data/persiantoolbox.db
MONETIZATION_STORAGE_PATH=.data/monetization.json
SITE_SETTINGS_STORAGE_PATH=.data/site-settings.json
HISTORY_STORAGE_PATH=.data/history.json
FEATURE_AUTH_ENABLED=1
FEATURE_ADMIN_SITE_SETTINGS_ENABLED=1
FEATURE_ADMIN_MONETIZATION_ENABLED=1
FEATURE_ACCOUNT_ENABLED=1
FEATURE_SUBSCRIPTION_ENABLED=1
FEATURE_PLANS_ENABLED=1
FEATURE_CHECKOUT_ENABLED=1
FEATURE_DASHBOARD_ENABLED=1
FEATURE_HISTORY_ENABLED=1
FEATURE_HISTORY_SHARE_ENABLED=1
FEATURE_SUPPORT_ENABLED=1
FEATURE_DEVELOPERS_ENABLED=1
FEATURE_ADS_ENABLED=1
FEATURE_SUBSCRIPTION_ROADMAP_ENABLED=1
NEXT_PUBLIC_ENABLE_ADS=true
NEXT_PUBLIC_ENABLE_MONETIZATION=true
SESSION_TTL_SECONDS=604800
RATE_LIMIT_ENABLED=true
RATE_LIMIT_WINDOW_MS=60000
CSP_MODE=production
NODE_ENV=production
PORT=3000
HOSTNAME=0.0.0.0
LOG_LEVEL=info
ENABLE_REQUEST_LOGGING=true
NEXT_PUBLIC_ENABLE_DEVTOOLS=false
NEXT_PUBLIC_FEATURE_V3_NAV=0
ENVEOF

# Step 8: Download and extract project (if not already present)
echo "📥 Step 8: Downloading project..."
if [ ! -f "package.json" ]; then
    echo "⚠️  Project files not found!"
    echo "Please copy project files to ~/persiantoolbox/ first:"
    echo "  rsync -avz ~/my-project/sites/live/persiantoolbox/ ubuntu@193.93.169.247:~/persiantoolbox/"
    echo ""
    echo "Or clone from git:"
    echo "  git clone https://github.com/alirezasafaei-dev/persiantoolbox.git ."
    echo "  git checkout main"
    exit 1
fi

# Step 9: Install dependencies
echo "🔨 Step 9: Installing dependencies..."
pnpm install

# Step 10: Build production
echo "🏗️  Step 10: Building production bundle..."
pnpm build

# Step 11: Setup PM2
echo "🔄 Step 11: Setting up PM2..."
cat > ecosystem.config.cjs << 'PM2OF'
module.exports = {
  apps: [{
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
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true
  }]
};
PM2OF

pm2 start ecosystem.config.cjs || pm2 restart persiantoolbox
pm2 save

# Step 12: Setup systemd
echo "⚙️  Step 12: Setting up systemd service..."
sudo tee /etc/systemd/system/persiantoolbox.service << 'SYSTEDEOF'
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
SYSTEDEOF

sudo systemctl daemon-reload
sudo systemctl enable persiantoolbox
sudo systemctl start persiantoolbox

# Step 13: Configure firewall
echo "🛡️  Step 13: Configuring firewall..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3000/tcp
if ! sudo ufw status | grep -q 'active'; then
    echo "y" | sudo ufw enable
fi

# Step 14: Install and configure Nginx
echo "🌐 Step 14: Setting up Nginx..."
if ! command -v nginx &> /dev/null; then
    sudo apt install nginx -y
fi

sudo tee /etc/nginx/sites-available/persiantoolbox << 'NGINXOF'
# Redirect www to non-www (canonical host)
server {
    listen 80;
    server_name www.persiantoolbox.ir;
    return 301 http://persiantoolbox.ir$request_uri;
}

server {
    listen 80;
    server_name persiantoolbox.ir;

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
NGINXOF

sudo ln -sf /etc/nginx/sites-available/persiantoolbox /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx

# Step 15: Test deployment
echo "🧪 Step 15: Testing deployment..."
if curl -f http://localhost:3000 &> /dev/null; then
    echo "✅ Application responding on localhost:3000"
else
    echo "⚠️  Application not responding on localhost:3000"
    echo "Check logs: pm2 logs persiantoolbox"
fi

if curl -f http://localhost &> /dev/null; then
    echo "✅ Application accessible via Nginx (http://localhost)"
else
    echo "⚠️  Application not accessible via Nginx"
    echo "Check nginx: sudo systemctl status nginx"
fi

echo ""
echo "=============================================="
echo "✅ DEPLOYMENT COMPLETED SUCCESSFULLY"
echo "=============================================="
echo "📊 Summary:"
echo "  🌐 App running on port 3000"
echo "  🌐 Nginx reverse proxy configured"
echo "  🔄 PM2 process manager active"
echo "  ⚙️  Systemd auto-start enabled"
echo "  🛡️ Firewall configured"
echo ""
echo "📋 Next Steps:"
echo "  1. Configure DNS: persiantoolbox.ir → $(curl -s ifconfig.me)"
echo "  2. Setup SSL: sudo certbot --nginx -d persiantoolbox.ir -d www.persiantoolbox.ir"
echo "  3. Monitor: pm2 monit"
echo "  4. Logs: pm2 logs persiantoolbox"
echo ""
echo "🔗 Quick Commands:"
echo "  pm2 status"
echo "  pm2 logs persiantoolbox"
echo "  pm2 restart persiantoolbox"
echo "  sudo systemctl status nginx"
echo "  sudo systemctl status persiantoolbox"
echo ""
