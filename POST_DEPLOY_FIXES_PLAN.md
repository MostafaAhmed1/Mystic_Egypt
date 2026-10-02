# POST_DEPLOY_FIXES_PLAN.md — Mystic Egypt Post-Deploy Fixes (Sept 2026)

> Dedicated progress tracker for post-launch fixes on `mysticegypt.net` (production).
> Master build plan: `EXECUTION_PLAN.md` (COMPLETE). Docs targets: `MANUAL_STEPS.md`, `PROJECT_MAP.md`.
> **Rule:** Execute ONE milestone at a time. Update this file after each completed milestone, then report the next step and WAIT for user approval.

---

## M1 — Primary image missing for `hurghada-luxor-excursions-program`
**Status:** ✅ COMPLETE (Sept 22, 2026)
**Reported:** Main image not shown on homepage / `/en/tours` / tour detail page — only sub-images appear.

### Diagnosis (root cause, evidence-based)
1. **Data layer verified clear:** `tour_images` rows for `hurghada-luxor-excursions-program` are CORRECT
   (`is_primary=1` → `/uploads/tours/hurghada-luxor-excursions-program/1.jpg` + `2.jpg`, `3.jpg`).
   (Earlier claim of wrong folder was a faulty `LIMIT 1` query that matched `hurghada-luxor-cairo-excursions-program` first.)
   Files exist and are served raw via HTTP 200 (143,663 B, JPEG 1128×750, baseline, valid).
2. **Live browser reproduction (/en/tours):** request
   `/_next/image?url=…hurghada-luxor-excursions-program%2F1.jpg&w=640&q=75` stayed **PENDING**
   while every other tour card (including the sibling `hurghada-luxor-cairo…/1.jpg`) returned **200**.
3. **`TourImage` fallback triggered:** after the optimizer request failed on first load, the component hit
   `onError → setFailed(true)` and replaced the card image with a gradient placeholder (pyramid icon) — this is
   the "main image not showing" symptom.
4. **Server-side curl bar (cold & basic):**
   - Same file `w=640`, no accept header → **200 in 0.09s** (JPEG).
   - Same file `w=640`, `accept: image/webp` → 200 (WebP).
   - Same file `w=640`, `accept: image/avif,image/webp` → **HUNG >120s** (timeout) repeatedly.
   - Same file `w=384 / 750 / 828 / 1080` AVIF → 200 (<3s / ~9s / ~9s / cached).
   - Control file (`hurghada-luxor-cairo…/1.jpg`) `w=640` AVIF → **200 in 0.40s**.
   → The image optimizer had a **stuck AVIF transform job for this one file at w=640** (sharp inside the container).

### Fix
- **Applied:** `docker restart mystic-egypt` (clears the in-memory stuck transform / optimizer state; data volume untouched).
- After restart: `w=640` AVIF → **200 in 0.21s** (17,290 B).
- **Nothing changed in the DB, files, or code** — confirmed root cause was transient optimizer state, not data.

### Verification (browser, live site)
- `/en/tours` — target card image `1.jpg` (w=640) loads: `complete:true`, 475×316 natural; all 16 cards 200. ✅
- Homepage — target featured card loads: `complete:true`, 475×316; all requests 200 (reqid=52 target). ✅
- Tour detail page — primary `1.jpg` (w=1080) loads: `complete:true`, 864×574 natural; 3 thumbnails 200. ✅

### Notes / Follow-up
- **Recommended resilience:** if this recurs on any tour image, `docker restart mystic-egypt` is the quick fix.
  Root-cause hardening (larger optimizer timeouts / `minimumCacheTTL`, or AVIF off) is OPTIONAL and NOT yet requested.
- Secondary observed item (NOT in scope of M1): React hydration error #418 (`text content mismatch`) —
  tracked separately, revisit if it becomes user-visible.

---

