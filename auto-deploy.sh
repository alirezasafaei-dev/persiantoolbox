#!/bin/bash
set -e

# PersianToolbox Automated VPS Deployment
echo "🚀 PersianToolbox Automated VPS Deployment"
echo "============================================"

# Load VPS configuration
if [ -f .env ]; then
    source .env
else
    echo "❌ Error: .env file not found"
    exit 1
fi

VPS_IP="$IP"
VPS_USER="$USER"
VPS_PORT="$PORT"

echo "📡 VPS: $VPS_USER@$VPS_IP:$VPS_PORT"

# Use expect to handle SSH password authentication
if ! command -v expect &> /dev/null; then
    echo "📦 Installing expect for automated SSH..."
    sudo apt-get update
    sudo apt-get install -y expect
fi

# Function to execute SSH commands with password
ssh_with_password() {
    local command=$1
    expect <<EOF
set timeout 60
spawn ssh -o StrictHostKeyChecking=no -p $VPS_PORT $VPS_USER@$VPS_IP
expect {
    "password:" {
        send "$PASSWORD\r"
        expect {
            -re "\\$|%|#}" {
                send "$command\r"
                expect {
                    -re "\\$|%|#}" {
                        send "exit\r"
                        expect eof
                    }
                }
            }
        }
    }
    -re "\\$|%|#}" {
        send "$command\r"
        expect {
            -re "\\$|%|#}" {
                send "exit\r"
                expect eof
            }
        }
    }
    timeout {
        puts "SSH connection timeout"
        exit 1
    }
    eof
EOF
}

# Step 1: Setup SSH key on VPS
echo "🔑 Step 1: Setting up SSH key on VPS..."

if [ ! -f ~/.ssh/id_rsa ]; then
    ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa -N "" -C "persiantoolbox@$(hostname)"
fi

# Copy SSH public key to VPS
ssh_with_password "mkdir -p ~/.ssh && chmod 700 ~/.ssh && echo '$(cat ~/.ssh/id_rsa.pub)' >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"

echo "✅ SSH key configured on VPS"

# Test passwordless SSH connection
if ssh -o StrictHostKeyChecking=no -p "$VPS_PORT" "$VPS_USER@$VPS_IP" "echo 'SSH connection successful'" 2>/dev/null; then
    echo "✅ Passwordless SSH connection working!"
else
    echo "❌ Passwordless SSH connection failed, continuing with password..."
fi

# Now use passwordless SSH for remaining commands
SSH_CMD="ssh -o StrictHostKeyChecking=no -p $VPS_PORT $VPS_USER@$VPS_IP"

# Step 2: Prepare VPS environment
echo "📦 Step 2: Preparing VPS environment..."

$SSH_CMD << 'ENDSSH'
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Install pnpm
if ! command -v pnpm &> /dev/null; then
    npm install -g pnpm
fi

# Install PM2
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
fi

echo "✅ Environment prepared"
ENDSSH

# Step 3: Create project directory and copy files
echo "📁 Step 3: Setting up project directory..."

$SSH_CMD << 'ENDSSH'
# Create project directory
mkdir -p ~/persiantoolbox
cd ~/persiantoolbox

# Create .data directory
mkdir -p .data

echo "✅ Project directory ready"
ENDSSH

# Copy project files from local to VPS
echo "📤 Step 4: Copying project files to VPS..."
rsync -avz --progress --exclude 'node_modules' --exclude '.next' --exclude '.git' \
    --exclude '.data' --exclude 'coverage' --exclude 'test-results' \
    ~/my-project/sites/live/persiantoolbox/ $VPS_USER@$VPS_IP:~/persiantoolbox/

echo "✅ Project files copied"

# Step 5: Copy environment configuration
echo "🔧 Step 5: Copying environment configuration..."

cat > /tmp/env-production-upload.sh << 'ENDOFSCRIPT'
#!/bin/bash
cat > ~/persiantoolbox/.env.production << 'ENVEOF'
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

# Monetization Features
NEXT_PUBLIC_ENABLE_ADS=true
NEXT_PUBLIC_ENABLE_MONETIZATION=true

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
# DEVELOPMENT TOOLS (Disabled in production)
# ============================================
NEXT_PUBLIC_ENABLE_DEVTOOLS=false
NEXT_PUBLIC_FEATURE_V3_NAV=0
ENVEOF

echo "✅ Environment configuration uploaded"
ENDOFSCRIPT

chmod +x /tmp/env-production-upload.sh
scp -o StrictHostKeyChecking=no -P $VPS_PORT /tmp/env-production-upload.sh $VPS_USER@$VPS_IP:/tmp/
$SSH_CMD "chmod +x /tmp/env-production-upload.sh && /tmp/env-production-upload.sh"

echo "✅ Environment configuration set"

# Step 6: Install dependencies and build
echo "🔨 Step 6: Installing dependencies and building..."

$SSH_CMD << 'ENDSSH'
cd ~/persiantoolbox

# Install dependencies
pnpm install

# Build production bundle
pnpm build

echo "✅ Dependencies installed and build completed"
ENDSSH

# Step 7: Setup PM2
echo "🔄 Step 7: Setting up PM2..."

$SSH_CMD << 'ENDSSH'
cd ~/persiantoolbox

# Create logs directory
mkdir -p logs

# Create PM2 ecosystem file
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

# Start or restart application
if pm2 list | grep -q persiantoolbox; then
    pm2 restart persiantoolbox
else
    pm2 start ecosystem.config.cjs
fi

# Save PM2 process list
pm2 save

echo "✅ PM2 setup completed"
ENDSSH

# Step 8: Setup systemd service
echo "⚙️  Step 8: Setting up systemd service..."

$SSH_CMD << 'ENDSSH'
# Create systemd service file
sudo tee /etc/systemd/system/persiantoolbox.service << 'SYSTEMDEOF'
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
SYSTEMDEOF

# Reload systemd
sudo systemctl daemon-reload

# Enable service to start on boot
sudo systemctl enable persiantoolbox

# Start service
sudo systemctl start persiantoolbox

echo "✅ Systemd service setup completed"
ENDSSH

# Step 9: Configure firewall
echo "🛡️  Step 9: Configuring firewall..."

$SSH_CMD << 'ENDSSH'
# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP
sudo ufw allow 80/tcp

# Allow HTTPS
sudo ufw allow 443/tcp

# Allow app port (direct access)
sudo ufw allow 3000/tcp

# Enable firewall if not already enabled
if ! sudo ufw status | grep -q "active"; then
    echo "y" | sudo ufw enable
fi

echo "✅ Firewall configured"
ENDSSH

# Step 10: Test deployment
echo "🧪 Step 10: Testing deployment..."

# Test from VPS
if $SSH_CMD "curl -f http://localhost:3000" 2>/dev/null; then
    echo "✅ Application responding on VPS (localhost:3000)"
else
    echo "⚠️  Application not responding on VPS"
fi

# Test from local
if curl -f http://$VPS_IP:3000 2>/dev/null; then
    echo "✅ Application accessible from external (http://$VPS_IP:3000)"
else
    echo "⚠️  Application not accessible from external"
fi

# Check PM2 status
echo "📊 PM2 Status:"
$SSH_CMD "pm2 status"

# Check systemd status
echo "📊 Systemd Status:"
$SSH_CMD "sudo systemctl status persiantoolbox --no-pager"

# Step 11: Setup Nginx (basic setup)
echo "🌐 Step 11: Setting up Nginx reverse proxy..."

$SSH_CMD << 'ENDSSH'
# Install Nginx
if ! command -v nginx &> /dev/null; then
    sudo apt install nginx -y
fi

# Create Nginx configuration
sudo tee /etc/nginx/sites-available/persiantoolbox << 'NGINXOF'
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

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Static file caching
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 365d;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}
NGINXOF

