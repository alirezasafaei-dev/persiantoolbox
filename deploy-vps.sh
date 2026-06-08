#!/usr/bin/env bash
set -e

# ============================================
# PersianToolbox VPS Deployment Script
# ============================================

echo "🚀 PersianToolbox VPS Deployment Script"
echo "=================================="

# VPS Configuration (from .env)
if [ -f .env ]; then
    source .env
    VPS_IP="$IP"
    VPS_USER="$USER"
    VPS_PORT="$PORT"
else
    echo "❌ Error: .env file not found"
    echo "Please create .env with VPS credentials:"
    echo "IP=<vps-ip-address>"
    echo "USER=<ssh-username>"
    echo "PORT=<ssh-port>"
    exit 1
fi

echo "📡 VPS Connection Info:"
echo "  IP: $VPS_IP"
echo "  User: $VPS_USER"
echo "  Port: $VPS_PORT"
echo ""

# ============================================
# STEP 1: Copy .env.production to VPS
# ============================================
echo "📋 Step 1: Deploying environment configuration..."

ssh -o StrictHostKeyChecking=no -p "$VPS_PORT" "$VPS_USER@$VPS_IP" << 'ENDSSH'
cd ~/persiantoolbox || cd ~/projects/persiantoolbox

# Backup existing .env.production if exists
if [ -f .env.production ]; then
    cp .env.production .env.production.backup.$(date +%Y%m%d_%H%M%S)
    echo "✅ Backed up existing .env.production"
fi

# Create .env.production from project
cat > .env.production <<'ENVEOF'
# ============================================
# PRODUCTION ENVIRONMENT CONFIGURATION
# PersianToolbox v3.0.6 - Automated Deployment Setup
# ============================================

# ============================================
# DOMAIN CONFIGURATION (Auto-populated from project)
# ============================================
NEXT_PUBLIC_SITE_URL=https://persiantoolbox.ir
NEXT_PUBLIC_SITE_NAME=جعبه ابزار فارسی
NEXT_PUBLIC_SITE_TAGLINE=ابزارهای آنلاین فارسی، سریع و امن

# ============================================
# DATABASE CONFIGURATION (SQLite for simplicity)
# ============================================
DATABASE_PATH=.data/persiantoolbox.db
# Alternative PostgreSQL (commented out):
# DATABASE_URL=postgresql://persiantoolbox:secure_password@localhost:5432/persiantoolbox

# ============================================
# STORAGE CONFIGURATION
# ============================================
MONETIZATION_STORAGE_PATH=.data/monetization.json
SITE_SETTINGS_STORAGE_PATH=.data/site-settings.json
HISTORY_STORAGE_PATH=.data/history.json

# ============================================
# FEATURE FLAGS (Production Ready)
# ============================================
FEATURE_AUTH_ENABLED=1
FEATURE_ADMIN_SITE_SETTINGS_ENABLED=1
FEATURE_ADMIN_MONETIZATION_ENABLED=1
FEATURE_ACCOUNT_ENABLED=0
FEATURE_SUBSCRIPTION_ENABLED=0
FEATURE_HISTORY_ENABLED=1
FEATURE_HISTORY_SHARE_ENABLED=0
FEATURE_SUPPORT_ENABLED=1
FEATURE_DEVELOPERS_ENABLED=1

# Monetization Features
NEXT_PUBLIC_ENABLE_ADS=false
NEXT_PUBLIC_ENABLE_MONETIZATION=false

# ============================================
# SECURITY CONFIGURATION
# ============================================
SESSION_TTL_SECONDS=604800
RATE_LIMIT_ENABLED=true
RATE_LIMIT_WINDOW_MS=60000
CSP_MODE=production

# ============================================
# PERFORMANCE CONFIGURATION
# ============================================
NODE_ENV=production
PORT=3000
HOSTNAME=0.0.0.0

# Logging Configuration
LOG_LEVEL=info
ENABLE_REQUEST_LOGGING=true

# ============================================
# OPTIONAL ANALYTICS (Disabled by default)
# ============================================
# NEXT_PUBLIC_ANALYTICS_ID=
# ANALYTICS_INGEST_SECRET=
# STRICT_ANALYTICS_POLICY=false

# ============================================
# OPTIONAL STRIPE (Disabled by default)
# ============================================
# STRIPE_SECRET_KEY=
# STRIPE_WEBHOOK_SECRET=

# ============================================
# OPTIONAL ADMIN (Disabled by default)
# ============================================
# OPS_DASHBOARD_TOKEN=
# OPS_DEGRADED_WEBHOOK=

# ============================================
# DEPLOYMENT CONFIGURATION
# ============================================
PORT=3000
HOSTNAME=0.0.0.0

# ============================================
# DEVELOPMENT TOOLS (Disabled in production)
# ============================================
NEXT_PUBLIC_ENABLE_DEVTOOLS=false
NEXT_PUBLIC_FEATURE_V3_NAV=0
ENVEOF

echo "✅ Created .env.production on VPS"
ENDSSH

# ============================================
# STEP 2: Install dependencies
# ============================================
echo "📦 Step 2: Installing dependencies on VPS..."

ssh -o StrictHostKeyChecking=no -p "$VPS_PORT" "$VPS_USER@$VPS_IP" << 'ENDSSH'
cd ~/persiantoolbox || cd ~/projects/persiantoolbox

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "📥 Installing pnpm..."
    npm install -g pnpm
fi

echo "📦 Installing project dependencies..."
pnpm install

echo "✅ Dependencies installed successfully"
ENDSSH

# ============================================
# STEP 3: Build production bundle
# ============================================
echo "🔨 Step 3: Building production bundle on VPS..."