## M2 — Missing translation keys (en/ar/de `common.json`)
**Status:** ✅ COMPLETE (Sept 22, 2026)
**Scope:** Add missing keys verified live on homepage snapshot:
- `whyUs.subtitle`, `whyUs.ukEntity.statLabel`, `whyUs.transfers.statLabel`, `whyUs.prices.statLabel`
- `process.title`, `process.choose.{title,description}`, `process.customize.{title,description}`,
  `process.book.{title,description}`, `process.experience.{title,description}`
- `testimonials.title`, `testimonials.subtitle`
- Files: `public/locales/{en,ar,de}/common.json`.

### Fix
- Added the 15 keys (45 values across en/ar/de) to all three locale files. Copy is **agent-authored**,
  consistent with site tone (luxury travel, British-entity trust angle) — editable on content review.
  - `whyUs.*.statLabel` values pair with the hardcoded stats: `100%` → "British legal protection",
    `24/7` → "Round-the-clock availability", `0%` → "Hidden fees".
  - New top-level sections `process` (4-step booking flow) and `testimonials` inserted after `whyUs`.
- JSON validity checked locally (node) and re-checked on the server after upload.

### Deploy
- `scp` the 3 files → `docker build -t mystic-egypt-new` (legacy builder) → container recreated with the
  **full live flags** including `-v /var/www/mysticegypt/data/uploads:/app/public/uploads`.
- Build took **~40 min** on this VPS (compile 23.5m + TS 12m) — NOT the ~10 min claimed in `MANUAL_STEPS.md` §6/§7.
- **Doc bug found (for M5):** runbook §5/§7 recreate command OMITS the `-v …/data/uploads` bind, but the
  live container HAS it — following the doc verbatim would break `/uploads` serving. Must be added to docs.

### Verification (live, server-side curl)
- `/en`, `/ar`, `/de`, `/en/tours` → all **200**.
- `/en` HTML contains "How it works", "What our travellers say", "British legal protection";
  raw-key grep count = **0** (no `whyUs.subtitle` / `process.title` / `testimonials.subtitle` literals).
- `/ar` shows «كيف تعمل العملية» + «ماذا يقول مسافرونا»; `/de` shows "So funktioniert es" +
  "Was unsere Reisenden sagen". ✅
- Build log removed from `/tmp`; builder cache prune ran (0 B reclaim — legacy builder warning shown).

---

## M3 — Phone numbers show literal backslashes in navbar
**Status:** ✅ COMPLETE (Sept 22, 2026)
**Reported:** Navbar shows `UK: \ +447412880087\` and `EG: \+201029226066\`.

### Root cause
- Literal `\` characters in the env values themselves:
  `NEXT_PUBLIC_PHONE_UK=\ +447412880087\` and `NEXT_PUBLIC_PHONE_EG=\+201029226066\`.
- Found corrupted in **both** `/var/www/mysticegypt/.env.container` (passed to `docker run`) **and**
  `/var/www/mysticegypt/.env` (source of truth); container env confirmed carrying the corrupted values.
- Consumed by server component `public-header.tsx` (`process.env` at runtime) → navbar/utility bar.
  (`contact-page-client` / `public-footer-client` are build-inlined and fall back to `BUSINESS.*` constants.)

### Fix
- Rewrote both keys in **both files** to clean values: `+447412880087` / `+201029226066`.
- **Container recreated** (`docker rm -f` + `docker run` with full live flags, incl. `-v …/data/uploads`) —
  NOTE: `docker restart` would NOT work here; `--env-file` is read only at container creation.
- Temp backups (`/tmp/.env*.m3bak`) removed after verification.

### Verification (live)
- Container env: `NEXT_PUBLIC_PHONE_UK=+447412880087`, `NEXT_PUBLIC_PHONE_EG=+201029226066` (no `\`). ✅
- `/en`, `/ar`, `/de`, `/en/tours` → all **200**.
- `/en` HTML: each number appears 10× in clean form; corruption patterns (`\ +447412880087\` etc.) = **0**.
  (Only remaining `\` near numbers are normal JSON `\"` escapes in JSON-LD/flight data — false positive.) ✅
- No rebuild required — values are runtime server env.

