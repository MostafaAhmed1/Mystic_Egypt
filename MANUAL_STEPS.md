# MANUAL_STEPS.md - Human-Required Actions

## Status: PRODUCTION DEPLOYED (as-built Sept 2026; A+B+C+D release live 2 Oct 2026; Hot Offers redesign `2026-10-02-offers-bar` live 2 Oct 2026)

> NOTE: The "Server Configuration (VPS)" / PM2 / `mystic_user` instructions further
> down are the ORIGINAL blueprint and DO NOT match reality. The production server
> runs Docker + an existing MariaDB user. Read "Server Access & Deployment" below.

---

## Server Access & Deployment (AS-BUILT — keep this section updated)

### 1. Access the VPS
```
Host IP : 72.61.209.105   (single VPS hosts the whole project)
SSH     : ssh root@72.61.209.105        (root key/password auth)
Domain  : https://mysticegypt.net
```

### 2. Topology (critical facts)
- **Everything runs on ONE server** (the VPS above).
- **Application:** Next.js 16 standalone build running in a **Docker container**
  named `mystic-egypt`. The image (`Dockerfile.deploy`, slim/packaging only) wraps a
  **locally-built standalone bundle** extracted under `/var/www/mysticegypt/releases/<tag>/app`.
  Source is NOT in the image and is never compiled on the server.
- **Database:** MariaDB runs **on the same VPS** (localhost). The container reaches
  it through `host.docker.internal` → Docker host gateway `172.17.0.1` → port 3306.
  DB name: `mystic_egypt`.
- **Web server:** Nginx terminates HTTPS (`mysticegypt.net`) and proxies to
  `http://127.0.0.1:3100` (the container). SSL = Let's Encrypt via certbot.
- **Deploys are artifact-based:** local build → tarball → server-side slim-image swap
  (~seconds downtime). See §6. `scripts/package-release.ps1` (local) + `scripts/release.sh`
  (VPS) are canonical.

### 3. Directories & files
```
/var/www/mysticegypt/            ← repo checkout (release scripts/Dockerfile live here)
    Dockerfile.deploy            ← SLIM image: COPY standalone bundle (packaging only, seconds)
    scripts/release.sh           ← server-side install: extract → docker build → swap → verify
    releases/<tag>/app/          ← extracted standalone bundle (server.js, .next, public, node_modules)
    .env                         ← REAL working credentials (runtime source of truth)
    .env.container               ← env file passed to docker run (see §5)
    .env.production              ← PLACEHOLDER TEMPLATE only — do NOT use for the container
```
> The OLD build-on-server `Dockerfile` is retired (built `next build` inside the image,
> ~40 min). The repo `.dockerignore` excludes `.next`/`node_modules`, so the slim build
> must run with `--file /var/www/mysticegypt/Dockerfile.deploy` against the bundle dir
> (which has NO .dockerignore) — never against `/var/www/mysticegypt`.

### 4. Container (running state)
```
Container : mystic-egypt          Image : mystic-egypt-new:latest
Ports     : 3100 -> 3000          Restart : unless-stopped
```
**Inspect the current box:**
```bash
docker inspect mystic-egypt --format "Image={{.Config.Image}} ExtraHosts={{.HostConfig.ExtraHosts}} Restart={{.HostConfig.RestartPolicy.Name}}"
```

### 5. Recreate the container (exact command — do not drop flags)
```bash
docker rm -f mystic-egypt
docker run -d --name mystic-egypt --restart unless-stopped \
  -p 3100:3000 \
  --add-host host.docker.internal:host-gateway \
  --env-file /var/www/mysticegypt/.env.container \
  -v /var/www/mysticegypt/data/uploads:/app/public/uploads \
  mystic-egypt-new:latest
```
**GOTCHA — `--add-host host.docker.internal:host-gateway` is REQUIRED.**
On this Linux host `host.docker.internal` does NOT resolve by default. If dropped,
the app 500s with Prisma `pool timeout` (Db match: `P2039`) because the DB is unreachable.

**GOTCHA — `-v …/data/uploads:/app/public/uploads` is REQUIRED** (added 22 Sep 2026, M5).
The running container binds the host uploads dir; without it, tour images/receipts under
`/uploads` stop being served (and admin uploads go to a throwaway layer).

**GOTCHA — host uploads dir must be owned by uid 1001** (fixed 1 Oct 2026).
The container runs as `nextjs` (uid 1001). If `/var/www/mysticegypt/data/uploads` is root-owned
(common when created with `mkdir -p` as root), EVERY admin upload fails with
`EACCES: permission denied, mkdir '/app/public/uploads/tours/admin'` — the UI only shows the generic
"Upload failed. Please try again." toast; receipt uploads break the same way. `scripts/release.sh`
now enforces `chown -R 1001:1001` + dirs `755` / files `644` on each release. Manual fix:
`chown -R 1001:1001 /var/www/mysticegypt/data/uploads`.

**GOTCHA — new files in `/var/www/mysticegypt/data/uploads` added AFTER container boot.
**Serving is cache-tied to the app's file system: Nginx serves them 200 but the Next image
optimizer / app-side lookups can 404 until the container is restarted (observed 23 Sep 2026).
After any manual upload to the host uploads dir, `docker restart mystic-egypt` (or a normal
release swap) clears the stale state. A release swap always fixes it.

**RULE — env-var changes need this RECREATE, not `docker restart`.**
`--env-file` is read only at container creation; `docker restart` keeps the OLD env
(learned in M3: phone-number fix required `docker rm -f` + `docker run`).