ssh -o StrictHostKeyChecking=no -p "$VPS_PORT" "$VPS_USER@$VPS_IP" << 'ENDSSH'
cd ~/persiantoolbox || cd ~/projects/persiantoolbox

echo "🏗️  Building production..."
pnpm build

echo "✅ Build completed successfully"
ENDSSH

# ============================================
# STEP 4: Setup data directory
# ============================================
echo "📁 Step 4: Setting up data directory..."

ssh -o StrictHostKeyChecking=no -p "$VPS_PORT" "$VPS_USER@$VPS_IP" << 'ENDSSH'
cd ~/persiantoolbox || cd ~/projects/persiantoolbox

mkdir -p .data

echo "✅ Data directory created"
ENDSSH

# ============================================
# STEP 5: Setup PM2 for process management
# ============================================
echo "🔄 Step 5: Setting up PM2 process manager..."

ssh -o StrictHostKeyChecking=no -p "$VPS_PORT" "$VPS_USER@$VPS_IP" << 'ENDSSH'
cd ~/persiantoolbox || cd ~/projects/persiantoolbox

# Install PM2 if not exists
if ! command -v pm2 &> /dev/null; then
    echo "📥 Installing PM2..."
    npm install -g pm2
fi

# Create or update PM2 ecosystem file
cat > ecosystem.config.cjs <<'PM2OF'
module.exports = {
  apps: [{
    name: 'persiantoolbox',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: '.',
    instances: 'max',
    exec_mode: 'cluster',
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

echo "📋 PM2 ecosystem configuration created"

# Start or restart the app
if pm2 list | grep -q persiantoolbox; then
  echo "🔄 Restarting existing PM2 app..."
  pm2 restart persiantoolbox
else
  echo "🚀 Starting new PM2 app..."
  pm2 start ecosystem.config.cjs
fi

# Save PM2 process list
pm2 save

echo "✅ PM2 setup completed"
ENDSSH

# ============================================
# STEP 6: Setup systemd for auto-start
# ============================================
echo "⚙️  Step 6: Setting up systemd service..."

ssh -o StrictHostKeyChecking=no -p "$VPS_PORT" "$VPS_USER@$VPS_IP" << 'ENDSSH'
cd ~/persiantoolbox || cd ~/projects/persiantoolbox

# Create systemd service file
sudo tee /etc/systemd/system/persiantoolbox.service <<'SYSTEMDEOF'
[Unit]
Description=PersianToolbox - Persian Online Tools
After=network.target

[Service]
Type=forking
User=$USER
WorkingDirectory=/home/$USER/persiantoolbox
ExecStart=/usr/bin/pm2 start persiantoolbox --no-daemon
ExecStop=/usr/bin/pm2 stop persiantoolbox
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
SYSTEMDEOF

echo "📋 Systemd service file created"

# Reload systemd
sudo systemctl daemon-reload

# Enable service to start on boot
sudo systemctl enable persiantoolbox

# Start service
sudo systemctl start persiantoolbox

echo "✅ Systemd service setup completed"
ENDSSH

# ============================================
# STEP 7: Configure Firewall (ufw)
# ============================================
echo "🛡️  Step 7: Configuring firewall..."

ssh -o StrictHostKeyChecking=no -p "$VPS_PORT" "$VPS_USER@$VPS_IP" << 'ENDSSH'

# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP
sudo ufw allow 80/tcp

# Allow HTTPS (if SSL is configured later)
sudo ufw allow 443/tcp

# Enable firewall if not already enabled
if ! sudo ufw status | grep -q "active"; then
    echo "🔥 Enabling firewall..."
    echo "y" | sudo ufw enable
fi

echo "✅ Firewall configured"
ENDSSH

# ============================================
# Step 8: Setup Nginx (Optional - Manual or Skip)
# ============================================
echo "🌐 Step 8: Nginx Configuration"
echo ""
echo "⚠️  Nginx requires manual SSL certificate setup."
echo "For now, the app runs on port 3000 directly."
echo ""
echo "To setup Nginx with SSL later:"
echo "  1. Install nginx: sudo apt install nginx"
echo " 2. Get SSL cert: sudo certbot certonly --nginx -d persiantoolbox.ir -d www.persiantoolbox.ir"
echo " 3. Configure nginx reverse proxy"
echo ""

# ============================================
# STEP 9: Deployment Summary
# ============================================
echo ""
echo "=================================="
echo "✅ DEPLOYMENT COMPLETED SUCCESSFULLY"
echo "=================================="
echo ""
echo "📊 Deployment Summary:"
echo "  🌐 URL: https://persiantoolbox.ir"
echo "  🚀 Server: $VPS_IP:3000"
echo "  🔄 PM2: Process manager active"
echo  ⚙️  Systemd: Auto-start enabled"
echo "  🛡️ Firewall: Configured (SSH:22, HTTP:80, HTTPS:443)"
echo ""
echo "📋 Next Steps:"
echo "   1. Test the deployment: curl http://$VPS_IP:3000"
echo "   2. Configure DNS to point $VPS_IP"
echo "  3. Setup SSL with Let's Encrypt (optional but recommended)"
echo "  4. Configure Nginx reverse proxy (optional but recommended)"
echo ""
echo "🔗 Quick Links:"
echo "  - SSH: ssh $VPS_USER@$VPS_IP -p $VPS_PORT"
echo "  - PM2 Monitor: ssh $VPS_USER@$VPS_IP -p $VPS_PORT 'pm2 monit'"
echo "  - PM2 Logs: ssh $VPS_USER@$VPS_IP -p $VPS_PORT 'pm2 logs persiantoolbox'"
echo "  - Restart: ssh $VPS_USER@$VPS_IP -p $VPS_PORT 'pm2 restart persiantoolbox'"
echo ""
echo "🎉 PersianToolbox is now live on the new VPS!"
echo ""
