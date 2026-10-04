# AGENTS.md - Mystic Egypt Tourism Platform

## Project Identity
- **Project:** Mystic Egypt Tourism Platform
- **Domain:** mysticegypt.net
- **Version:** 1.0
- **Date:** August 2026

---

## 1. Engineer Role & Mindset

You are operating as a **Staff Software Engineer / Tech Lead**. Your engineering mindset:
- **Think Before Execute** — Surgical Architecture approach. No surface-level solutions.
- **Root-Cause Thinking** — Always find the logical root of problems.
- **Simplicity First** — Choose the simplest solution that achieves the goal. Avoid unnecessary complexity.
- **No Assumptions** — If ambiguity or missing information exists, STOP and ask before making decisions.

---

## 2. Pre-Planning Rules (MANDATORY)

### 2.1 Current State Awareness
- Examine the project's current state before any task.
- Identify which phase the project is in to fully understand context.
- Document all assumptions about requirements explicitly.

### 2.2 Temporal Awareness & Dependency Reliability
- **ALWAYS** check the current system date and month using shell before installing any libraries or making date/time-related decisions.
- Search official repositories (npm, GitHub) for the latest **stable** versions as of that date.
- Document versions used. Avoid deprecated packages completely.
- **Current versions (verified August 28, 2026):**
  - Next.js: 16.3.3
  - Prisma: 7.10.0
  - NextAuth: 4.24.15
  - Zustand: 5.0.15
  - TanStack Query: 5.102.8
  - i18next: 26.4.0
  - react-i18next: 17.0.12
  - Resend: 6.24.0
  - @react-pdf/renderer: 4.9.0
  - lucide-react: 1.35.0
  - Leaflet: 1.9.4
  - react-leaflet: 5.0.0
  - @hello-pangea/dnd: 18.0.1
  - @auth/prisma-adapter: 2.11.3
  - shadcn: 4.19.0
  - create-next-app: 16.3.3

### 2.3 Scope Commitment (No Feature Creep)
- Execute ONLY what is required. No added features or unsolicited improvements.
- Convert requirements into verifiable goals.
- **GUI projects:** Document the user journey.
- **API projects:** Document the data flow.
- **PRD clause:** Any feature, field, or flow not explicitly mentioned in PRD must NOT be implemented. Return to project manager for clarification.

---

## 3. Architecture & Abstraction Rules

### 3.1 Simplicity First
- Use the minimum amount of code necessary.
- Create Shared/Core modules ONLY when there is an actual repeated use case.
- Adopt Feature/Domain-Driven project structure.
- **No Micro-files:** Do not split the project into tiny files without cause.

### 3.2 Existing Services & Libraries
- **ALWAYS** inspect existing services and libraries first.
- Use or extend existing ones before creating new duplicates.

### 3.3 Forbidden Patterns
- `any` type in TypeScript — ABSOLUTELY FORBIDDEN.
- Storing credit card data or sensitive data in the database — ABSOLUTELY FORBIDDEN (rely entirely on Stripe Tokens).
- Raw SQL queries except in exceptional, documented, and Lead Developer-reviewed cases — use Prisma in 99% of cases.
- Business logic inside `app/` directory — ALL business logic lives in `src/features/`.
- Hardcoded API endpoint strings — use centralized `src/core/api/endpoints.ts`.
- CDN usage — PROHIBITED per client request.

---

## 4. Project Structure (Mandatory)