### 6. Deploy an update (ARTIFACT-BASED — build locally, upload a tarball, swap in seconds)
> **Canonical method (23 Sep 2026, replaces the old source-only rebuild):** the old flow
> rebuilt `next build` ON the server inside the Docker image (~40 min: compile ~23.5 min +
> TypeScript ~12 min, worse under 2-vCPU CPU steal). That is retired. Now the app is built
> LOCALLY (~75 s, Turbopack), packaged into a ~40–45 MB tarball containing ONLY the compiled
> standalone bundle (server.js + .next/server + .next/static + public + traced node_modules —
> NO source, NO dev node_modules, NO .env files), uploaded, and a slim `Dockerfile.deploy`
> image just COPYs it (packaging only, seconds). Downtime = the seconds of `docker rm -f` +
> `docker run`. The previous image is kept as `mystic-egypt-new:previous` for instant rollback.
>
> Two scripts codify this (NO ad-hoc one-liners):
> - `scripts/package-release.ps1` — run LOCALLY: pulls live `NEXT_PUBLIC_*` from the VPS,
>   `npm run build`, assembles the bundle, produces `releases/mystic-egypt-<tag>.tar.gz`.
> - `scripts/release.sh` — run ON the VPS: extracts the tarball to `releases/<tag>/app`,
>   builds the slim image, swaps the container with the exact §5 flags, health-checks, and
>   writes `/tmp/mystic-release.status`. Detaches so the client never blocks on ssh.

```bash
# 1. (LOCAL) build + package — tag auto-derives from git sha + date:
powershell -File scripts/package-release.ps1
#    → releases/mystic-egypt-2026-09-23-<sha>.tar.gz  (~40-45 MB)

# 2. (LOCAL) upload the tarball to the VPS:
scp 'releases/mystic-egypt-2026-09-23-<sha>.tar.gz' 'root@72.61.209.105:/tmp/'

# 3. Upload the release + deploy scripts/Dockerfile FIRST time only (repo root files):
scp 'scripts/release.sh' 'Dockerfile.deploy' 'root@72.61.209.105:/var/www/mysticegypt/scripts/' 'root@72.61.209.105:/var/www/mysticegypt/'
#    (docker build uses -f $APP/Dockerfile.deploy; keep it at repo root on the server)

# 4. Kick off the server-side install (returns immediately; runs detached, outlives ssh):
ssh root@72.61.209.105 'cd /var/www/mysticegypt && bash scripts/release.sh /tmp/mystic-egypt-2026-09-23-<sha>.tar.gz'

# 5. Watch (NO loops — just re-cat until you see RELEASE_COMPLETE):
ssh root@72.61.209.105 'cat /tmp/mystic-release.status'
```

- **The tarball NEVER contains `.env*` files** (they are stripped by the packaging script) —
  the container gets env at runtime from `/var/www/mysticegypt/.env.container` (`--env-file`),
  unchanged. Env-var-only changes still need the §5 recreate, not a rebuild.
- **`NEXT_PUBLIC_*` parity is enforced by the packaging script:** it fetches the LIVE values
  from the VPS (`.env.production` + `.env`) and injects them as build-time vars before
  `npm run build`. A locally-built bundle would otherwise bake the LOCAL `.env.production`
  values into the client JS (e.g. a different GA ID) — verified hashes must match
  (server GA_ID sha `5CEB705384BF`, WHATSAPP sha `6FC687EE365A`).
- **Manual fallback** (if the scripts are unavailable):
  ```bash
  # local: npm run build; copy standalone+static+public into a dir; tar it; scp to /tmp
  # server:
  ssh root@72.61.209.105 'mkdir -p /var/www/mysticegypt/releases/manual/app && tar -xzf /tmp/mystic-egypt-manual.tar.gz -C /var/www/mysticegypt/releases/manual/app && cd /var/www/mysticegypt/releases/manual/app && docker build -f /var/www/mysticegypt/Dockerfile.deploy -t mystic-egypt-new:latest . && docker rm -f mystic-egypt && docker run -d --name mystic-egypt --restart unless-stopped -p 3100:3000 --add-host host.docker.internal:host-gateway --env-file /var/www/mysticegypt/.env.container -v /var/www/mysticegypt/data/uploads:/app/public/uploads mystic-egypt-new:latest'
  ssh root@72.61.209.105 'for u in /en /en/tours /en/tours/fayoum; do curl -s -o /dev/null -w "%{http_code} $u\n" --max-time 25 http://localhost:3100$u; done'
  ```
- **Rollback (instant, image already on the box):**
  ```bash
  ssh root@72.61.209.105 'docker rm -f mystic-egypt && docker tag mystic-egypt-new:previous mystic-egypt-new:latest && docker run -d --name mystic-egypt --restart unless-stopped -p 3100:3000 --add-host host.docker.internal:host-gateway --env-file /var/www/mysticegypt/.env.container -v /var/www/mysticegypt/data/uploads:/app/public/uploads mystic-egypt-new:latest'
  ```

###### Quick Deploy Checklist (runbook — 10 Sep 2026, GA4 deploy used this)
```bash
# 0. (only if files/schema changed) upload changed files, e.g.:
scp 'prisma/schema.prisma' 'src/core/lib/analytics.ts' 'root@72.61.209.105:/var/www/mysticegypt/prisma/' 'root@72.61.209.105:/var/www/mysticegypt/src/core/lib/'

# 1. Rebuild image (site stays up during build, old container keeps serving):
ssh root@72.61.209.105 'cd /var/www/mysticegypt && nohup docker build -t mystic-egypt-new . > /tmp/mystic-build.log 2>&1 &'
# watch: ssh root@72.61.209.105 'tail -n 6 /tmp/mystic-build.log'  → done when you see "Successfully tagged"

# 2. Recreate container (exact flags — do NOT drop --add-host or -v uploads mount):
ssh root@72.61.209.105 'docker rm -f mystic-egypt && docker run -d --name mystic-egypt --restart unless-stopped -p 3100:3000 --add-host host.docker.internal:host-gateway --env-file /var/www/mysticegypt/.env.container -v /var/www/mysticegypt/data/uploads:/app/public/uploads mystic-egypt-new:latest'

# 3. Verify:
ssh root@72.61.209.105 'sleep 10; for u in /en /en/tours /en/tours/fayoum; do curl -s -o /dev/null -w "%{http_code} $u\n" --max-time 25 http://localhost:3100$u; done'

# 4. Free disk after builds (build cache grows ~10GB/image build):
ssh root@72.61.209.105 'docker builder prune -f && docker image prune -f && rm -f /tmp/mystic-build.log'
```

