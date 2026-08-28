# PROJECT_MAP.md - Mystic Egypt Tourism Platform

## Status: PLANNING PHASE
**Last Updated:** August 28, 2026

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
| UI Kit | shadcn/ui | 4.19.0 | Radix + Tailwind |
| Icons | lucide-react | 1.35.0 | — |
| i18n | i18next + react-i18next | 26.4.0 / 17.0.12 | ar, en, de |
| Maps | Leaflet + react-leaflet | 1.9.4 / 5.0.0 | OpenStreetMap (free) |
| PDF | @react-pdf/renderer | 4.9.0 | Client-side generation |
| Email | Resend | 6.24.0 | Transactional emails |
| Payments | Stripe Elements | — | PCI-DSS compliant |
| DnD | @hello-pangea/dnd | 18.0.1 | Admin Kanban |
| CSS | Tailwind CSS | — | Via shadcn/ui |

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

### Disconnected Pieces
- None yet (greenfield project)

### Pending Items
- [ ] VPS server provisioning (Node.js, PM2, Nginx, MariaDB, SSL)
- [ ] Domain DNS configuration for mysticegypt.net
- [ ] Stripe account setup (API keys: publishable + secret + webhook secret)
- [ ] Resend account setup (API key)
- [ ] Google Analytics 4 property creation
- [ ] WhatsApp Click-to-Chat phone number
- [ ] Base currency decision (USD vs GBP)
- [ ] UI/UX Figma designs (PRD §9 step 1)

### Skills Used
- None yet (will be documented as they are installed)

### Document References
1. `docs/PRD.md` — Source of truth for all features
2. `docs/Final Technical Blueprint.md` — Architecture & schema decisions
3. `docs/Technical Execution SOP.md` — Step-by-step execution guide
4. `AGENTS.md` — Project rules and protocols
5. `PROJECT_MAP.md` — This file (living status tracker)
6. `MANUAL_STEPS.md` — Human-required actions