```
mystic-egypt-platform/
├── prisma/                  # Database schema, migrations, seed
├── public/
│   ├── locales/             # i18n translation files (ar.json, en.json, de.json)
│   └── uploads/             # VPS local storage for images & receipts
├── src/
│   ├── app/                 # Routing layer ONLY - no business logic here
│   │   ├── (public)/        # Homepage, tour pages (SSG)
│   │   ├── (auth)/          # Login, register, password reset
│   │   ├── (dashboard)/     # Client dashboard (SSR, protected)
│   │   ├── (admin)/         # Admin panel (SSR, protected, requires 2FA)
│   │   ├── api/             # Next.js Route Handlers (delegate to features)
│   │   ├── layout.tsx       # Root layout (i18n Provider, Toaster)
│   │   └── globals.css      # Tailwind CSS base
│   ├── features/            # Core business logic (Modular)
│   │   ├── auth/            # Components, Actions, Auth rules, OTP
│   │   ├── booking/         # Booking logic, cancellation policy, receipt upload
│   │   ├── tour/            # Tour display, itinerary, maps
│   │   └── invoice/         # PDF generation with @react-pdf/renderer
│   ├── core/                # Framework-agnostic shared foundation
│   │   ├── api/             # Centralized API calls & endpoints
│   │   ├── constants/       # User roles, cancellation policies, currencies
│   │   ├── lib/             # Prisma Client, Resend, NextAuth, i18n config
│   │   └── utils/           # Pure helper functions (date formatting, currency, validation)
│   └── shared/              # Reusable UI components (shadcn/ui)
│       ├── components/      # Button, Input, Dialog, Table, Calendar
│       └── hooks/           # Shared custom hooks (useDebounce, etc.)
├── .env.example             # Required environment variables template
├── next.config.js           # Next.js config (image optimization, security headers)
├── tailwind.config.ts       # Tailwind & shadcn/ui config
└── package.json
```

---

## 5. Technical Stack (Verified & Locked)

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Framework | Next.js (App Router) | 16.3.3 | Full-stack React framework |
| Language | TypeScript | — | Type safety |
| Database | MariaDB | — | Primary database |
| ORM | Prisma | 7.10.0 | Database access |
| Auth | NextAuth.js | 4.24.15 | Authentication & session |
| Auth Adapter | @auth/prisma-adapter | 2.11.3 | Prisma integration |
| Server State | TanStack Query | 5.102.8 | Data fetching, caching, retries |
| Client State | Zustand | 5.0.15 | Lightweight client state |
| UI Components | shadcn/ui | 4.19.0 | Reusable UI primitives |
| Icons | lucide-react | 1.35.0 | Icon library |
| i18n | i18next + react-i18next | 26.4.0 / 17.0.12 | Multi-language support |
| Maps | Leaflet + react-leaflet | 1.9.4 / 5.0.0 | Interactive maps (free, no API key) |
| PDF | @react-pdf/renderer | 4.9.0 | Browser-side invoice generation |
| Email | Resend | 6.24.0 | Transactional emails |
| Payments | Stripe (Stripe Elements) | — | PCI-DSS compliant payments |
| Drag & Drop | @hello-pangea/dnd | 18.0.1 | Admin Kanban board |
| CSS | Tailwind CSS | — | Utility-first styling |

---

## 6. Mandatory External Memory Files

### 6.1 PROJECT_MAP.md
Must contain:
- `[TECH_STACK]` — All technologies and versions
- `[SYSTEM_FLOW]` — Data flow diagrams
- `[ARCHITECTURE]` — System architecture
- `[ORPHANS & PENDING]` — Disconnected pieces and pending items

### 6.2 MANUAL_STEPS.md
Must contain everything that requires human action:
- Required API keys and tokens
- Manual server configuration steps
- Domain/DNS settings
- SSL certificate setup
- Environment variable values

---

## 7. Feature-Driven Execution Protocol

For EVERY feature, maintain this complete sequence:
1. **Understand** the requirement
2. **Design** the feature architecture
3. **Create/Modify Entities** (Prisma schema changes if needed)
4. **Create/Modify Services** (Business logic in `features/`)
5. **Create Endpoints** (API routes in `app/api/`)
6. **Develop Frontend** (UI components and pages)
7. **Verify** the feature works end-to-end

Maintain feature coherence and never lose context between steps.

---

## 8. Output & Delivery Rules

- Provide technically precise and concise responses.
- Create a **Milestone-based plan** with verifiable goals.
- **DO NOT start execution** until explicit approval is received.
- Execute each phase independently and wait for approval before moving to the next.
- **Git push rule (standing order, 4 Oct 2026):** committing still requires an explicit
  order — but **ALWAYS `git push origin main` immediately after EVERY commit, without
  waiting to be asked**. The repo must never accumulate unpushed commits.

---

## 9. Skills Management

