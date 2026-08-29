# PROJECT_MAP.md - Mystic Egypt Tourism Platform

## Status: MILESTONE 2 COMPLETE
**Last Updated:** August 28, 2026

---

## [MILESTONE STATUS]

| # | Milestone | Status | Notes |
|---|-----------|--------|-------|
| 1 | Initialization & Core Foundation | ✅ COMPLETE | Next/TS/Tailwind, shadcn, Prisma 7, core layer, seed, git |
| 2 | Authentication System | ✅ COMPLETE | Password (bcrypt) + Email Verification + Password Reset + NextAuth JWT |
| 3 | Tour Feature (Public SSG) | ⏳ PENDING | — |
| 4 | Booking & Payment | ⏳ PENDING | — |
| 5 | Client Dashboard & Invoice | ⏳ PENDING | Dashboard placeholder only |
| 6 | Admin Panel | ⏳ PENDING | Admin placeholder only; 2FA gate deferred |
| 7 | i18n, SEO & Polish | ⏳ PENDING | — |
| 8 | Testing, QA & Deployment | ⏳ PENDING | — |

---

## [TECH_STACK]

| Category | Technology | Version | Notes |
|----------|-----------|---------|-------|
| Framework | Next.js (App Router) | 16.3.3 | Modular Monolith |
| Language | TypeScript | — | Strict mode, NO `any` |
| Database | MariaDB | — | Via Prisma ORM |
| ORM | Prisma | 7.10.0 | Schema-first approach |
| Auth | NextAuth.js | 4.24.15 | JWT session + Credentials (bcrypt), NO adapter |
| Server State | TanStack Query | 5.102.8 | Data fetching & caching |
| Client State | Zustand | 5.0.15 | Cart, UI state |
| UI Kit | shadcn/ui | 4.19.0 | Base UI (base-nova style) + Tailwind |
| Icons | lucide-react | 1.35.0 | — |
| i18n | i18next + react-i18next | 26.4.0 / 17.0.12 | ar, en, de |
| Maps | Leaflet + react-leaflet | 1.9.4 / 5.0.0 | OpenStreetMap (free) |
| PDF | @react-pdf/renderer | 4.9.0 | Client-side generation |
| Email | Resend | 6.24.0 | Transactional emails |
| Payments | Stripe Elements | — | PCI-DSS compliant |
| DnD | @hello-pangea/dnd | 18.0.1 | Admin Kanban |
| CSS | Tailwind CSS | — | Via shadcn/ui |
| Password Hashing | bcryptjs | 3.x | Bcrypt algorithm (PRD §5.1) |
| DB Driver Adapter | @prisma/adapter-mariadb | 7.10.0 | Required by Prisma 7 runtime |
| Config | prisma.config.ts + dotenv | — | Prisma 7 replaces schema URL |

### Documented Decisions / Deviations (Review-required)
- **Prisma 7 conventions (NOT v6 blueprint style):** The blueprint's `schema.prisma` used the
  deprecated `prisma-client-js` generator and inline datasource URL. Per AGENTS (latest stable,
  no deprecated), Prisma 7.10.0 requires: `prisma-client` generator with `output`, `prisma.config.ts`
  for the DB URL, `migrations.seed` config, and a driver adapter (`@prisma/adapter-mariadb`).
  Client is generated to `src/core/generated/prisma` (gitignored). Schema models unchanged.
- **shadcn `form` component NOT generated:** shadcn 4.19 (base-nova) registry no longer ships a
  standalone `form`; it provides `field` (Field/FieldLabel/FieldError) built on Base UI. Installed
  `field`, `label`, `separator` as the current form primitives. react-hook-form added for logic.
- **pm2/`npm install --production` deploy note:** SOP deploy uses `--production`, but `prisma migrate
  deploy`/`tsx` seed need devDependencies. Resolve at Milestone 8 (use full install or `--omit=dev`-safe steps).
- **npm audit (3 high, dev-tooling only):** Transitive `deepmerge-ts` advisory inside `prisma` CLI
  internals. Fix would downgrade Prisma to 6 (violates locked stack). Accepted & tracked; not a runtime risk.
