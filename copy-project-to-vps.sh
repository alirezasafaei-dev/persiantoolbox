#!/bin/bash
# Copy Project Files to VPS - Run this from local machine

echo "📤 PersianToolbox - Copy Project to VPS"
echo "======================================"

# Load VPS config
source .env
VPS_IP="$IP"
VPS_USER="$USER"
VPS_PORT="$PORT"

echo "📡 VPS: $VPS_USER@$VPS_IP:$VPS_PORT"

# Check SSH key access
if ssh -o StrictHostKeyChecking=no -o PasswordAuthentication=no -p "$VPS_PORT" "$VPS_USER@$VPS_IP" "echo test" 2>/dev/null; then
    echo "✅ Passwordless SSH available"
    SSH="ssh -o StrictHostKeyChecking=no -p $VPS_PORT $VPS_USER@$VPS_IP"
else
    echo "⚠️  Passwordless SSH not available"
    echo ""
    echo "Please setup SSH key first following DEPLOYMENT-NOW.md"
    echo "Or run with password authentication (requires sshpass):"
    echo "  sudo apt install sshpass"
    echo "  ./deploy-interactive.sh"
    exit 1
fi

# Step 1: Create directory structure on VPS
echo "📁 Step 1: Creating directory structure..."
$SSH "mkdir -p ~/persiantoolbox/.data ~/persiantoolbox/logs"
echo "✅ Directories created"

# Step 2: Copy project files
echo "📤 Step 2: Copying project files to VPS..."
rsync -avz --progress \
    --exclude 'node_modules' --exclude '.next' --exclude '.git' \
    --exclude '.data' --exclude 'coverage' --exclude 'test-results' \
    --exclude '*.log' --exclude '.DS_Store' \
    ./ "$VPS_USER@$VPS_IP:~/persiantoolbox/"

echo "✅ Project files copied"

# Step 3: Copy deployment script
echo "📜 Step 3: Copying deployment script to VPS..."
scp -P "$VPS_PORT" vps-deploy-complete.sh "$VPS_USER@$VPS_IP:~/persiantoolbox/"
$SSH "chmod +x ~/persiantoolbox/vps-deploy-complete.sh"
echo "✅ Deployment script copied"

echo ""
echo "======================================"
echo "✅ FILES COPIED SUCCESSFULLY"
echo "======================================"
echo ""
echo "📋 Next Steps:"
echo "  1. SSH to VPS: ssh $VPS_USER@$VPS_IP"
echo "  2. Navigate to project: cd ~/persiantoolbox"
echo "  3. Run deployment script: ./vps-deploy-complete.sh"
echo ""
echo "🔗 Quick Commands:"
echo "  ssh $VPS_USER@$VPS_IP 'cd ~/persiantoolbox && ./vps-deploy-complete.sh'"
echo ""
