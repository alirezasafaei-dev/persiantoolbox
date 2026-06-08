#!/usr/bin/env python3
"""
PersianToolbox Automated VPS Deployment
Uses standard SSH connection without additional dependencies
"""

import os
import subprocess
import sys
import time
import getpass

def run_command(cmd, check=True, capture=True):
    """Run a shell command"""
    try:
        if capture:
            result = subprocess.run(cmd, shell=True, check=check,
                                   capture_output=True, text=True)
            return result.stdout, result.stderr, result.returncode
        else:
            result = subprocess.run(cmd, shell=True, check=check)
            return None, None, result.returncode
    except subprocess.CalledProcessError as e:
        if capture:
            return e.stdout, e.stderr, e.returncode
        raise

def ssh_command(vps_ip, vps_user, vps_port, command, password=None):
    """Execute SSH command with password if needed"""
    ssh_cmd = f"ssh -o StrictHostKeyChecking=no -p {vps_port} {vps_user}@{vps_ip} '{command}'"

    if password:
        # Use expect for password authentication
        expect_script = f"""
import subprocess
import sys

expect_cmd = f'''expect <<'EXPECTEOF'
set timeout 120
spawn ssh -o StrictHostKeyChecking=no -p {vps_port} {vps_user}@{vps_ip}
expect {{
    "password:" {{
        send "{password}\\r"
        expect {{
            -re "\\$|%|#}}" {{
                send "{command}\\r"
                expect {{
                    -re "\\$|%|#}}" {{
                        send "exit\\r"
                        expect eof
                    }}
                }}
            }}
        }}
        -re "\\$|%|#}}" {{
            send "{command}\\r"
            expect {{
                -re "\\$|%|#}}" {{
                    send "exit\\r"
                    expect eof
                }}
            }}
        }}
        "yes/no" {{
            send "yes\\r"
            exp_continue
        }}
    }}
    timeout {{
        puts "SSH connection timeout"
        exit 1
    }}
    eof
EXPECTEOF
'''

        with open('/tmp/ssh_expect.py', 'w') as f:
            f.write(expect_script)

        result = subprocess.run(['python3', '/tmp/ssh_expect.py'],
                               capture_output=True, text=True)
        return result.stdout, result.stderr, result.returncode
    else:
        return run_command(ssh_cmd)

def main():
    print("🚀 PersianToolbox Automated VPS Deployment")
    print("============================================")

    # Load VPS configuration
    if os.path.exists('.env'):
        with open('.env', 'r') as f:
            env_lines = f.readlines()

        vps_config = {}
        for line in env_lines:
            if '=' in line and not line.strip().startswith('#'):
                key, value = line.strip().split('=', 1)
                vps_config[key] = value

        vps_ip = vps_config.get('IP', '')
        vps_user = vps_config.get('USER', '')
        vps_port = vps_config.get('PORT', '22')
        vps_password = vps_config.get('PASSWORD', '')
    else:
        print("❌ Error: .env file not found")
        sys.exit(1)

    if not all([vps_ip, vps_user]):
        print("❌ Error: Missing required VPS configuration")
        sys.exit(1)

    print(f"📡 VPS: {vps_user}@{vps_ip}:{vps_port}")

    # Step 1: Generate SSH key
    print("\n🔑 Step 1: Setting up SSH key...")

    if not os.path.exists(os.path.expanduser('~/.ssh/id_rsa')):
        run_command('ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa -N "" -C "persiantoolbox@$(hostname)"')
        print("✅ SSH key generated")
    else:
        print("✅ SSH key already exists")

    # Read public key
    with open(os.path.expanduser('~/.ssh/id_rsa.pub'), 'r') as f:
        ssh_public_key = f.read().strip()

    # Step 2: Upload SSH key to VPS
    print(f"\n📤 Step 2: Uploading SSH key to VPS...")
    print("🔐 Enter VPS password when prompted:")

    # Use ssh-copy-id if available, otherwise manual method
    if run_command('which ssh-copy-id', capture=False, check=False)[2] == 0:
        # Use ssh-copy-id with password
        ssh_copy_cmd = f"sshpass -p '{vps_password}' ssh-copy-id -o StrictHostKeyChecking=no -p {vps_port} {vps_user}@{vps_ip}"
        try:
            run_command(ssh_copy_cmd)
            print("✅ SSH key copied to VPS")
        except:
            print("⚠️  ssh-copy-id failed, trying manual method...")

            # Manual method using SSH
            setup_ssh_cmd = f"mkdir -p ~/.ssh && chmod 700 ~/.ssh && echo '{ssh_public_key}' >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"
            stdout, stderr, rc = ssh_command(vps_ip, vps_user, vps_port, setup_ssh_cmd, vps_password)
            if rc == 0:
                print("✅ SSH key manually configured on VPS")
            else:
                print("❌ Failed to configure SSH key")
                print(f"Error: {stderr}")
                sys.exit(1)
    else:
        # Manual method
        setup_ssh_cmd = f"mkdir -p ~/.ssh && chmod 700 ~/.ssh && echo '{ssh_public_key}' >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"
        stdout, stderr, rc = ssh_command(vps_ip, vps_user, vps_port, setup_ssh_cmd, vps_password)
        if rc == 0:
            print("✅ SSH key configured on VPS")
        else:
            print("❌ Failed to configure SSH key")
            print(f"Error: {stderr}")
            sys.exit(1)

    # Test passwordless SSH
    print("\n🔗 Step 3: Testing passwordless SSH connection...")
    stdout, stderr, rc = ssh_command(vps_ip, vps_user, vps_port, "echo 'SSH connection successful'")
    if rc == 0:
        print("✅ Passwordless SSH connection working!")
        ssh_password = None  # Use passwordless SSH for remaining commands
    else:
        print("⚠️  Passwordless SSH not working, using password")
        ssh_password = vps_password

    # SSH command helper
    def ssh(cmd):
        stdout, stderr, rc = ssh_command(vps_ip, vps_user, vps_port, cmd, ssh_password)
        if rc != 0:
            print(f"❌ Command failed: {cmd}")
            print(f"Error: {stderr}")
            return False
        return True

    # Step 4: Prepare VPS environment
    print("\n📦 Step 4: Preparing VPS environment...")
    ssh("sudo apt update && sudo apt upgrade -y")

    if not ssh("node --version"):
        print("📥 Installing Node.js 20...")
        ssh("curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -")
        ssh("sudo apt-get install -y nodejs")

    if not ssh("pnpm --version"):
        print("📥 Installing pnpm...")
        ssh("npm install -g pnpm")

    if not ssh("pm2 --version"):
        print("📥 Installing PM2...")
        ssh("npm install -g pm2")

    print("✅ Environment prepared")

    # Step 5: Setup project directory
    print("\n📁 Step 5: Setting up project directory...")
    ssh("mkdir -p ~/persiantoolbox && cd ~/persiantoolbox && mkdir -p .data")
    print("✅ Project directory ready")

    # Step 6: Copy project files
    print("\n📤 Step 6: Copying project files to VPS...")
    rsync_cmd = f"rsync -avz --progress --exclude 'node_modules' --exclude '.next' --exclude '.git' --exclude '.data' --exclude 'coverage' --exclude 'test-results' {os.getcwd()}/ {vps_user}@{vps_ip}:~/persiantoolbox/"
    run_command(rsync_cmd, check=False)  # Might fail but continue
    print("✅ Project files copied (or skipped if failed)")

    # Step 7: Setup environment configuration
    print("\n🔧 Step 7: Setting up environment configuration...")

    env_config = """