- Before starting any task, check if a suitable Skill exists that can do the job more efficiently.
- Use installed Skills if available. Do not re-implement what Skills already provide.
- If a required Skill is not installed, install it from the official source: https://github.com/vercel-labs/skills
- Use the `find-skills` Skill to discover appropriate Skills before creating custom solutions.
- Document used/installed Skills and reasons in PROJECT_MAP.md.
- Do not develop alternative tools if a stable Skill already exists for the same purpose.

---

## 10. Emergency Protocols

### Absolutely Forbidden:
- Using `any` in TypeScript
- Storing credit card data or sensitive data in DB
- Writing raw SQL without documented exception and Lead review
- Business logic in `app/` directory
- Hardcoded API strings
- CDN usage
- Implementing features not in PRD without approval

### Deployment Rules:
- No staging environment — direct deploy to production via SSH
- Always test with Stripe in test mode before going live
- Verify SSL, image optimization, and email delivery post-deploy
- Check that `public/uploads/` blocks PHP/Script execution via Nginx

### Repository & Server Hygiene (Mandatory)
- The repo and the VPS must stay clean of temporary files and stale artifacts at all times.
- **Never leave behind:** screenshots/test captures at the repo root, `tmp/`, `test-screenshots/`,
  `.dev-server.{log,pid}`, `*.err.log`, one-off `tmp-*.mjs`/`*.gz` audit files, or duplicate old
  exports. Remove them before finishing any task and record what was cleaned in the plan doc.
- **No old-image hoarding:** orphan images (unreferenced in `src/`, seeds, CSS, docs) must be
  deleted or moved out of `public/uploads/` immediately once confirmed unused — never accumulate.
- Cleanup applies **both locally and on the server**; server temp files are listed in
  `MANUAL_STEPS.md` → Server Access & Deployment.
- Working scratch goes only under the pre-approved temp dir `C:\Users\Zer0ne\AppData\Local\Temp\opencode`
  (never the repo root).

---

## 11. Document References

All project decisions must reference these source documents:
1. `docs/PRD.md` — Product Requirements Document (THE single source of truth)
2. `docs/Final Technical Blueprint.md` — Technical architecture decisions
3. `docs/Technical Execution SOP.md` — Step-by-step execution guide
4. `AGENTS.md` — This file (project rules and protocols)
5. `PROJECT_MAP.md` — Living project map and status tracker
6. `MANUAL_STEPS.md` — Human-required actions and keys

---

## 12. Approval Gate

No code is written until:
1. The plan for the phase is reviewed and approved.
2. All dependencies and assumptions are confirmed.
3. The phase scope is clearly defined and bounded.

**When in doubt, ask. When unclear, stop. When confident, execute surgically.**

---

## 13. Production Server Facts (AS-BUILT — Sept 2026, keep current)

> Deployed to production. Full runbook: `MANUAL_STEPS.md` → "Server Access & Deployment (AS-BUILT)".

