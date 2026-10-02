#!/bin/bash
set -e

# ============================================
# Mystic Egypt — Deployment Script
# Run on VPS as root
# ============================================

APP_DIR="/var/www/mysticegypt"
DOMAIN="mysticegypt.net"

echo "=== [1/8] Creating directory structure ==="
mkdir -p "$APP_DIR/data/uploads/receipts"
mkdir -p "$APP_DIR/data/uploads/tours"
mkdir -p "$APP_DIR/data/uploads/stock"
mkdir -p "$APP_DIR/nginx"

echo "=== [2/8] Setting permissions ==="
chmod -R 755 "$APP_DIR/data/uploads"

echo "=== [3/8] Building Docker image ==="
cd "$APP_DIR"
docker compose build --no-cache

echo "=== [4/8] Starting container ==="
docker compose up -d

echo "=== [5/8] Waiting for app to be ready ==="
sleep 10
for i in $(seq 1 30); do
  if wget -q --spider http://127.0.0.1:3000 2>/dev/null; then
    echo "App is ready!"
    break
  fi
  echo "Waiting... ($i/30)"
  sleep 2
done

echo "=== [6/8] Running Prisma DB push ==="
docker compose exec -T app npx prisma db push --accept-data-loss 2>&1 || echo "Warning: prisma db push had issues (DB might already be synced)"

echo "=== [7/8] Configuring Nginx ==="
cat > /etc/nginx/sites-available/mysticegypt <<'NGINX_CONF'
# HTTP → HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name mysticegypt.net www.mysticegypt.net;
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name mysticegypt.net www.mysticegypt.net;

    # SSL will be configured by certbot after this step
    # ssl_certificate /etc/letsencrypt/live/mysticegypt.net/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/mysticegypt.net/privkey.pem;

    # Security headers (handled by Next.js, but add basics here too)
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Max upload size (for receipt images)
    client_max_body_size 10M;

    # Proxy to Next.js
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 60s;
        proxy_send_timeout 60s;
    }

    # Static files caching
    location /_next/static/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_cache_valid 200 365d;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Image optimization
    location /_next/image/ {
        proxy_pass http://127.0.0.1:3000;
    }

    # Uploaded files (direct access)
    location /uploads/ {
        alias /var/www/mysticegypt/data/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
NGINX_CONF

ln -sf /etc/nginx/sites-available/mysticegypt /etc/nginx/sites-enabled/mysticegypt
nginx -t && systemctl reload nginx

echo "=== [8/8] Setting up SSL with Let's Encrypt ==="
# First, temporarily enable HTTP-only config for certbot validation
cat > /etc/nginx/sites-available/mysticegypt-temp <<'NGINX_TEMP'
server {
    listen 80;
    listen [::]:80;
    server_name mysticegypt.net www.mysticegypt.net;
    root /var/www/mysticegypt/data;
    location / {
        try_files $uri $uri/ @nextjs;
    }
    location @nextjs {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINX_TEMP

ln -sf /etc/nginx/sites-available/mysticegypt-temp /etc/nginx/sites-enabled/mysticegypt
nginx -t && systemctl reload nginx

# Get SSL certificate
certbot certonly --webroot -w /var/www/mysticegypt/data \
  -d "$DOMAIN" -d "www.$DOMAIN" \
  --non-interactive --agree-tos --email "admin@$DOMAIN" || {
  echo "WARNING: certbot failed. SSL not configured yet."
  echo "Run manually: certbot certonly --webroot -w /var/www/mysticegypt/data -d $DOMAIN -d www.$DOMAIN"
}

# Now apply the full config with SSL
if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
  # Uncomment SSL lines in the main config
  sed -i 's/# ssl_certificate/ssl_certificate/' /etc/nginx/sites-available/mysticegypt
  sed -i 's/# ssl_certificate_key/ssl_certificate_key/' /etc/nginx/sites-available/mysticegypt
  ln -sf /etc/nginx/sites-available/mysticegypt /etc/nginx/sites-enabled/mysticegypt
  rm -f /etc/nginx/sites-available/mysticegypt-temp
  nginx -t && systemctl reload nginx
  echo "SSL configured successfully!"
else
  echo "SSL certificate not found. Using HTTP-only config."
  ln -sf /etc/nginx/sites-available/mysticegypt-temp /etc/nginx/sites-enabled/mysticegypt
  nginx -t && systemctl reload nginx
fi

echo ""
echo "============================================"
echo "  Deployment Complete!"
echo "  Site: https://$DOMAIN"
echo "  App:  http://127.0.0.1:3000"
echo "============================================"
echo ""
echo "Useful commands:"
echo "  cd $APP_DIR && docker compose logs -f     # View logs"
echo "  cd $APP_DIR && docker compose restart      # Restart app"
echo "  cd $APP_DIR && docker compose down         # Stop app"
echo "  cd $APP_DIR && docker compose up -d --build # Rebuild & start"