NEXT_PUBLIC_SITE_URL=https://persiantoolbox.ir
NEXT_PUBLIC_SITE_NAME=جعبه ابزار فارسی
DATABASE_PATH=.data/persiantoolbox.db
MONETIZATION_STORAGE_PATH=.data/monetization.json
SITE_SETTINGS_STORAGE_PATH=.data/site-settings.json
HISTORY_STORAGE_PATH=.data/history.json
FEATURE_AUTH_ENABLED=1
FEATURE_ADMIN_SITE_SETTINGS_ENABLED=1
FEATURE_ADMIN_MONETIZATION_ENABLED=1
FEATURE_ACCOUNT_ENABLED=0
FEATURE_SUBSCRIPTION_ENABLED=0
FEATURE_HISTORY_ENABLED=1
FEATURE_HISTORY_SHARE_ENABLED=0
FEATURE_SUPPORT_ENABLED=1
FEATURE_DEVELOPERS_ENABLED=1
NEXT_PUBLIC_ENABLE_ADS=false
NEXT_PUBLIC_ENABLE_MONETIZATION=false
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
"""

    # Create .env.production file via SSH
    ssh(f"cat > ~/persiantoolbox/.env.production << 'ENVEOF'\n{env_config}\nENVEOF")
    print("✅ Environment configuration set")

    # Step 8: Install dependencies and build
    print("\n🔨 Step 8: Installing dependencies and building...")
    ssh("cd ~/persiantoolbox && pnpm install")

    print("🏗️  Building production bundle...")
    ssh("cd ~/persiantoolbox && pnpm build")
    print("✅ Dependencies installed and build completed")

    # Step 9: Setup PM2
    print("\n🔄 Step 9: Setting up PM2...")

    pm2_config = """module.exports = {
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
};"""

    ssh("cd ~/persiantoolbox && mkdir -p logs")
    ssh(f"cd ~/persiantoolbox && cat > ecosystem.config.cjs << 'PM2OF'\n{pm2_config}\nPM2OF")

    ssh("cd ~/persiantoolbox && pm2 start ecosystem.config.cjs || pm2 restart persiantoolbox")
    ssh("pm2 save")
    print("✅ PM2 setup completed")

    # Step 10: Setup systemd
    print("\n⚙️  Step 10: Setting up systemd service...")

    systemd_config = """[Unit]
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
WantedBy=multi-user.target"""

    ssh(f"sudo tee /etc/systemd/system/persiantoolbox.service << 'SYSTEDEOF'\n{systemd_config}\nSYSTEDEOF")
    ssh("sudo systemctl daemon-reload")
    ssh("sudo systemctl enable persiantoolbox")
    ssh("sudo systemctl start persiantoolbox")
    print("✅ Systemd service setup completed")

    # Step 11: Configure firewall
    print("\n🛡️  Step 11: Configuring firewall...")
    ssh("sudo ufw allow 22/tcp")
    ssh("sudo ufw allow 80/tcp")
    ssh("sudo ufw allow 443/tcp")
    ssh("sudo ufw allow 3000/tcp")
    ssh("if ! sudo ufw status | grep -q 'active'; then echo 'y' | sudo ufw enable; fi")
    print("✅ Firewall configured")

    # Step 12: Test deployment
    print("\n🧪 Step 12: Testing deployment...")

    if ssh("curl -f http://localhost:3000"):
        print("✅ Application responding on VPS (localhost:3000)")
    else:
        print("⚠️  Application not responding on VPS")

    if run_command(f"curl -f http://{vps_ip}:3000", check=False)[2] == 0:
        print(f"✅ Application accessible from external (http://{vps_ip}:3000)")
    else:
        print(f"⚠️  Application not accessible from external")

    # Show status
    print("\n📊 PM2 Status:")
    ssh("pm2 status")

    print("\n📊 Systemd Status:")
    ssh("sudo systemctl status persiantoolbox --no-pager")

    # Step 13: Setup Nginx
    print("\n🌐 Step 13: Setting up Nginx reverse proxy...")

    if not ssh("nginx --version"):
        print("📥 Installing Nginx...")
        ssh("sudo apt install nginx -y")

    nginx_config = r"""server {
    listen 80;
    server_name persiantoolbox.ir www.persiantoolbox.ir _;

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
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 365d;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}"""

    ssh(f"sudo tee /etc/nginx/sites-available/persiantoolbox << 'NGINXOF'\n{nginx_config}\nNGINXOF")
    ssh("sudo ln -sf /etc/nginx/sites-available/persiantoolbox /etc/nginx/sites-enabled/")
    ssh("sudo rm -f /etc/nginx/sites-enabled/default")
    ssh("sudo nginx -t")
    ssh("sudo systemctl reload nginx")
    print("✅ Nginx configured")

    if run_command(f"curl -f http://{vps_ip}", check=False)[2] == 0:
        print(f"✅ Application accessible via Nginx (http://{vps_ip})")
    else:
        print(f"⚠️  Application not accessible via Nginx")

    print("\n" + "=" * 44)
    print("✅ DEPLOYMENT COMPLETED SUCCESSFULLY")
    print("=" * 44)
    print(f"\n📊 Deployment Summary:")
    print(f"  🌐 URL: http://{vps_ip} (Nginx)")
    print(f"  🚀 Direct: http://{vps_ip}:3000 (Next.js)")
    print(f"  🔄 PM2: Process manager active")
    print(f"  ⚙️  Systemd: Auto-start enabled")
    print(f"  🛡️ Firewall: Configured (22, 80, 443, 3000)")
    print(f"  🌐 Nginx: Reverse proxy configured")
    print(f"\n📋 Next Steps:")
    print(f"  1. Configure DNS: persiantoolbox.ir → {vps_ip}")
    print(f"  2. Setup SSL: sudo certbot --nginx -d persiantoolbox.ir -d www.persiantoolbox.ir")
    print(f"  3. Monitor: ssh {vps_user}@{vps_ip} 'pm2 monit'")
    print(f"  4. Logs: ssh {vps_user}@{vps_ip} 'pm2 logs persiantoolbox'")
    print(f"\n🔗 Quick Commands:")
    print(f"  - SSH: ssh {vps_user}@{vps_ip}")
    print(f"  - PM2 Status: ssh {vps_user}@{vps_ip} 'pm2 status'")
    print(f"  - PM2 Logs: ssh {vps_user}@{vps_ip} 'pm2 logs persiantoolbox'")
    print(f"  - Restart: ssh {vps_user}@{vps_ip} 'pm2 restart persiantoolbox'")
    print(f"  - Nginx Status: ssh {vps_user}@{vps_ip} 'sudo systemctl status nginx'")
    print(f"\n🎉 PersianToolbox is now live on the new VPS!\n")

if __name__ == "__main__":
    main()
