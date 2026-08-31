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
- [ ] Set `RESEND_API_KEY` in `.env` (Milestone 2 requires a real key for email
      verification & password-reset emails to actually send. Code handles the placeholder
      gracefully, but no email is delivered until this is set.)
- [ ] Set `APP_EMAIL_FROM` in `.env` (e.g. `Mystic Egypt <noreply@mysticegypt.net>`)
- [ ] Verify domain: `mysticegypt.net`
- [ ] Configure DNS records (SPF, DKIM, DMARC)

### 3. NextAuth Secret
- [ ] Generate a secure random string: `openssl rand -base64 32`
- [ ] Store as `NEXTAUTH_SECRET` in `.env`
- [ ] Set `NEXTAUTH_URL` (e.g. `http://localhost:3000` locally, `https://mysticegypt.net` in prod)

### 4. Google Analytics 4 (GA4)
- [ ] Create GA4 property for mysticegypt.net (see detailed steps below)
- [ ] Get **Measurement ID** (G-XXXXXXXXXX)
- [ ] Add to `NEXT_PUBLIC_GA_ID` in `.env`

#### Detailed GA4 Setup Steps

**Step 1: Create GA4 Property**
1. Go to https://analytics.google.com
2. Click **Admin** (gear icon, bottom-left)
3. Click **+ Create Property**
4. Property name: `Mystic Egypt`
5. Reporting time zone: `UTC` (or your preferred)
6. Currency: `British Pound (GBP)` or `US Dollar (USD)`
7. Click **Next**

**Step 2: Set Up Data Stream**
1. Business objectives: `Examine user behavior` (or select appropriate)
2. Click **Web** platform
3. Website URL: `mysticegypt.net`
4. Stream name: `Mystic Egypt Web`
5. Click **Create stream**
6. Copy the **Measurement ID** (format: `G-XXXXXXXXXX`)

**Step 3: Add Measurement ID to .env**
```env
NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"
```

**Step 4: Configure Enhanced Measurement**
1. In the data stream settings, click **Configure tag settings**
2. Enable **Enhanced measurement** (tracks page views, scrolls, outbound clicks, site search, file downloads automatically)

**Step 5: Set Up Conversion Events**
Go to **Admin > Conversions > New conversion event** and add:
| Event Name | Description |
|------------|-------------|
| `generate_lead` | User completes registration |
| `purchase` | User completes a booking |
| `sign_up` | User creates an account |

**Step 6: Test in Development**
1. Run `npm run dev`
2. Open browser DevTools > Network tab
3. Look for requests to `google-analytics.com` or `analytics.google.com`
4. In GA4, go to **Realtime** report to verify events appear

**Step 7: Privacy Considerations**
- The implementation respects the cookie consent banner (GDPR)
- GA4 cookies are only set after user clicks "Accept"
- No personal data is sent to GA4 (anonymized IP is default in GA4)

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