###### Server hygiene / cleanup (runbook — 22 Sep 2026, milestone M4 executed)
```bash
# Remove deploy/build temp artifacts (M4 cleaned these):
ssh root@72.61.209.105 'rm -f /tmp/mystic-build.log /tmp/mystic-deploy.tar.gz'

# Remove FAILED build-step containers first — they pin dangling images so
# `image prune` alone reclaims 0B (M4 found 5 × Exited(1) npx/npm steps):
ssh root@72.61.209.105 'docker ps -a --filter status=exited --format "{{.ID}} {{.Image}} {{.Status}}"'
ssh root@72.61.209.105 'docker rm <ids…> && docker image prune -f'

# Prune build cache:
ssh root@72.61.209.105 'docker builder prune -f'

# PM2 god-daemon + per-app logs — biggest win (M4-EXT 22 Sep 2026 freed ~22.5 GB:
# eixir-api-out.log alone was 16.5 GB, pm2.log 4.5 GB). Safe while pm2 runs; apps stay online:
ssh root@72.61.209.105 'pm2 flush'

# Root user caches (uv/electron/node-gyp/prisma/typescript ≈428 MB + npm _cacache 2.2 GB) + apt:
ssh root@72.61.209.105 'rm -rf /root/.cache /root/.npm/_cacache && apt-get clean'
```
**GOTCHAS (observed in M4):**
- `docker image prune` can appear to HANG: if its progress output pipe (via a timed-out
  ssh session) is never drained, the CLI client blocks AFTER the daemon already finished.
  Verify with `docker images -f dangling=true -q` (count 0 = done) safe to `kill` the
  orphaned client PIDs; the daemon operation is complete.
- Current disk state after M4+EXT: `/dev/sda1` 32G/96G used (33%), 65G free; dangling = 0;
  `mystic-egypt-new:previous` tag does not exist (only `:latest`).
- **NEVER clean (other projects/services on this VPS):** `/var/www/**` other than
  `mysticegypt`, pm2-managed apps (flush their LOGS only), `dokploy_dokploy-data` volume,
  containers `dawenli`/`sqlserver`, `/tmp` sockets/pipes (`clr-debug-pipe-*`,
  `dotnet-diagnostic-*`, `code-*.sock`) and `systemd-private-*`/X11 dirs.
- Local repo hygiene also applied: root-level `dev-server.err.log` + `dev-server.out.log`
  deleted (AGENTS.md §10).

###### Server is PRODUCTION-ONLY (policy set 2 Oct 2026, executed the same day)
**Policy:** `/var/www/mysticegypt` holds ONLY production runtime files + the CURRENT release.
Old releases are deleted the moment the new one is verified working; docs/plans/source/
dev-config never live on the server (they belong to the repo, not the VPS).

**Keep-list (everything else is fair game):**
```
.env  .env.container  (+ current .bak safety copies)
Dockerfile.deploy          # release.sh docker build -f target
scripts/release.sh         # deploy entrypoint (artifact-based, §6)
data/                      # bind-mount source: uploads/ + backup_*.sql (NEVER delete)
releases/<current-tag>/    # exactly ONE release dir (rollback = image :previous, not a dir)
```
**Removed 2 Oct 2026 (after `2026-10-02-meta-pixel-fix` verified live):** 9 old release dirs
(releases/ 1.4G → 136M), `docs/` (PRD/plans/social posts), root `*.md` (AGENTS/PROJECT_MAP/
MANUAL_STEPS/README/EXECUTION_PLAN/UI_TEST_PLAN), `src/`, `prisma/`, `public/` (stale —
live uploads live in `data/uploads`, bind-mounted), stray `srcfeatures*` dirs, `nginx/` (empty),
dev configs (`package.json`, `tsconfig`, `next.config.ts`, `eslint/postcss/components`,
`.env.example`, `.env.production` placeholder, `.gitignore`, `.dockerignore`), retired
build-on-server `Dockerfile`, `docker-compose.yml`, old `deploy.sh` ×2, `prisma.config.ts(.bak)`,
`scripts/deploy.sh`, `/tmp` tarballs.
- `.env.production` deleted is SAFE: `package-release.ps1` greps it + `.env` with
  `2>/dev/null` — all 5 `NEXT_PUBLIC_*` keys exist in `.env`, so builds keep working.
- Post-cleanup health: container Up, `/en` `/en/tours` → 200, bind mount untouched.

###### DB migration pattern (when schema.prisma changes)
```bash
# Backup first (keep ONLY the latest; mirror to repo `backups/`):
ssh root@72.61.209.105 'PW=$(sed -n "s/.*:\/\/mystic_app:\([^@]*\)@.*/\1/p" /var/www/mysticegypt/.env|head -1); mysqldump -u mystic_app "-p$PW" -h 127.0.0.1 --single-transaction mystic_egypt bookings > /var/www/mysticegypt/data/backup_$(date +%F).sql'
scp "root@72.61.209.105:/var/www/mysticegypt/data/backup_$(date +%F).sql" "backups/"

# Then run the ALTERs manually (NO prisma migrate / db push on prod):
ssh root@72.61.209.105 'PW=$(sed -n "s/.*:\/\/mystic_app:\([^@]*\)@.*/\1/p" /var/www/mysticegypt/.env|head -1); mariadb -u mystic_app "-p$PW" -h 127.0.0.1 mystic_egypt -e "ALTER TABLE bookings ... ;"'
```

### 7. Database access
```bash
# From the VPS host (MariaDB is local, no tunnel needed):
mariadb -u mystic_app -p -h 127.0.0.1 mystic_egypt
# User: mystic_app   (host: '%', i.e. reachable from localhost, container gateway, and public IP)
# Password: stored in /var/www/mysticegypt/.env -> DATABASE_URL (NOT committed to the repo)
```
- Prisma 7 uses `@prisma/adapter-mariadb` which REQUIRES the `mariadb://` URL scheme
  (not `mysql://`) — e.g. `mariadb://mystic_app:PASSWORD@host.docker.internal:3306/mystic_egypt`.
- `root@'%'` and `root@localhost` exist but their passwords are unknown/unset — use `mystic_app`.
- Migration policy: **no `prisma migrate`** (DB is drift-prone, would reset data). Schema
  changes on prod are applied manually via `ALTER TABLE` (e.g. `ADD COLUMN duration VARCHAR(255) NULL`).

### Homepage database application (local first — pending)