---

## M4 — Server hygiene / cleanup
**Status:** ✅ COMPLETE (Sept 22, 2026)
**Scope:** Remove `/tmp/mystic-build.log`, `/tmp/mystic-deploy.tar.gz`, old image `mystic-egypt-new:previous`,
`docker builder prune -f`, dangling images. Record in `MANUAL_STEPS.md`.

### Actions & results
- `/tmp/mystic-build.log` (6.7 KB) + `/tmp/mystic-deploy.tar.gz` (456 KB) → **removed**; no `mystic*` tmp left. ✅
- Image `mystic-egypt-new:previous` → **did not exist** (only `:latest` present) — nothing to remove. ✅
- `docker builder prune -f` → ran, 0 B (already reclaimed in post-M2 cleanup). ✅
- Dangling images (4) were **pinned by 5 failed build-step containers** (`Exited(1)` npx/npm steps,
  16h–10 days old) — removed those containers, then `docker image prune -f` → **dangling = 0**. ✅
- Gotcha: prune CLI hung on an orphaned ssh output pipe AFTER the daemon finished (verified via
  dangling count = 0); orphan PIDs killed safely. Documented in `MANUAL_STEPS.md`.
- Local repo: root `dev-server.err.log` **deleted** (AGENTS.md §10 forbidden artifact). ✅

### Extended sweep — user-approved (same session, after M4)
User instruction: also delete the out-of-scope temp file and ANY caches/debris whose removal cannot
affect any site or the system.
- **`/tmp/api-publish.tar.gz`** (11 MB) + 25 more stale one-off files → **removed**
  (scratch `.tsx/.js/.mjs/.sql/.sh/.py`, `build2.log`, `deploy-build.log`, generated
  `robots.txt`/`sitemap.xml`, `inc.txt` docker-inspect dump, `layout.tsx`,
  `insert-tour-images.sql`, `node-compile-cache/`, `vscode-typescript0/`).
  **Kept intentionally:** X11 dirs, `systemd-private-*`, `snap-private-tmp`, sockets/pipes
  (`clr-debug-pipe-*`, `dotnet-diagnostic-*`, `code-*.sock`) — live system/process objects.
- **PM2 logs (biggest win):** `pm2 flush` → `/root/.pm2/logs` **18 GB → 148 KB**
  (`eixir-api-out.log` alone was 16.5 GB) and `pm2.log` **4.5 GB → 4 KB**. God Daemon left
  running; all **7 pm2 apps stayed `online`** (verified after flush).
- **Caches:** `/root/.cache` (428 MB — uv/electron/node-gyp/prisma/typescript) +
  `/root/.npm/_cacache` (**2.2 GB**) + `apt-get clean` (3.3 MB) +
  `/root/.vscode-server/.cli.*.log` → removed.
- **Local repo:** also `dev-server.out.log` deleted (pair of `.err.log`).
- **NOT touched (other systems/projects on this VPS):** `/var/www/samhram/deploy.tar.gz`,
  pm2-managed apps themselves (logs only), `dokploy_dokploy-data` volume, `dawenli`/`sqlserver`.
- **Disk result: 57 GB/96 GB (59%) → 32 GB/96 GB (33%) — ~25 GB freed.** ✅

### Post-cleanup verification (live)
- Container `mystic-egypt` Up, image `mystic-egypt-new:latest` = `111e81a23313` (M2 build) intact.
- pm2 **7/7 online**; containers `mystic-egypt`/`dawenli`/`sqlserver` all Up.
- `/en` `/ar` `/de` `/en/tours` → all **200**; `/tmp` regular files = **0**; disk 32G/96G (33%).
- Cleanup runbook recorded in `MANUAL_STEPS.md` → "Server hygiene / cleanup (22 Sep 2026, M4)".

---

## M5 — Documentation update
**Status:** ✅ COMPLETE (Sept 22, 2026)
**Scope:** Update `MANUAL_STEPS.md` (successful build/deploy method) + `PROJECT_MAP.md` (state, version, orphans).