- **Auth = password + Resend + NextAuth JWT (no adapter):** User decision (user asked for email
  verification/reset via Resend, not OTP-primary). NextAuth 4.24.15 supports Next 16 + React 19.
  JWT strategy with a Credentials provider; user lookup + bcrypt compare happen manually in
  `authorize`. `@auth/prisma-adapter` is intentionally NOT used: its peerDependencies exclude
  Prisma 7 (would break at runtime). JWT callback persists `id`, `role`, `email_verified`.
- **Next 16 = `proxy.ts`, not `middleware.ts`:** Route protection uses `src/proxy.ts` (Node
  runtime) with `getToken` for optimistic checks (unauth → /login, non-admin → /dashboard,
  unverified → /verify-email, logged-in → away from auth pages). Authoritative checks live in the
  DAL (`src/core/lib/session.ts`). Proxy is not a full session-management solution.
- **OTP storage:** New `OtpCode` model (user_id, type, code_hash, expires_at, used_at, attempts).
  Codes are 6 digits, bcrypt-hashed (cost 6), 10-min expiry, max 5 attempts, single-use.
  `User.email_verified` added. Two OtpType values: EMAIL_VERIFICATION, PASSWORD_RESET.
- **Email templates:** Plain-HTML templates in `src/features/auth/emails.ts` (no React email dep).
  `sendEmail` returns `{ sent, error }` and degrades gracefully when `RESEND_API_KEY` is the
  placeholder (never throws), so registration/reset never crash without a real key.
- **`admin` needs `is_2fa_verified`:** Declared in proxy/DAL contract but NOT enforced yet — 2FA is
  a later milestone. `requireAdmin` checks role==ADMIN only for now (seed admin has
  `is_2fa_verified:false`; enforcing it now would lock out admin). Resolve in the 2FA/Admin milestone.
- **Auth API surface:** Only `/api/auth/[...nextauth]` (NextAuth) and `/api/auth/me` (DAL-backed
  DTO) are created. Register/verify/reset are server actions (`src/features/auth/actions.ts`), not
  fetch API routes, per simplicity & no-orphan-endpoints. `endpoints.ts` AUTH section updated to match.
- **Form validation:** Manual inline validation in server actions (no zod dependency added) —
  minimal, explicit, and fulfills PRD §5.1 password rule (min 8, number, letter).

---

## [SYSTEM_FLOW]

### Public User Journey (Tourist)
```
Homepage → Browse Tours → Tour Detail → Book Now → Login/Register (OTP)
→ Select Date + People → Add-ons (optional) → Payment (Stripe/Bank Transfer)
→ Confirmation → Dashboard (bookings, invoices, wishlist)
```

### Admin User Journey
```
Login → 2FA Verification → Admin Dashboard
├── Tours Management (CRUD, Wizard form, pricing, dates)
├── Bookings Management (Table/Calendar/Kanban views)
├── CMS (Rich text editor for pages, blog)
├── Reports (Sales, revenue, tax, customer sources)
└── Settings (Admins, site config)
```

### Data Flow
```
Browser → Next.js API Routes → Feature Logic (src/features/) → Prisma → MariaDB
Browser ← JSON Response ← Next.js API Routes
```

### Payment Flow
```
Client selects tour → Stripe Checkout / Bank Transfer
├── Stripe: PaymentIntent → Webhook → Booking Confirmed
└── Bank Transfer: Upload receipt → Pending Review → Admin approves → Confirmed
```

---

## [ARCHITECTURE]

### Layer Diagram
```
┌─────────────────────────────────────────┐
│              app/ (Routing)             │
│   ┌──────────┬──────────┬──────────┐    │
│   │ (public) │ (auth)   │(dashboard│    │
│   │   SSG    │  SSR     │  SSR)    │    │
│   └──────────┴──────────┴──────────┘    │
│              api/ (Route Handlers)      │
├─────────────────────────────────────────┤
│           features/ (Business Logic)    │
│   ┌──────┬─────────┬──────┬─────────┐   │
│   │ auth │ booking │ tour │ invoice │   │
│   └──────┴─────────┴──────┴─────────┘   │
├─────────────────────────────────────────┤
│           core/ (Foundation)            │
│   ┌─────┬──────────┬─────┬─────────┐    │
│   │ api │constants │ lib │  utils  │    │
│   └─────┴──────────┴─────┴─────────┘    │
├─────────────────────────────────────────┤
│           shared/ (UI Components)       │
│   ┌─────────────┬───────────────────┐   │
│   │ components/ │      hooks/       │   │
│   └─────────────┴───────────────────┘   │
├─────────────────────────────────────────┤
│           prisma/ (Data Layer)          │
└─────────────────────────────────────────┘
```

