#!/bin/bash
# Quick Deployment Script - Minimal dependencies
set -e

echo "🚀 PersianToolbox Quick VPS Deployment"
echo "======================================"

# Load VPS config
source .env
VPS_IP="$IP"
VPS_USER="$USER"
VPS_PORT="$PORT"
VPS_PASSWORD="$PASSWORD"

echo "📡 VPS: $VPS_USER@$VPS_IP:$VPS_PORT"

# Function to SSH with password using minimal setup
ssh_pass() {
    local cmd="$1"
    echo "$VPS_PASSWORD" | ssh -o StrictHostKeyChecking=no -p "$VPS_PORT" "$VPS_USER@$VPS_IP" "$cmd"
}

# Check if we have SSH key access
if ssh -o StrictHostKeyChecking=no -o PasswordAuthentication=no -p "$VPS_PORT" "$VPS_USER@$VPS_IP" "echo test" 2>/dev/null; then
    echo "✅ Passwordless SSH available"
    SSH="ssh -o StrictHostKeyChecking=no -p $VPS_PORT $VPS_USER@$VPS_IP"
else
    echo "⚠️  Need to setup SSH key first"
    echo "🔑 Please run this manually:"
    echo "  ssh-copy-id -o StrictHostKeyChecking=no -p $VPS_PORT $VPS_USER@$VPS_IP"
    echo "Then enter password: $VPS_PASSWORD"
    echo ""
    read -p "Press Enter after SSH key is setup..."
    
    if ssh -o StrictHostKeyChecking=no -o PasswordAuthentication=no -p "$VPS_PORT" "$VPS_USER@$VPS_IP" "echo test" 2>/dev/null; then
        SSH="ssh -o StrictHostKeyChecking=no -p $VPS_PORT $VPS_USER@$VPS_IP"
        echo "✅ Passwordless SSH now working"
    else
        echo "❌ SSH key setup failed. Please setup manually:"
        echo "  ssh $VPS_USER@$VPS_IP"
        echo "  mkdir -p ~/.ssh"
        echo "  echo 'YOUR_PUBLIC_KEY' >> ~/.ssh/authorized_keys"
        exit 1
    fi
fi

# Step 1: Prepare VPS
echo "📦 Step 1: Preparing VPS environment..."
$SSH "sudo apt update && sudo apt upgrade -y"

# Check Node.js
if ! $SSH "command -v node" 2>/dev/null; then
    echo "📥 Installing Node.js 20..."
    $SSH "curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -"
    $SSH "sudo apt-get install -y nodejs"
fi

# Check pnpm
if ! $SSH "command -v pnpm" 2>/dev/null; then
    echo "📥 Installing pnpm..."
    $SSH "npm install -g pnpm"
fi

# Check PM2
if ! $SSH "command -v pm2" 2>/dev/null; then
    echo "📥 Installing PM2..."
    $SSH "npm install -g pm2"
fi

echo "✅ Environment ready"

# Step 2: Setup project directory
echo "📁 Step 2: Setting up project directory..."
$SSH "mkdir -p ~/persiantoolbox && cd ~/persiantoolbox && mkdir -p .data"
echo "✅ Directory ready"

# Step 3: Copy project
echo "📤 Step 3: Copying project files..."
rsync -avz --progress \
    --exclude 'node_modules' --exclude '.next' --exclude '.git' \
    --exclude '.data' --exclude 'coverage' --exclude 'test-results' \
    ./ "$VPS_USER@$VPS_IP:~/persiantoolbox/"
echo "✅ Project copied"

# Step 4: Setup environment
echo "🔧 Step 4: Setting up environment..."
$SSH "cd ~/persiantoolbox && cat > .env.production << 'ENVEOF'
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
ENVEOF"
echo "✅ Environment set"

# Step 5: Install and build
echo "🔨 Step 5: Installing dependencies and building..."
$SSH "cd ~/persiantoolbox && pnpm install"
$SSH "cd ~/persiantoolbox && pnpm build"
echo "✅ Build completed"

# Step 6: Setup PM2
echo "🔄 Step 6: Setting up PM2..."
$SSH "cd ~/persiantoolbox && mkdir -p logs"
$SSH "cd ~/persiantoolbox && cat > ecosystem.config.cjs << 'PM2OF'
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
PM2OF"
$SSH "cd ~/persiantoolbox && pm2 start ecosystem.config.cjs || pm2 restart persiantoolbox"
$SSH "pm2 save"
echo "✅ PM2 setup completed"

# Step 7: Setup systemd
echo "⚙️  Step 7: Setting up systemd..."
$SSH "sudo tee /etc/systemd/system/persiantoolbox.service << 'SYSTEDEOF'
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
SYSTEDEOF"
$SSH "sudo systemctl daemon-reload"
$SSH "sudo systemctl enable persiantoolbox"
$SSH "sudo systemctl start persiantoolbox"
echo "✅ Systemd setup completed"

# Step 8: Setup firewall
echo "🛡️  Step 8: Configuring firewall..."
$SSH "sudo ufw allow 22/tcp"
$SSH "sudo ufw allow 80/tcp"
$SSH "sudo ufw allow 443/tcp"
$SSH "sudo ufw allow 3000/tcp"
$SSH "if ! sudo ufw status | grep -q 'active'; then echo 'y' | sudo ufw enable; fi"
echo "✅ Firewall configured"

# Step 9: Setup Nginx
echo "🌐 Step 9: Setting up Nginx..."
if ! $SSH "command -v nginx" 2>/dev/null; then
    echo "📥 Installing Nginx..."
    $SSH "sudo apt install nginx -y"
fi

$SSH "sudo tee /etc/nginx/sites-available/persiantoolbox << 'NGINXOF'
server {
    listen 80;
    server_name persiantoolbox.ir www.persiantoolbox.ir _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
NGINXOF"

$SSH "sudo ln -sf /etc/nginx/sites-available/persiantoolbox /etc/nginx/sites-enabled/"
$SSH "sudo rm -f /etc/nginx/sites-enabled/default"
$SSH "sudo nginx -t"
$SSH "sudo systemctl reload nginx"
echo "✅ Nginx configured"

# Step 10: Test deployment
echo "🧪 Step 10: Testing deployment..."
if $SSH "curl -f http://localhost:3000" 2>/dev/null; then
    echo "✅ App responding on VPS (localhost:3000)"
fi

if curl -f "http://$VPS_IP" 2>/dev/null; then
    echo "✅ App accessible via Nginx (http://$VPS_IP)"
fi

echo ""
echo "======================================"
echo "✅ DEPLOYMENT COMPLETED"
echo "======================================"
echo "📊 Summary:"
echo "  🌐 http://$VPS_IP"
echo "  🔄 PM2 active"
echo "  ⚙️  Systemd enabled"
echo "  🛡️ Firewall configured"
echo "  🌐 Nginx configured"
echo ""
echo "📋 Next Steps:"
echo "  1. DNS: persiantoolbox.ir → $VPS_IP"
echo "  2. SSL: sudo certbot --nginx -d persiantoolbox.ir -d www.persiantoolbox.ir"
echo ""
echo "🔗 Quick Commands:"
echo "  ssh $VPS_USER@$VPS_IP 'pm2 status'"
echo "  ssh $VPS_USER@$VPS_IP 'pm2 logs persiantoolbox'"
echo ""