**Status update 2026-10-02 (EOD):** `categories` and `services` are **live on production** (manual
SQL — see below). The **`offers` table no longer exists** — the Hot Offers feature was redesigned the
same day to use `tours.isOffer` instead (see the redesign checklist below); its CREATE/seed rows above
are historical only. The full seed has NEVER been run against prod. The local-only procedure below
remains the reference for schema-changing work.

The homepage code and seed are present, but the current local `DATABASE_URL` resolves to the
production VPS database. Do not use it for any schema-changing command.

**Local-only application procedure:**
- [ ] Create or obtain an isolated local MariaDB database (for example, `mystic_egypt_local`) and a local user.
- [ ] Confirm the URL host is local and does **not** contain `72.61.209.105`.
- [ ] Set the URL in the current PowerShell session using the `mariadb://` scheme required by Prisma 7.
- [ ] Run `npm run db:generate` against the local schema.
- [ ] Run `npm run db:push` only against the isolated local database.
- [ ] Run `npm run db:seed` only against the isolated local database.
- [ ] Verify six `categories` rows and four `services` rows, then remove or rotate the temporary local credentials.

Example for the command session (replace credentials locally; never commit them):
```powershell
$env:DATABASE_URL = "mariadb://LOCAL_USER:LOCAL_PASSWORD@127.0.0.1:3306/mystic_egypt_local"
npm run db:generate
npm run db:push
npm run db:seed
```

**Production application procedure (manual approval required):**
- [x] Back up `mystic_egypt` before any schema change — first offers DDL used `data/backup_full_2026-10-02.sql`
      (mirrored to repo `backups/backup_full_2026-10-02.sql`, 16 tables, 55 KB).
- [x] Apply reviewed `CREATE TABLE`/index SQL manually (never `prisma migrate`/`db push` on prod).
      `categories`/`services` applied earlier; `offers` was created 2026-10-02 **and dropped the same day**
      (superseded by the `Tour.isOffer` redesign — no longer exists).
- [x] Insert only reviewed rows — offers seeded via `INSERT IGNORE` (3 rows) but the whole table was
      dropped on redesign day; offer tours are now ordinary `tours` rows with `isOffer = 1`.
      Full seed still prohibited (it also manages users/add-ons/tours).
- [ ] Copy any new `public/uploads/...` files to `/var/www/mysticegypt/data/uploads/...`, preserving paths
      (tour catalog images already exist on the server under `catalog/`).
- [x] Container recreated via artifact release; verify all three locales + admin CRUD flow (done 2026-10-02).

**Hot Offers redesign DDL — EXECUTED 2026-10-02 (release `2026-10-02-offers-bar`):**
- [x] Back up first: `data/backup_full_2026-10-02_pre_drop_offers.sql` (60 KB, full DB).
- [x] `ALTER TABLE tours ADD COLUMN isOffer BOOLEAN NOT NULL DEFAULT false;`
- [x] Flag 5 tours: `UPDATE tours SET isOffer = 1 WHERE slug IN ('cairo','luxor','hurghada','fayoum','classic-nile-cruise-cairo');`
- [x] `DROP TABLE IF EXISTS offers;` (PRD-compliant removal; code no longer references it)
- [x] Verified: column present, `offer_count = 5`, `offers` gone; old API `/api/admin/homepage/offers` → 404.

### 8. Nginx / SSL facts
```
Config files : /etc/nginx/sites-enabled/mysticegypt  (server_name mysticegypt.net)
               ^^^ REAL FILE, not a symlink — the sibling /etc/nginx/sites-available/mysticegypt
               is a separate copy; edit BOTH (they were synced 2026-10-02 after drifting)
HTTP  : 80    -> 301 https
HTTPS : 443   -> proxy_pass http://127.0.0.1:3100   (SSL: /etc/letsencrypt/live/mysticegypt.net/)
/uploads/ location aliases /var/www/mysticegypt/data/uploads/  (static, 30d cache)
client_max_body_size 12M   (raised 10M -> 12M on 2026-10-02 for receipt uploads;
                            backup: /etc/nginx/backups/mysticegypt.bak.2026-10-02)
Change flow: edit file(s) -> nginx -t -> systemctl reload nginx  (also grep sites-enabled,
             not just sites-available — reload reads sites-enabled!)
```

### 9. Known production gotchas (learned the hard way — read before changing pages)
- **`DYNAMIC_SERVER_USAGE` 500s:** any route marked static (`generateStaticParams`+`revalidate`)
  that renders the layout would 500 in production because `PublicHeader`
  (`src/shared/components/public-header.tsx`) called `cookies()`/`getCurrentUser()`.
  **RESOLVED (local, 23 Sept 2026, ships with next deploy):** `PublicHeader` is a `"use client"`
  component (`useSession()` + `useLocale()`) — the `(public)` tree now prerenders (`/[locale]` SSG+ISR)
  and the `force-dynamic` workaround on `tours/[slug]/page.tsx` was removed. Do NOT re-add `force-dynamic`
  to public routes for session/cookies reasons. Only `requireUser()` routes (dashboard/admin/book) are dynamic.
- **`NEXT_PUBLIC_*` build-time precedence:** `next build` loads `.env.production` (it exists on
  the server as a placeholder template) with HIGHER priority than `.env`. Therefore any
  `NEXT_PUBLIC_*` value in `.env.production` is baked into the image. **Keep the real values in
  `.env.production` too** — the GA4 deploy fixed `NEXT_PUBLIC_GA_ID` / `NEXT_PUBLIC_WHATSAPP_NUMBER`
  there to match `.env`. If you re-create `.env.production`, copy the real `NEXT_PUBLIC_*` values.
- **Server-side env (non-public):** read from `.env.container` at runtime — add any new secret
  (e.g. `GA_MEASUREMENT_SECRET`) to BOTH `.env` and `.env.container`, then recreate the container
  (no image rebuild needed for env-only changes).
- Real Stripe / Resend / GA / WhatsApp env values on the server are live (no longer placeholders).
- **Uploads must pass the proxy matcher:** `src/proxy.ts` had a matcher gap — non-image upload
  extensions (`.pdf` receipts etc.) under `/uploads/` fell through to Next instead of being served,
  and image serving from the app now lives in `src/app/uploads/[...path]/route.ts`. Keep
  `uploads/(.*)` in the matcher and that route together; removing either breaks receipt/invoice PDFs.