### Security Model
```
Proxy (src/proxy.ts) — optimistic, cookie/JWT-based
├── Public routes: No auth required
├── Dashboard routes: Session required (NextAuth JWT)
├── Admin routes: Session + role===ADMIN (is_2fa_verified gate deferred)
├── Auth pages: redirected away if already verified
└── API routes: not matched by proxy (authorized in the handler / DAL)
DAL (src/core/lib/session.ts) — authoritative checks close to data
├── requireUser(): no session -> /login; unverified -> /verify-email
└── requireAdmin(): role check
```

### File Upload Flow
```
Client → FormData → Route Handler → Validate (type, size)
→ crypto.randomUUID() rename → Save to public/uploads/ → Return URL
```

---

## [ORPHANS & PENDING]

### Disconnected Pieces (Recorded during M1)
- `src/features/{booking,tour,invoice}` folders exist but are EMPTY (features built in M3-M5).
- `src/features/auth/` now holds the auth feature (actions, emails, components).
- `src/shared/hooks/` empty (shared hooks added when needed).
- `public/locales/` empty (i18n files created in M7).
- `public/uploads/tours/*.jpg` referenced by seed DO NOT exist yet (placeholder image paths;
  real tour images uploaded via admin in M6).
- `src/core/lib/{i18n}` not yet created (M7 i18n). `resend`, `auth`, `otp`, `session` created (M2).
- `src/app/` has `(auth)` group complete (M2); `(public)` home is scaffold; `(dashboard)` &
  `(admin)` are minimal placeholders (filled in M5/M6).
- API route handlers: only `api/auth/**` exist (M2); tours/bookings/admin routes pending (M3-M6).

### Disconnected Pieces / Pending (Recorded during M2)
- **Dashboard & Admin are bare placeholders** (auth gate verified only). Real dashboards = M5/M6.
- **Admin 2FA (`is_2fa_verified`) declared but not enforced** — deferred to the 2FA / Admin milestone.
- **Resend has no real API key** (`.env` = `re_placeholder`). Code paths work but emails are not
  actually delivered until a real key is provided (see MANUAL_STEPS.md).
- **`next-auth` JWT secret** — using `NEXTAUTH_SECRET` from `.env`; confirm a strong random value
  in production (MANUAL_STEPS.md).
- **OTP email delivery** cannot be end-to-end verified until Resend key + verified domain exist;
  OTP DB/business logic is verified against the real DB.
- **Homepage** (`/`) still renders the create-next-app scaffold — real public homepage = M3.
- **`useActionState`-driven forms** rely on React 19; both client and server flows verified via
  NextAuth `signIn` + server actions against local dev server and the real MariaDB.

### Pending Items (Human / External)
- [ ] VPS server provisioning (Node.js, PM2, Nginx, MariaDB, SSL)
- [ ] Domain DNS configuration for mysticegypt.net
- [ ] Stripe account setup (API keys: publishable + secret + webhook secret)
- [ ] Resend account setup (API key)
- [ ] Google Analytics 4 property creation
- [ ] WhatsApp Click-to-Chat phone number
- [ ] Base currency decision (USD vs GBP)
- [ ] UI/UX Figma designs (PRD §9 step 1)
- [ ] Real tour images for `public/uploads/tours/`

### Skills Used
- None installed this milestone. Candidates for later milestones:
  `ui-ux-pro-max` (UI/design polish), `careful` (prod/deploy safety M8), `browse`/`qa` (M8 testing).

### Document References
1. `docs/PRD.md` — Source of truth for all features
2. `docs/Final Technical Blueprint.md` — Architecture & schema decisions
3. `docs/Technical Execution SOP.md` — Step-by-step execution guide
4. `AGENTS.md` — Project rules and protocols
5. `PROJECT_MAP.md` — This file (living status tracker)
6. `MANUAL_STEPS.md` — Human-required actions
