# PROJECT_MAP.md - Mystic Egypt Tourism Platform

## Status: MILESTONE 1 COMPLETE
**Last Updated:** August 28, 2026

---

## [MILESTONE STATUS]

| # | Milestone | Status | Notes |
|---|-----------|--------|-------|
| 1 | Initialization & Core Foundation | ✅ COMPLETE | Next/TS/Tailwind, shadcn, Prisma 7, core layer, seed, git |
| 2 | Authentication System | ⏳ PENDING | — |
| 3 | Tour Feature (Public SSG) | ⏳ PENDING | — |
| 4 | Booking & Payment | ⏳ PENDING | — |
| 5 | Client Dashboard & Invoice | ⏳ PENDING | — |
| 6 | Admin Panel | ⏳ PENDING | — |
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
| Auth | NextAuth.js | 4.24.15 | + OTP via Resend |
| Auth Adapter | @auth/prisma-adapter | 2.11.3 | — |
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
Middleware
├── Public routes: No auth required
├── Dashboard routes: Session required (NextAuth)
├── Admin routes: Session + is_2fa_verified === true
└── API routes: Based on route config
```

### File Upload Flow
```
Client → FormData → Route Handler → Validate (type, size)
→ crypto.randomUUID() rename → Save to public/uploads/ → Return URL
```

---

## [ORPHANS & PENDING]

### Disconnected Pieces (Recorded during M1)
- `src/features/{auth,booking,tour,invoice}` folders exist but are EMPTY (features built in M2-M6).
- `src/shared/hooks/` empty (shared hooks added when needed).
- `public/locales/` empty (i18n files created in M7).
- `public/uploads/tours/*.jpg` referenced by seed DO NOT exist yet (placeholder image paths;
  real tour images uploaded via admin in M6).
- `src/core/lib/{auth,i18n,resend}` not yet created (M2 auth, M7 i18n).
- `src/app/` has scaffold `page.tsx` + home only; route groups (public/auth/dashboard/admin) created in M2-M6.
- API route handlers (`src/app/api/**`) not yet created (endpoints.ts has the contract; routes in M2-M6).

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