- **Bundle-size trap in the uploads route:** `fs.stat`/`fs.readFile` in
  `src/app/uploads/[...path]/route.ts` MUST keep the `/*turbopackIgnore: true*/` call comments —
  Turbopack otherwise treats the dynamic fs access as whole-project tracing and the release tarball
  balloons from ~40 MB to ~521 MB (source + dev node_modules shipped in standalone output).
- **After `npx prisma generate` (or any code edit) in dev:** restart `next dev` — a running dev
  server keeps a Prisma singleton from boot (`prisma.offer` undefined, `Promise.allSettled` hides it)
  and stale Turbopack cache (`.next/cache`) can serve pre-edit client bundles (crashes/hydration
  mismatches). Symptom: page loads but new DB models/APIs 404 or the UI runs old code → full
  `Remove-Item -Recurse .next` + restart fixes it.
  Resend key is interim — user will rotate after final confirmation.
- Local `next dev` repro tip: DATABASE_URL must use `mariadb://mystic_app:...@72.61.209.105:3306/mystic_egypt`.

---

## API Keys & Tokens (You Must Obtain)

### 1. Stripe (Payment Gateway) — ✅ ACTIVE — TEST MODE (Sept 2026)
- [x] Stripe account created (acct `acct_1So9atCEY99QqzyR`)
- [x] **Publishable Key** + **Secret Key** (test mode) deployed to server `.env` + `.env.container`
      (real values ONLY in `/var/www/mysticegypt/.env` — NOT in git)
- [x] Webhook endpoint created on Stripe: `https://mysticegypt.net/api/webhooks/stripe`
      (id `we_1UDvRUCEY99QqzyR27OTzDHW`, enabled, event `payment_intent.succeeded`)
- [x] Real **Webhook Signing Secret** (`whsec_...`) obtained via API & deployed — NOTE: the
      `whsec_RVbOy...` value supplied earlier was orphan (no endpoint); the live one came from
      Stripe when the endpoint was created and is the one on the server.
- [x] **E2E verified** 10 Sep 2026: full browser flow (register → email OTP via Resend → login →
      book Fayoum) paid with Stripe test card `4242 4242 4242 4242` → PaymentIntent `pi_3UEAA9` ✓
      **succeeded (€110)** → webhook delivered → booking `aa408f72` set **CONFIRMED** in DB →
      invoice `ME-20260910-X4TW6Q` auto-created → confirmation email sent via Resend (suppressed
      because the test address lives on the non-receiving domain; real addresses deliver).
- [x] **Bug found & fixed during E2E (10 Sep 2026):** Stripe checkout errored
      *"You must provide a return_url when confirming a PaymentIntent with the payment
      method type bancontact"* — caused by `automatic_payment_methods: { enabled: true }`
      exposing redirect-based EU methods (bancontact, Klarna, iDEAL…) with no `return_url`.
      Fix: `confirmPayment({ redirect: "if_required", confirmParams: { return_url } })`
      in `StripePaymentSection.tsx` + a return-handler in `CheckoutForm.tsx` that reads
      `payment_intent_client_secret`/`booking_id` from the URL after the redirect and
      verifies success via `stripe.retrievePaymentIntent()`.
- [x] **Multiple payment methods (EU) E2E verified (10 Sep 2026):** PaymentIntent now uses
      `automatic_payment_methods: { enabled: true }` → exposes every method enabled in the
      Stripe Dashboard (`card, bancontact, eps, link` in test mode for MYSTIC EYGPT acct).
      Full redirect flow tested end-to-end with **Bancontact test page**: customer authorises
      → returns to booking page with `payment_intent_client_secret` → success screen shown →
      webhook confirms booking `81d3474d` (CONFIRMED) → invoice `ME-20260910-SB4KXH` created.
      **Manage available methods (no code change needed):** Stripe Dashboard → Settings →
      Payment methods → toggle any method on/off per region (test mode for prod parity).
- [x] **Invoice PDF logo (10 Sep 2026):** `InvoicePDF.tsx` embeds `public/logo.png` (537×215)
      top-left of the invoice header. Verified: the generated PDF contains an embedded image
      with exact logo dimensions.
- [ ] Switch account to **live** before real sales (pk_live_/sk_live_/new webhook in live mode)
      — keep test-only until the owner approves go-live.

### 2. Resend (Email Service) — ✅ ACTIVE (Sept 2026)
- [x] Create Resend account at https://resend.com
- [x] Get **API Key** (re_...) — live key deployed to server
- [x] Set `RESEND_API_KEY` in server `.env` + `.env.container` (real value lives ONLY on the VPS: `/var/www/mysticegypt/.env` — piped into the container via `--env-file`; NOT in git).
- [x] Set `APP_EMAIL_FROM` in server `.env` + `.env.container` = `Mystic Egypt <noreply@mysticegypt.net>`
- [x] Verify domain: `mysticegypt.net` → status **verified** (region `eu-west-1`)
- [x] Configure DNS records (SPF, DKIM — verified)
- [x] Open + Click tracking **enabled** on the domain with `tracking_subdomain=links`
      → **DONE Sept 2026:** Tracking CNAME (`links → links1.resend-dns.com`) added by user;
      domain back to **verified** — all 4 records (DKIM, SPF×2, Tracking) verified.
- [x] Domain TLS enforcement set (`tls=enforced`).
- Note: an even stricter tracking subdomain is configured — tracking pixels/links are
      served from `links.mysticegypt.net` (not a generic domain).
- **Key rotation note (user):** the API key seen in chat is interim; user will rotate it on
      the server after final end-to-end confirmation. Only `.env`/`.env.container` on the VPS
      need updating (recreate container afterwards with the saved `docker run` command).

### 3. NextAuth Secret
- [ ] Generate a secure random string: `openssl rand -base64 32`
- [ ] Store as `NEXTAUTH_SECRET` in `.env`
- [ ] Set `NEXTAUTH_URL` (e.g. `http://localhost:3000` locally, `https://mysticegypt.net` in prod)

