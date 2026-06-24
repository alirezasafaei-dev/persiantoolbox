#!/usr/bin/env bash
set -euo pipefail

echo "=== Setting up Redis for PersianToolbox ==="

# Install Redis
if ! command -v redis-cli &>/dev/null; then
  echo "[redis] Installing Redis..."
  sudo apt-get update -qq
  sudo apt-get install -y redis-server
  sudo systemctl enable redis-server
  sudo systemctl start redis-server
else
  echo "[redis] Redis already installed"
fi

# Verify Redis
if redis-cli ping | grep -q PONG; then
  echo "[redis] ✓ Redis is running"
else
  echo "[redis] ✗ Redis failed to start"
  exit 1
fi

# Set memory limit
echo "[redis] Setting memory limit to 256mb..."
sudo redis-cli CONFIG SET maxmemory 256mb
sudo redis-cli CONFIG SET maxmemory-policy allkeys-lru

# Make persistent
if ! grep -q "maxmemory 256mb" /etc/redis/redis.conf; then
  echo "maxmemory 256mb" | sudo tee -a /etc/redis/redis.conf > /dev/null
  echo "maxmemory-policy allkeys-lru" | sudo tee -a /etc/redis/redis.conf > /dev/null
  sudo systemctl restart redis-server
  echo "[redis] ✓ Memory config persisted"
fi

# Create nginx cache directory
echo "[nginx] Creating cache directories..."
sudo mkdir -p /var/cache/nginx/persiantoolbox/{static,pages,api}
sudo chown -R www-data:www-data /var/cache/nginx/persiantoolbox
echo "[nginx] ✓ Cache directories created"

# Install nginx config if not present
NGINX_CONF="/etc/nginx/conf.d/persiantoolbox-cache.conf"
if [ ! -f "$NGINX_CONF" ]; then
  echo "[nginx] Installing cache config..."
  sudo cp scripts/deploy/nginx-cache.conf "$NGINX_CONF"
  sudo nginx -t && sudo systemctl reload nginx
  echo "[nginx] ✓ Cache config installed"
else
  echo "[nginx] Cache config already exists at $NGINX_CONF"
fi

echo ""
echo "=== Setup Complete ==="
echo "Redis: redis://localhost:6379"
echo "Memory: 256mb"
echo "Nginx cache: /var/cache/nginx/persiantoolbox/"