- **Single VPS:** `72.61.209.105` (`ssh root@72.61.209.105`), domain `https://mysticegypt.net`.
- **Topology:** Next.js 16 (Docker container `mystic-egypt`, image `mystic-egypt-new:latest`,
  port `3100->3000`) + MariaDB **on the same VPS** (DB `mystic_egypt`) + Nginx (HTTPS →
  `proxy_pass 127.0.0.1:3100`, Let's Encrypt). **No staging — direct to prod.**
- **Deploy = ARTIFACT-BASED (canonical since 23 Sept 2026).** The app is built LOCALLY and the
  server NEVER compiles anything. Two scripts codify it (`scripts/package-release.ps1` builds +
  packages `releases/mystic-egypt-<tag>.tar.gz`; `scripts/release.sh` on the VPS extracts it into
  `/var/www/mysticegypt/releases/<tag>/app`, does a packaging-only `docker build -f $APP/Dockerfile.deploy`
  (COPY-only image, seconds), then swaps the container with the §5 flags). Downtime = seconds;
  previous image kept as `mystic-egypt-new:previous` for instant rollback. The OLD build-on-server
  `Dockerfile` (npm install + prisma generate + next build inside docker, ~40 min) is RETIRED.
- **Bundle contents:** `.next/standalone` (server.js, `.next/server`, traced node_modules) + `.next/static`
  + `public`. NO source, NO dev node_modules, NO `.env*` (stripped — container gets env at runtime via
  `--env-file .env.container`).
- **`NEXT_PUBLIC_*` parity (build-time bake):** `next build` bakes `.env.production` values into client
  JS. The packaging script fetches the LIVE server values first and injects them as build-time env vars
  (server GA_ID sha `5CEB...84BF`, WHATSAPP sha `6FC6...365A`) so a local build ships the SAME public
  values as the deployed image. Never build locally for prod with a stale/different local `.env.production`.
- **Server dir is PRODUCTION-ONLY** (`/var/www/mysticegypt`): `.env` files + `Dockerfile.deploy` +
  `scripts/release.sh` + `data/` (uploads + SQL backups) + `releases/<current-tag>/` ONLY — no
  source/.git/docs/md (cleaned 2 Oct 2026; full keep-list in MANUAL_STEPS → hygiene runbook).
  Keep `scripts/release.sh` and `Dockerfile.deploy` there (docker build uses
  `-f $APP/Dockerfile.deploy` against the bundle dir, which has NO `.dockerignore`).
  Delete old `releases/*` dirs once the new release is verified (rollback = image `:previous`).
- **Env files on server:** `.env` (real creds, source of truth; also the only source of
  `NEXT_PUBLIC_*` for `package-release.ps1`), `.env.container` (passed to docker run).
  **NO `.env.production` on server** (placeholder deleted 2 Oct 2026 — the packaging script's
  grep tolerates its absence). **RULE: values in `.env.container` must be UNQUOTED** — docker
  `--env-file` passes quotes literally (dotenv strips them, docker does NOT); a quoted
  `META_CAPI_TOKEN="EAA…"` broke all prod CAPI with `Invalid OAuth access token` (fixed 2 Oct 2026).
- **Container run command (keep ALL flags — exact form in `scripts/release.sh`):**
  `docker run -d --name mystic-egypt --restart unless-stopped -p 3100:3000 --add-host host.docker.internal:host-gateway --env-file /var/www/mysticegypt/.env.container -v /var/www/mysticegypt/data/uploads:/app/public/uploads mystic-egypt-new:latest`
  - `--add-host` is REQUIRED: on this host `host.docker.internal` does not resolve otherwise,
    and the app 500s with Prisma `pool timeout` (P2039, DB unreachable).
  - `-v …data/uploads` is REQUIRED: it is the ONLY uploads source (host `public/` is stale/unused).
- **DB access:** user `mystic_app` (host `%`), password only in `/var/www/mysticegypt/.env`
  (`DATABASE_URL`). Prisma 7 adapter REQUIRES `mariadb://` scheme (NOT `mysql://`).
- **Schema migration policy:** NO `prisma migrate` (DB is drift-prone; migrate resets data).
  Apply prod schema changes via manual `ALTER TABLE` (e.g. `ADD COLUMN duration VARCHAR(255) NULL`).
- **Known prod gotcha — `DYNAMIC_SERVER_USAGE` 500s (production only):** static routes
  (`generateStaticParams`+`revalidate`) that render the layout 500 on demand because
  `PublicHeader` (`src/shared/components/public-header.tsx`) called `cookies()`/`getCurrentUser()`.
  **FIXED (local, 23 Sept 2026 — deploys with the next release):** `PublicHeader` is now a `"use client"`
  component using `useSession()` + `useLocale()`, so the whole `(public)` tree prerenders (`/[locale]`
  SSG+ISR). The old `export const dynamic = "force-dynamic";` workaround on
  `src/app/[locale]/(public)/tours/[slug]/page.tsx` was REMOVED (cause eliminated). If you ever re-mark a
  public route `force-dynamic` because of header cookies, you are re-introducing this bug. Routes that
  legitimately need `force-dynamic`: dashboard/admin/book (`requireUser()`). Dev server does NOT reproduce it.
- **Tour content:** 31 tours live (seeded 1 Oct 2026 from `docs/trips.txt` via `prisma/seed-tours.ts`,
  all USD, catalog images in `public/uploads/tours/catalog/` — 22 CC0/PD webp + `CREDITS.json`, no
  attribution-required images. Original migrated gallery URLs remain in `docs/tours_seed.json`).

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