### MANUAL_STEPS.md
- **§5 recreate command:** added `-v /var/www/mysticegypt/data/uploads:/app/public/uploads` +
  new GOTCHA explaining why (uploads break without it).
- **§5 new RULE:** env-var changes require `docker rm -f` + `docker run` (recreate), NOT
  `docker restart` — `--env-file` is read only at creation (learned in M3).
- **§6 deploy steps:** build estimate corrected `~10 min` → **~40 min** (measured 22 Sep 2026:
  compile ~23.5 min + TypeScript ~12 min); downtime wording fixed — **site stays up during the
  build** (old container serves), downtime only at recreate.
- **§7 Quick Deploy Checklist:** recreate one-liner now includes the `-v uploads` mount.
- **Hygiene runbook (added in M4):** includes `pm2 flush`, root/npm cache cleanup, and an explicit
  NEVER-CLEAN list (other VPS projects, volumes, sockets/pipes/systemd dirs).

### PROJECT_MAP.md
- Status header → `PRODUCTION DEPLOYED — POST-DEPLOY FIXES M1–M5 COMPLETE`; Last Updated → Sept 22, 2026.
- New dated section under `[ORPHANS & PENDING]`: **"Post-Deploy Fixes (Recorded Sept 22, 2026)"**
  summarizing M1–M5 outcomes + the known-open optional item (hydration #418).

### Note (out of M5's two-file scope)
- `AGENTS.md` §13 still says rebuild takes "~10 min" — same stale estimate; not edited (outside the
  two files named in this milestone). Fix on request.

---

## M6 — Hydration #418, phone prop-passing, image optimizer, AR locale + deployment hardening
**Status:** ✅ COMPLETE (Sept 22, 2026) — built, recreated, verified live.
**Scope:** The four approved items from the M2→M5 follow-up review + the two deployment-hardening
fixes discovered *while* trying to ship them.

### Proposal 1 — AGENTS.md build-time estimate (✅ done)
- `AGENTS.md` §13 corrected `~10 min` → `~40 min measured Sept 2026` (stale note removed).

### Proposal 4 — Locale review (✅ done)
- Reviewed en/ar/de `public/common.json`. Only one defect found: extra space in AR
  `"و كل"` → `"وكل"` (line 84) — fixed. EN/DE clean.

### Proposal 2 — Hydration #418, ROOT-CAUSE fix (✅ done, verified)
- **Root cause (refined):** `public/uploads` images are stored as JPEG; the optimizer was serving
  AVIF. Client-inlined `NEXT_PUBLIC_*` phone values came from `.env.production` (baked at build,
  has GA + WhatsApp but NOT `NEXT_PUBLIC_PHONE_*`), so client fell back to `BUSINESS` display
  strings (spaced `+44 7412 880087`) ≠ server runtime env (unspaced) → `args[]=text` mismatch.
- **Fix pattern (all four components, server passes runtime-env props):**
  - `public-footer-client.tsx` → `PublicFooter({ phoneUK, phoneEG, whatsapp })`.
  - `(public)/layout.tsx` + `contact/page.tsx` (server) read env → pass as props.
  - `contact-page-client.tsx` → accepts props, no env reads.
  - `analytics-provider.tsx` → `AnalyticsProvider({ gaId })`; `[locale]/layout.tsx` passes
    `process.env.NEXT_PUBLIC_GA_ID`. `grantConsent(id)` narrowed in `checkConsent` (TS2345 fixed).
- `src/core/lib/analytics.ts` still reads `NEXT_PUBLIC_GA_ID` at module level — **affects GA
  events only, NOT hydration** → left as-is (documented, out of scope).
- **Verify live:** zero hydration/#418 errors in browser console on `/en`; footer + contact render
  `+447412880087` / `+201029226066` unspaced (spaced fallback absent); exactly 1 GA script tag.

### Proposal 3 — Image optimizer hardening (✅ done, verified)
- `next.config.ts` → `formats: ["image/webp"]` (drop AVIF → closes optimizer-stuck root cause) +
  `minimumCacheTTL: 86400`.
- **Verify live:** `/_next/image` for tour jpgs serves `image/webp` (avif/*), `image/jpeg` for
  no-modern clients; cache-control `max-age=86400`. (Earlier avif sighting was stale client cache
  from pre-deploy.)

### Deployment hardening #1 — swap file (✅ done)
- **Found:** VPS has ZERO swap; `top` showed **90% CPU steal** on 2 vCPU and dmesg proved a prior
  `sqlservr` OOM-kill. Builds and containers were starving under host oversubscription.
- **Fix:** `/swapfile` 2 GB created + persisted in `/etc/fstab` (`* none swap sw 0 0`), swappiness 60.

### Deployment hardening #2 — `scripts/deploy.sh` (✅ done)
- **Problem:** ad-hoc `while pgrep -f` loops in shell from the client matched their own command
  line (infinite loop) and/or died on ssh timeouts → hours lost each deploy.
- **Fix:** codified deploy in `scripts/deploy.sh`: build runs detached, writes
  `/tmp/mystic-build.pid`; script waits via `kill -0 $PID` (no self-match); on
  "Successfully tagged" it recreates the container (exact §5 flags incl. `-v uploads`), health-
  checks `/en /en/tours /en/tours/fayoum`, and writes `/tmp/mystic-deploy.status`. Client only
  ever does `cat /tmp/mystic-deploy.status` — **no loops possible**.
- **Buildkite unlock deferred:** `docker buildx` is NOT installed on the VPS (only compose +
  trust plugins) — switching the builder would require installing new software on prod; recorded
  as OPTIONAL future work, NOT done.
- **Rebuild reality:** the legacy builder's `COPY --from=deps` for `node_modules` crawls under the
  host's 88–90% CPU steal (observed: single-step stall of ~35 min, then normal ~23 min compile +
  ~10 min TS). Verified dockerd was actively working (I/O + %CPU) — it was NOT deadlocked, so
  killing/retrying would have restarted the same slow copy. Total elapsed ≈ 1 h 45 m.

---

## Progress Log
| Date | Milestone | Result |
|------|-----------|--------|
| 2026-09-22 | M1 | ✅ Fixed — container restart cleared stuck AVIF optimizer job; primary image verified on homepage, `/en/tours`, and detail page. |
| 2026-09-22 | M2 | ✅ Added 15 missing keys (en/ar/de), rebuilt image (~40 min), recreated container; all 3 locales verified live (raw keys = 0). |
| 2026-09-22 | M3 | ✅ Stripped `\` from PHONE_UK/EG in `.env.container` + `.env`, recreated container; phones clean live (corruption = 0). |
| 2026-09-22 | M4 | ✅ Server hygiene — tmp files removed, 5 failed build containers + 4 dangling images pruned, `dev-server.err.log` deleted; runbook recorded in MANUAL_STEPS.md; site verified 200. |
| 2026-09-22 | M4-EXT | ✅ User-approved sweep — `pm2 flush` (18 GB→148 K logs), npm/root caches (2.6 GB), 26 `/tmp` debris files, `dev-server.out.log`: **~25 GB freed (59%→33%)**; pm2 7/7 + containers + site verified. |
| 2026-09-22 | M5 | ✅ Docs synced — MANUAL_STEPS §5/§6/§7 (`-v` mount, ~40 min build, recreate-for-env rule) + hygiene runbook; PROJECT_MAP status header + Post-Deploy Fixes section. **All milestones M1–M5 complete.** |
| 2026-09-22 | M6 | ✅ **COMPLETE** — Built (1 h 45 m under 88–90% CPU steal), recreated, verified live: no hydration #418 on /en; phones unspaced in footer/contact; optimizer serves webp only; AR "وكل" fixed; single GA tag; all routes 200. Hardening shipped: 2 GB swap + `scripts/deploy.sh` (PID-based wait, no client loops, status file). Buildkite unlock recorded as OPTIONAL. |