### 4. Google Analytics 4 (GA4) — ✅ ACTIVE (Sept 2026)
- [x] GA4 property created by owner at https://analytics.google.com
- [x] **Measurement ID:** `G-B960Q7XTDS`
- [x] `NEXT_PUBLIC_GA_ID=G-B960Q7XTDS` set in `.env` + `.env.container`
- [x] Verified: `gtag/js?id=G-B960Q7XTDS` loads, events fire to `google-analytics.com/g/collect` (204 success)
- [x] `AnalyticsProvider` + `useAnalytics` hook integrated — tracks page views and custom events
- [x] **GA_MEASUREMENT_SECRET — DEPLOYED 10 Sep 2026**: Measurement Protocol API secret
      created by owner and added to BOTH `/var/www/mysticegypt/.env` and `.env.container`
      (validated against `https://www.google-analytics.com/debug/mp/collect` → `validationMessages: []`).
- [x] **DB migration — EXECUTED 10 Sep 2026** (backup first:
      `mysqldump -u mystic_app -p... --single-transaction mystic_egypt bookings >
      data/backup_bookings_pre_ga4_2026-09-10.sql`, mirror kept in repo `backups/`):
  ```sql
  ALTER TABLE bookings
    ADD COLUMN ga_purchase_status ENUM('NOT_SENT','SENDING','SENT') NOT NULL DEFAULT 'NOT_SENT',
    ADD COLUMN ga_purchase_sent_at DATETIME NULL;
  ```
  (Equivalent to the Prisma `GaPurchaseStatus` enum + Booking fields in `schema.prisma`.
  Dev can use `npx prisma db push --accept-data-loss`.)
- **Post-setup recommended:** In GA4 Admin → Conversions, enable `generate_lead`,
  `begin_checkout`, and `purchase` as conversion events.
- **GA4 events implemented (Sept 2026):** `whatsapp_click` (header/mobile_nav/footer),
  `view_item` (tour detail), `generate_lead` (custom tour request success), `begin_checkout`
  (Stripe payment step reached), `purchase` (**server-side only**, via Stripe webhook,
  idempotent via `ga_purchase_status` on Booking).

#### Detailed GA4 Setup Steps (for reference)

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
| `generate_lead` | User submits a custom tour request |
| `begin_checkout` | User reaches the Stripe payment step |
| `purchase` | User completes a paid booking (server-side) |
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

### 5. WhatsApp Click-to-Chat — ✅ ACTIVE (Sept 2026)
- [x] Phone number: `447412880087`
- [x] `NEXT_PUBLIC_WHATSAPP_NUMBER=447412880087` set in `.env` + `.env.container`
- [x] Used by: desktop header, mobile nav, footer — all link to `wa.me/447412880087?text=...`
- [x] **Bug fixed (10 Sep 2026):** Footer WhatsApp link was hardcoded empty (`href="https://wa.me/"`);
  now reads from env var, same as header/mobile nav.

### 5b. Meta Pixel + Conversions API (CAPI) — ✅ PIXEL + TOKEN + EVENTS (Sept 24, 2026)
- [x] **Pixel ID:** `1510981584397229` (**replaced** old `3633452613471654` everywhere —
      `.env`, `.env.example`, docs).
- [x] **META_CAPI_TOKEN:** provided by owner (kept in local `.env` + server `.env`/`.env.container`
      only — NEVER committed).
- [x] **Code complete + DEPLOYED to production** (typecheck, lint, dev-server smoke, artifact release `2026-09-24-c725559`).
- **Events implemented:** `PageView` (all consented pages), `ViewContent` (tour detail),
  `Lead` (contact form submitted successfully), `InitiateCheckout` (fired on the **"Book Now"**
  CTA on the tour page and the **"View tour"** card links — browser + server CAPI via the
  `/api/analytics/meta` proxy, shared `event_id`; value = tour `base_price`, currency = tour
  `currency`), `Purchase` (browser on on-page Stripe success, `event_id = booking.id`; server
  CAPI in Stripe webhook `confirmBookingFromStripe`, gated by `meta_consent` carried in
  PaymentIntent metadata along with `fbp`/`fbc`). Dedup relies on the shared `event_id`.
  The old booking-completion `InitiateCheckout` (after booking creation) was **removed** to
  avoid double-counting — IC now fires on the CTA clicks instead.
- **Consent:** all Meta events gate on the existing `cookie_consent=accepted` cookie
  (same banner as GA4). Pixel stays inactive until user accepts.
- **user_data sent (CAPI):** SHA-256-hashed (lowercase hex) `em`, `ph`, `fn`, `ln` only —
  no address/geo fields exist in the DB. Browser Advanced Matching too. Graph API `v23.0`.
- **Deploy: ✅ DEPLOYED (Sept 24, 2026, tag `2026-09-24-c725559`, artifact-based §6).**
  1. Set the 4 Meta vars in server `.env` (source of truth) **and** `.env.container` —
     `NEXT_PUBLIC_META_PIXEL_ID=1510981584397229`, `META_PIXEL_ID=1510981584397229`,
     `META_CAPI_TOKEN=<owner token>`, `META_TEST_EVENT_CODE=""` (empty).
  2. `scripts/package-release.ps1` now ALSO injects `NEXT_PUBLIC_META_PIXEL_ID` at build
     time (fetched live from the server), so a local build always bakes the deployed pixel.
  3. Verified post-deploy: `/en`, `/en/tours`, `/en/tours/fayoum` → 200; new pixel
     `1510981584397229` baked into prod HTML (old `3633452613471654` absent); container env
     has all 4 Meta vars; rollback image `mystic-egypt-new:previous` preserved.
- **No DB schema change required** (dedup via `event_id`; no new Booking columns).
- **Post-deploy owner verification:** install Meta Pixel Helper extension → accept cookies →
  submit the contact form (see `Lead`) → open a tour (see `ViewContent`) → click
  "Book Now"/"View tour" (see `InitiateCheckout`) → run a test booking (see `Purchase`);
  then Events Manager → **Test Events** (`1510981584397229`) to confirm CAPI dedup
  (`event_id` match), and mark `Lead`/`InitiateCheckout`/`Purchase` as conversions in the
  Pixel settings.

#### 5b-fix. EVENTS ONLY FROM LOCALHOST — root causes + fix (✅ DEPLOYED 2 Oct 2026, tag `2026-10-02-meta-pixel-fix`)
> Symptom: Events Manager showed events ONLY with `localhost` URLs; zero from `mysticegypt.net`.

