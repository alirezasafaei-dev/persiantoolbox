#!/usr/bin/env bash
set -e

# ============================================
# SSH Key Setup Script for VPS (Manual)
# Enables passwordless SSH connection
# ============================================

echo "🔑 PersianToolbox SSH Key Setup Script (Manual)"
echo "======================================"

# VPS Configuration (from .env)
if [ -f .env ]; then
    source .env
    VPS_IP="$IP"
    VPS_USER="$USER"
    VPS_PORT="$PORT"
    VPS_PASSWORD="$PASSWORD"
else
    echo "❌ Error: .env file not found"
    echo "Please create .env with VPS credentials:"
    echo "IP=<vps-ip-address>"
    echo "USER=<ssh-username>"
    echo "PORT=<ssh-port>"
    echo "PASSWORD=<ssh-password>"
    exit 1
fi

echo "📡 VPS Connection Info:"
echo "  IP: $VPS_IP"
echo "  User: $VPS_USER"
echo "  Port: $VPS_PORT"
echo ""

# ============================================
# STEP 1: Generate SSH Key Pair (if not exists)
# ============================================
echo "🔐 Step 1: Setting up SSH key pair..."

if [ ! -f ~/.ssh/id_rsa ]; then
    echo "📋 Generating new SSH key pair..."
    ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa -N "" -C "persiantoolbox@$(hostname)"
    echo "✅ SSH key pair generated"
else
    echo "✅ SSH key pair already exists"
fi

# ============================================
# STEP 2: Display Public Key
# ============================================
echo "📤 Step 2: Copy this SSH public key to your VPS:"
echo ""
echo "======================================"
cat ~/.ssh/id_rsa.pub
echo "======================================"
echo ""
echo "📋 Instructions to copy SSH key to VPS:"
echo ""
echo "Method 1: Manual copy (recommended if sshpass not available):"
echo "  1. Login to VPS: ssh $VPS_USER@$VPS_IP -p $VPS_PORT"
echo "  2. Create .ssh directory: mkdir -p ~/.ssh"
echo "  3. Add public key to authorized_keys:"
echo "     echo 'YOUR_PUBLIC_KEY_HERE' >> ~/.ssh/authorized_keys"
echo "  4. Set permissions: chmod 700 ~/.ssh && chmod 600 ~/.ssh/authorized_keys"
echo ""
echo "Method 2: One-line command (run this from local machine):"
echo "  ssh $VPS_USER@$VPS_IP -p $VPS_PORT \"mkdir -p ~/.ssh && echo '$(cat ~/.ssh/id_rsa.pub)' >> ~/.ssh/authorized_keys && chmod 700 ~/.ssh && chmod 600 ~/.ssh/authorized_keys\""
echo ""
echo "Press Enter after you have copied the SSH key to VPS..."
read

# ============================================
# STEP 3: Test Passwordless SSH Connection
# ============================================
echo "🔗 Step 3: Testing passwordless SSH connection..."

if ssh -o StrictHostKeyChecking=no -p "$VPS_PORT" "$VPS_USER@$VPS_IP" "echo '✅ SSH connection successful without password'"; then
    echo "✅ Passwordless SSH connection working!"
else
    echo "❌ Passwordless SSH connection failed"
    echo "Please check the SSH key setup"
    exit 1
fi

# ============================================
# STEP 4: Setup SSH Config for easy connection
# ============================================
echo "⚙️  Step 4: Setting up SSH config for easy connection..."

if [ ! -f ~/.ssh/config ]; then
    touch ~/.ssh/config
    chmod 600 ~/.ssh/config
fi

# Add persiantoolbox host to SSH config
if ! grep -q "Host persiantoolbox" ~/.ssh/config; then
    cat >> ~/.ssh/config <<'SSHEOF'

Host persiantoolbox
    HostName $VPS_IP
    User $VPS_USER
    Port $VPS_PORT
    IdentityFile ~/.ssh/id_rsa
    StrictHostKeyChecking no
SSHEOF

    # Replace placeholders
    sed -i "s/\$VPS_IP/$VPS_IP/" ~/.ssh/config
    sed -i "s/\$VPS_USER/$VPS_USER/" ~/.ssh/config
    sed -i "s/\$VPS_PORT/$VPS_PORT/" ~/.ssh/config

    echo "✅ SSH config updated"
else
    echo "✅ SSH config already has persiantoolbox entry"
fi

# ============================================
# STEP 5: Setup Summary
# ============================================
echo ""
echo "======================================"
echo "✅ SSH KEY SETUP COMPLETED"
echo "======================================"
echo ""
echo "📊 Setup Summary:"
echo "  🔑 SSH Key: Generated and deployed"
echo "  📤 Public Key: Copied to VPS"
echo "  🔗 Connection: Passwordless SSH working"
echo "  ⚙️  SSH Config: Easy connection via 'ssh persiantoolbox'"
echo ""
echo "🔗 Connection Methods:"
echo "  1. Direct: ssh $VPS_USER@$VPS_IP -p $VPS_PORT"
echo "  2. Config: ssh persiantoolbox"
echo "  3. PM2 Monitor: ssh persiantoolbox 'pm2 monit'"
echo "  4. PM2 Logs: ssh persiantoolbox 'pm2 logs persiantoolbox'"
echo ""
echo "🎯 Next Steps:"
echo "  1. Run deployment script: ./deploy-vps.sh"
echo "  2. Test connection: ssh persiantoolbox"
echo "  3. Monitor deployment: ssh persiantoolbox 'pm2 monit'"
echo ""
echo "🔒 Security Note:"
echo "  - SSH keys are more secure than passwords"
echo "  - Keep your private key safe (~/.ssh/id_rsa)"
echo "  - Backup your SSH keys to a secure location"
echo "  - You can disable password authentication later for extra security"
echo ""