# Enable site
sudo ln -sf /etc/nginx/sites-available/persiantoolbox /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test and reload Nginx
sudo nginx -t
sudo systemctl reload nginx

echo "✅ Nginx configured"
ENDSSH

# Test Nginx
if curl -f http://$VPS_IP 2>/dev/null; then
    echo "✅ Application accessible via Nginx (http://$VPS_IP)"
else
    echo "⚠️  Application not accessible via Nginx"
fi

echo ""
echo "============================================"
echo "✅ DEPLOYMENT COMPLETED SUCCESSFULLY"
echo "============================================"
echo ""
echo "📊 Deployment Summary:"
echo "  🌐 URL: http://$VPS_IP (Nginx)"
echo "  🚀 Direct: http://$VPS_IP:3000 (Next.js)"
echo "  🔄 PM2: Process manager active"
echo "  ⚙️  Systemd: Auto-start enabled"
echo "  🛡️ Firewall: Configured (22, 80, 443, 3000)"
echo "  🌐 Nginx: Reverse proxy configured"
echo ""
echo "📋 Next Steps:"
echo "  1. Configure DNS: persiantoolbox.ir → $VPS_IP"
echo "  2. Setup SSL: sudo certbot --nginx -d persiantoolbox.ir -d www.persiantoolbox.ir"
echo "  3. Monitor: ssh $VPS_USER@$VPS_IP 'pm2 monit'"
echo "  4. Logs: ssh $VPS_USER@$VPS_IP 'pm2 logs persiantoolbox'"
echo ""
echo "🔗 Quick Commands:"
echo "  - SSH: ssh $VPS_USER@$VPS_IP"
echo "  - PM2 Status: ssh $VPS_USER@$VPS_IP 'pm2 status'"
echo "  - PM2 Logs: ssh $VPS_USER@$VPS_IP 'pm2 logs persiantoolbox'"
echo "  - Restart: ssh $VPS_USER@$VPS_IP 'pm2 restart persiantoolbox'"
echo "  - Nginx Status: ssh $VPS_USER@$VPS_IP 'sudo systemctl status nginx'"
echo ""
echo "🎉 PersianToolbox is now live on the new VPS!"
echo ""