- **Root cause A — server CAPI (every prod server event failed):** the 4 Meta lines in the
  server `.env.container` (+ `.env`) were written with surrounding double quotes
  (`META_CAPI_TOKEN="EAA…"`). **Docker `--env-file` passes values LITERALLY — it does NOT
  strip quotes** (unlike dotenv/Next in dev) → container env held `"EAA…"` → Graph API
  `HTTP 400 Invalid OAuth access token - Cannot parse access token` (25/25 attempts failed
  in the week before the fix; token itself was valid — `debug_token is_valid:true`).
  `META_TEST_EVENT_CODE=""` was similarly a literal 2-char `""` (truthy → would have routed
  events to Test Events with a garbage code once auth worked).
  **FIX:** quotes stripped from all 4 lines in both server files → `META_CAPI_TOKEN` 203 chars
  (unquoted), `META_TEST_EVENT_CODE=` empty; container recreated. **RULE (permanent):**
  **values in `.env.container` must NEVER be quoted** — only dotenv-read files (`.env`) may
  use quotes. Local dev never reproduced this because dotenv strips quotes.
- **Root cause B — browser pixel never registered:** the loader snippet in
  `src/core/lib/meta-pixel.ts` started with `fbq('consent','revoke')`. When that is the FIRST
  queued call before `fbevents.js` loads, the flush DROPS the queued `consent grant` + `init`
  behind it → `fbq.getState().pixels` stays `[]`, `pixelInitializationTime: -1`, no `_fbp`,
  no `facebook.com/tr` beacons — in ALL prod flows (first-visit accept AND returning
  consented visitor). Proven by isolated A/B tests: `[revoke,grant,init]` fails /
  `[grant,init]` succeeds. The revoke was pointless anyway (snippet only injects AFTER
  consent). **FIX:** removed from the snippet; `consent grant` before `init` retained.
- **Root cause C — initial PageView lost:** the `pathname` effect in `meta-pixel-provider.tsx`
  ran before pixel init and never re-ran, so the first view of every FULL page load fired no
  PageView until an internal route change. **FIX:** `consent` added to that effect's deps
  (the init effect is declared above it → runs first in the same commit).
- **Verified post-deploy (2 Oct 2026):** prod accept → `pixels:[{id:1510981584397229,
  eventCount:1}]`, `_fbp` set, `GET www.facebook.com/tr/?ev=PageView&dl=https://mysticegypt.net/en`,
  `POST /api/analytics/meta` 200, zero `[meta-capi]` errors in container logs (was 100% failing).
  Local dev verified the same (tsc clean, lint at baseline 7 errors — none in touched files).
- **Owner check:** open Events Manager → events now appear with `mysticegypt.net` URLs;
  confirm browser+server dedup in Test Events (shared `event_id`), and confirm **Purchase**
  lands (Stripe webhook CAPI also unblocked by the token fix).

### 6. Google Search Console (GSC) — ✅ OWNERSHIP VERIFIED (DNS, Sept 2026) — بيانات الأداء لا تزال مطلوبة

**الوضع الحالي:** التحقق من الملكية **تم بنجاح** عبر سجل DNS (خطوات 1–10 أدناه) — **لا حاجة لوسم كود**.

**لماذا هذا مطلوب:** خطوات SEO التالية معلّقة عليه — **8** (استخراج فرص الاستعلامات → صفحات هبوط)،
**19** (التحقق من hreflang عبر تقرير International Targeting)، **28** (SEO البرمجي/الصفحات المُولّدة).
`docs/Seo_plan.md` يمنع صراحةً اختلاق بيانات GSC، لذا لا يمكن تنفيذها بدون ملكية مؤكَّدة.

**الطريقة الموصى بها: خاصية Domain عبر سجل DNS TXT** — تُغطّي `mysticegypt.net` + `www` + كل المسارات
واللغات (`/en`, `/ar`, `/de`) بتحقق واحد، ولا تتطلب أي تعديل كود أو نشر.

**الخطوات التفصيلية:**

1. افتح <https://search.google.com/search-console> وسجّل الدخول بحساب Google الخاص بالشركة
   (يُفضّل حساب مملوك للشركة لا حساب شخصي).
2. من القائمة العلوية اليسرى اضغط **Add property / إضافة عقار**.
3. اختر النوع الثاني **Domain** (وليس «URL prefix»).
4. اكتب `mysticegypt.net` — **بدون** `https://` و**بدون** `www`.
5. سيعرض Google سجل تحقق بالشكل:
   `google-site-verification=AbCdEf1234567890AbCdEf1234567890AbCdEf12`
   **انسخه بالكامل كما هو.**
6. اذهب إلى لوحة إدارة نطاقك عند مزوّد الدومين/DNS (حيث تدير سجلات النطاق).
7. أضف سجلاً جديداً:
   - **Type:** `TXT`
   - **Name / Host:** `@` (أي على الجذر `mysticegypt.net`)
   - **Value / Points to:** النص المنسوخ كاملاً (`google-site-verification=...`)
   - **TTL:** الافتراضي (Auto / 3600)
8. احفظ السجل. **تحذير:** لا تحذف أو تعدّل سجلات `TXT` الموجودة
   (`SPF` / `DKIM` / `DMARC` الخاصة بـ Resend والبريد) — **أضف سجلاً جديداً فقط**.
9. انتظر انتشار الـ DNS (عادةً 10–30 دقيقة، وقد تصل إلى 24 ساعة).
10. ارجع إلى Search Console واضغط **Verify / تحقّق**. إن فشل، انتظر ثم أعد المحاولة.
11. **أخبرني عند نجاح التحقق** لأكمل الخطوات المعتمدة عليه.

**إن فشل التحقق عبر DNS أو تعذّر الوصول للـ DNS:**
اختر «URL prefix» بدلاً من Domain، وستحصل على وسم `<meta name="google-site-verification" content="...">`.
هذه الطريقة **تتطلب تعديل كود ونشر إنتاجي**، وتغطّي `https://mysticegypt.net/` فقط (دون `www`)،
لذلك نفضّلها فقط كخطة بديلة — وأبلغني لأضيف الوسم في `src/app/[locale]/layout.tsx`.

