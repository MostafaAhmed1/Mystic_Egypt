# MANUAL_STEPS.md - Human-Required Actions

## Status: ALL PENDING

---

## API Keys & Tokens (You Must Obtain)

### 1. Stripe (Payment Gateway)
- [ ] Create Stripe account at https://dashboard.stripe.com
- [ ] Get **Publishable Key** (pk_test_...)
- [ ] Get **Secret Key** (sk_test_...)
- [ ] Get **Webhook Signing Secret** (whsec_...)
- [ ] Configure webhook endpoint: `https://mysticegypt.net/api/webhooks/stripe`
- [ ] Enable test mode first, switch to live before go-live

### 2. Resend (Email Service)
- [ ] Create Resend account at https://resend.com
- [ ] Get **API Key** (re_...)
- [ ] Verify domain: `mysticegypt.net`
- [ ] Configure DNS records (SPF, DKIM, DMARC)

### 3. NextAuth Secret
- [ ] Generate a secure random string: `openssl rand -base64 32`
- [ ] Store as `NEXTAUTH_SECRET` in `.env`

### 4. Google Analytics 4
- [ ] Create GA4 property for mysticegypt.net
- [ ] Get **Measurement ID** (G-XXXXXXXXXX)
- [ ] Add to `NEXT_PUBLIC_GA_ID` in `.env`

### 5. WhatsApp Click-to-Chat
- [ ] Confirm the phone number for WhatsApp messages
- [ ] Format: international with + (e.g., +44XXXXXXXXXX)
- [ ] Add to site configuration

---

## Server Configuration (VPS)

### 1. Prerequisites Installation
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js LTS (via NodeSource)
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Install MariaDB
sudo apt install -y mariadb-server
sudo mysql_secure_installation

# Install Certbot (SSL)
sudo apt install -y certbot python3-certbot-nginx
```

### 2. Database Setup
```bash
sudo mysql -u root
```
```sql
CREATE DATABASE mystic_egypt;
CREATE USER 'mystic_user'@'localhost' IDENTIFIED BY 'STRONG_PASSWORD_HERE';
GRANT ALL PRIVILEGES ON mystic_egypt.* TO 'mystic_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. Application Directory
```bash
sudo mkdir -p /var/www/mystic-egypt
sudo chown $USER:$USER /var/www/mystic-egypt
cd /var/www/mystic-egypt
git clone <REPO_URL> .
npm install --production
```

### 4. Nginx Configuration
```nginx
server {
    listen 80;
    server_name mysticegypt.net www.mysticegypt.net;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name mysticegypt.net www.mysticegypt.net;

    ssl_certificate /etc/letsencrypt/live/mysticegypt.net/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/mysticegypt.net/privkey.pem;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-Frame-Options DENY always;

    # Block script execution in uploads
    location /uploads/ {
        location ~* \.(php|py|sh|cgi)$ {
            deny all;
        }
    }

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 5. SSL Certificate
```bash
sudo certbot --nginx -d mysticegypt.net -d www.mysticegypt.net
sudo certbot renew --dry-run
```

### 6. PM2 Setup
```bash
cd /var/www/mystic-egypt
pm2 start npm --name "mystic-egypt-app" -- start
pm2 save
pm2 startup
```

---

## Domain / DNS Settings

### Required DNS Records
| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | VPS_IP_ADDRESS | 300 |
| A | www | VPS_IP_ADDRESS | 300 |
| CNAME | mail | (if using custom email) | 300 |

### Email DNS (for Resend)
| Type | Name | Value |
|------|------|-------|
| TXT | @ | v=spf1 include:resend.com ~all |
| CNAME | resend._domainkey | (from Resend dashboard) |
| TXT | _dmarc | v=DMARC1; p=quarantine; rua=mailto:admin@mysticegypt.net |

---

## Environment Variables (.env)

```env
# Database
DATABASE_URL="mysql://mystic_user:STRONG_PASSWORD@localhost:3306/mystic_egypt"

# NextAuth
NEXTAUTH_URL="https://mysticegypt.net"
NEXTAUTH_SECRET="GENERATE_WITH_openssl_rand_base64_32"

# Stripe
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Resend
RESEND_API_KEY="re_..."

# Google Analytics
NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"

# WhatsApp
NEXT_PUBLIC_WHATSAPP_NUMBER="+44XXXXXXXXXX"
```

---

## Pre-Launch Checklist

- [ ] All API keys obtained and tested
- [ ] Database created and user permissions set
- [ ] Nginx configured with reverse proxy
- [ ] SSL certificate installed and auto-renewal verified
- [ ] PM2 process running and configured for startup
- [ ] DNS records propagated (check with `dig mysticegypt.net`)
- [ ] `public/uploads/` directory blocks script execution
- [ ] Stripe in test mode verified end-to-end
- [ ] Resend email delivery tested
- [ ] Image optimization verified (WebP/AVIF)
- [ ] Security headers verified (HSTS, X-Frame-Options)