**بعد نجاح التحقق — مهام إضافية إلزامية داخل GSC:**
- **Sitemaps:** `Sitemaps` → أضف `sitemap.xml` → Submit، وتأكد أن الحالة `Success` وأن عدد الروابط > 0.
- **robots.txt:** افتح `https://mysticegypt.net/robots.txt` وتأكد أنه لا يحجب مسارات نريد فهرستها
  (يجب أن يحجب فقط `/api/` و`/*/admin` و`/*/dashboard`).
- **International Targeting:** يجب أن يظهر `hreflang` صحيحاً لـ `ar` و`de` — يُتحقق منه في خطوة 19.
- **Associations:** اربط GA4 من `Settings → Associations → Google Analytics 4`.
- **متابعة دورية:** تقارير `Pages` (الفهرسة) و`Core Web Vitals` و`Enhancements`.
- **Bing Webmaster Tools (اختياري):** يستورد الملكية من GSC مباشرة بضغطة واحدة.

**ما أحتاجه منك للاستمرار:** بما أن التحقق تم — أرني الآن أي **بيانات أداء فعلية** من GSC (Performance: الاستعلامات/مرات الظهور/النقرات/CTR حسب البلد واللغة، أو مقتطف من تقرير Pages «Not indexed» وأسبابه) لأبني عليها خطوة 8 و19 و28.

### 7. Google Business Profile (GBP) — ⏳ REQUIRES HUMAN ACTION (not yet done)

**لماذا هذا مطلوب:** الحضور على خريطة جوجل + تقييمات حقيقية (أقوى إشارة ثقة محلية) — **مجاني**
ومستقل عن GSC. موقع حجز يحتاج ثقة محلية: السائح الألماني يبحث «Egypt travel agency» ويشاهد
الخريطة أولاً.

**الخطوات التفصيلية:**

1. افتح <https://business.google.com/> وسجّل الدخول بنفس حساب الشركة المستخدم في GSC.
2. اضغط **Add business / إضافة نشاط تجاري**.
3. الاسم: `Mystic Egypt`. الفئة: ابحث واختر **Travel agency** (أو **Tour operator** إن ظهرت).
4. **الموقع — قرارك أنت:** هل لديكم **مكتب فعلي تستقبلون فيه** العملاء؟
   - نعم → اختر «نعم، يبدو موقعنا للعملاء» وأدخل العنوان الحقيقي.
   - لا (نشاط عبر الإنترنت / بدون استقبال) → اختر «لا، نخدم منطقة معينة» وحدّد المناطق:
     **مصر** (المحافظات التي تغطيها جولاتكم: القاهرة، البحر الأحمر — الغردقة/مرسى علم، الأقصر،
     أسوان، الفيوم، الوادي الجديد، جنوب سيناء). إن كان لديكم حضور خدماتي بالمملكة المتحدة
     أضفوا المملكة المتحدة أيضاً.
   - ⚠️ لاحظ أن الرقم المرتبط حالياً بالموقع هو WhatsApp بريطاني `+44 7412 880087` — المقبول،
     فقط تأكد من إدخاله كاملاً مع رمز الدولة (GBP يقبل أرقاماً دولية، لكنه يفضّل رقماً محلياً
     لكل منطقة خدمة؛ لا تقلق بخصوصه في البداية).
5. أدخل رقم الهاتف، الموقع الإلكتروني `https://mysticegypt.net`، وفترة العمل (سنفتح صفحة
   ساعات افتراضية إن لم تحدد).
6. **التحقق:** جوجل يعطي رموز تحقق عبر إحدى الطرق (بطاقة بريدية/مكالمة/فيديو). أكملها خلال
   **14 يوماً** وإلا سقط الملف. لا يمكنني إكمالها عنه لأنها تتطلب هاتف/عنوانك.
7. بعد التفعيل، عُد وأضف:
   - **الوصف:** استخدم وصفاً مثل: *«UK-registered Egyptian travel experts offering authentic
     small-group tours across Egypt: Cairo, Luxor, Hurghada, Marsa Alam and the White Desert.
     Transparent local pricing, no hidden fees.»* (يمكنني توفير نسخة عربية/ألمانية عند الطلب).
   - **الصور:** الشعار + الصور الحقيقية للجولات التي سترفعها لاحقاً (الصور الواقعية ترفع نسبة
     النقر والثقة).
   - رابط الموقع: تأكد أنه `https://mysticegypt.net`.
8. **جمع التقييمات (بعد كل حجز مكتمل):** ادخل GBP → **Tools / أدوات** → **Ask for reviews /
   اطلب تقييماً** → انسخ الرابط المباشر وأرسله للعميل برسالة شكر. **قاعدة صارمة:** لا نضيف
   تقييمات مفبركة ولا نقدّم حوافز مقابل تقييمات — مخالفة صريحة لسياسة جوجل وتجرّ المنصة على
   التعليق.
9. **أخبرني حين يظهر ملف النشاط (أو رقم `placeid`)** — عندها أستطيع إضافة `sameAs` ورابط
   `AggregateRating` الحقيقي فقط حين تتوفر تقييمات فعلية (لا نضيف سكيما تقييم قبل ذلك).

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
| CNAME | links | **links1.resend-dns.com** (Tracking subdomain — REQUIRED for open/click tracking to activate; domain shows `partially_verified` until this verifies) |

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

# Google Analytics (LIVE)
NEXT_PUBLIC_GA_ID="G-B960Q7XTDS"
# Measurement Protocol API secret (server-side purchase event)
GA_MEASUREMENT_SECRET="<40-char-secret-from-GA4-Admin>"

# Meta Pixel + Conversions API (CODED — needs owner Access Token)
NEXT_PUBLIC_META_PIXEL_ID="1510981584397229"
META_PIXEL_ID="1510981584397229"
META_CAPI_TOKEN="EAA…owner-token-in-.env-not-here"
META_TEST_EVENT_CODE="TESTcode_unique_here"   # optional; Meta Test Event tool provides a token

# WhatsApp (LIVE)
NEXT_PUBLIC_WHATSAPP_NUMBER="447412880087"
```

---

## Pre-Launch Checklist

- [x] All API keys obtained and tested (Stripe test mode, Resend, GA4, WhatsApp)
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
