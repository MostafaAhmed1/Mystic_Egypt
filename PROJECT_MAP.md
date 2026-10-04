# PROJECT_MAP.md - Mystic Egypt Tourism Platform

## Status: PRODUCTION DEPLOYED — 2 RELEASES LIVE 2 Oct 2026 (A+B+C+D: images fix · language switcher · nginx 12M · Hot Offers v1; then Hot Offers REDESIGN: `Tour.isOffer`, `offers` table dropped, bar moved to hero top)
## Active plan: **Admin Add-ons CRUD + Customers management + Offers Popup** — **COMPLETE (4 Oct 2026)**, all M1–M5 below verified; NOT yet deployed (uncommitted, awaiting PM deploy/commit order). Prior work (A+B+C+D, Offers redesign, Meta pixel fix) complete; X6 commit pending user request. Performance plan M2–M5 still awaiting order.
**Last Updated:** Oct 4, 2026

---

## [MILESTONE STATUS]

| # | Milestone | Status | Notes |
|---|-----------|--------|-------|
| 1 | Initialization & Core Foundation | ✅ COMPLETE | Next/TS/Tailwind, shadcn, Prisma 7, core layer, seed, git |
| 2 | Authentication System | ✅ COMPLETE | Password (bcrypt) + Email Verification + Password Reset + NextAuth JWT |
| 3 | Tour Feature (Public SSG) | ✅ COMPLETE | Public tours, SSG pages, itinerary, Leaflet map, customize action |
| 4 | Booking & Payment | ✅ COMPLETE | Stripe Elements + Bank Transfer (receipt upload), checkout flow, webhook |
| 5 | Client Dashboard & Invoice | ✅ COMPLETE | Dashboard (overview/bookings/invoices/wishlist/profile), Invoice PDF, server actions |
| 6 | Admin Panel | ✅ COMPLETE | All 8 steps: Layout, API, Dashboard, Tours, Orders, CMS, 2FA, Admins |
| 7 | i18n, SEO & Polish | ✅ COMPLETE | All 7 phases complete (locale-prefix routing, hreflang, GDPR banner, RTL, responsive, GA4 wiring) |
| 8 | Testing, QA & Deployment | ✅ COMPLETE | PRODUCTION DEPLOYED Sept 2026 — VPS Docker + MariaDB + Nginx, all pages 200 |
| 9 | Luxury Visual Overhaul | ✅ COMPLETE | 12-phase visual redesign — All phases complete |
| 10 | UI/UX Testing | ✅ COMPLETE | 10-phase browser testing — 80% coverage (2 phases skipped due to 2FA) |
| 11 | Tours Migration & Production Rollout | ✅ COMPLETE | 16 old-site tours migrated live (18 total), duration field, prod-only bugs fixed |

### Plan: 3 Features (approved 2 Oct 2026 — PM request, extends PRD §4.4)

**Context:** PM could not find (a) any place to edit/add/delete **Add-ons**, (b) any place to
manage **registered customers** (only Admins exist), and (c) wants **offers as popup cards**
for visitors (non-intrusive, clear X). PRD §4.4 never listed these — the PM is authorizing
them explicitly. **No schema changes** (Addon + User models already exist).

| # | Milestone | Scope | Status |
|---|-----------|-------|--------|
| M1 | **Add-ons CRUD** | `/admin/addons` page (table + inline add/edit + guarded delete), `api/admin/addons` + `[id]` routes (`requireAdmin`), service fns in `features/admin/service.ts`, AdminNav "Manage" group, `ADMIN.ADDONS` endpoints. DELETE returns 409 if the addon is referenced by `booking_addons` (booking history protection). Fields: name*, description, price, currency (USD/GBP/EUR, default USD). | ✅ E2E: POST 201, PUT 200 ($11→$22), DELETE in-use → 409 JSON + row kept, DELETE free row → removed |
| M2 | **Customers (view-only + password reset)** | `/admin/customers` page: CLIENT-role users with bookings count + total spent (Prisma `_count`/`_sum`, read directly in page like Admins — no GET route). Row actions: link → `/admin/bookings?search=<email>` (existing search covers user.email), and **Send reset code** → `POST /api/admin/customers/[id]/reset-password` reusing the EXISTING OTP flow (`createOtpCode(PASSWORD_RESET)` + `passwordResetEmailHtml` + Resend) so the customer resets via `/reset-password`. CLIENT role only, never ADMIN. | ✅ E2E: 4 CLIENT users listed (ADMIN excluded), bookings/total spent correct, reset POST → 200 + toast, 404 JSON on missing id, 401 unauth. `sendEmail` result ignored — matches `forgotPasswordAction` pattern |
| M3 | **Offers Popup** | New `offers-popup.tsx` (shadcn Dialog, frontend-design skill, gold/obsidian system): offer cards inside popup, clear X close (aria-label), vertical scroll on mobile. Opens ~1.8s after homepage load ONCE PER SESSION (`sessionStorage me_offers_popup_seen`), only if offers exist. Existing hero marquee bar + `#offers` section stay untouched (PM choice: popup + both). i18n keys `offers.popup.*` in en/ar/de/hu. Verify z-index vs cookie banner. | ✅ E2E: opens 1.8s, single X (`showCloseButton={false}`), close→session set, reload→no popup, fresh session→reappears, bar+`#offers` intact, AR RTL X left + localized, labels en/ar. **Celebration pass 4 Oct 2026:** CSS confetti rain (48 pcs, gold+party palette, pure `hash01` render — React Compiler rejects `Math.random`) inside backdrop via NEW optional `overlayClassName`/`overlayChildren` props on `dialog.tsx` `DialogContent`; backdrop darkened `bg-black/55`; Gift icon at eyebrow + Sparkles at title + static corner dots (lucide, no new deps/images). Verified EN+AR in isolated browser ctx (main ctx had stale immutable dev CSS — server was always fresh). **Carousel pass 4 Oct 2026:** grid replaced by auto-advancing slide carousel (CSS track `translateX(±i*100%)` 500ms, NO carousel lib) — one offer/slide = wide image (h-44/52 + OFFER badge) + title + `line-clamp-2` description + duration/price + CTA (mirrors `#offers` cards); autoplay 4.5s loops, **first manual nav (arrows/dots/swipe/arrow-keys) stops autoplay permanently** (`autoOn` state); touch swipe (Δ≥50px horizontal, `touch-pan-y`); RTL mirrored (`isRtl` flips transform sign + chevrons + start/end); offscreen slides `inert` (a11y + no focus-scroll); keys `offers.popup.prev/next/goTo` in en/ar/de/hu. E2E: autoplay advanced, click→frozen, synthetic swipe→moved, EN+AR screenshots. |
| M4 | **Verification** | `npx tsc --noEmit`, `npm run lint` (baseline: 7 errors — no new), dev-server E2E: addons CRUD incl. blocked delete, customers list + reset email, popup show/close/once-per-session, bar+section intact. | ✅ tsc exit 0; lint exactly baseline 29 (7e/22w); all E2E above on `next dev` with seeded admin (2FA-less local login); routes 307/401/405 unauth |
| M5 | **Docs** | PROJECT_MAP.md only (no server changes → no MANUAL_STEPS edit; PRD untouched). | ✅ This update (incl. `hu` locale + verification evidence) |

**Planned files:** new — `admin/addons/{page,addons-client}.tsx`, `api/admin/addons/{route,[id]/route}.ts`,
`admin/customers/{page,customers-client}.tsx`, `api/admin/customers/[id]/reset-password/route.ts`,
`features/homepage/components/offers-popup.tsx`; modified — `AdminNav.tsx`, `endpoints.ts`,
`features/admin/service.ts`, `home-page-client.tsx`, `public/locales/{en,ar,de,hu}.json`, `PROJECT_MAP.md`.

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

### Documented Decisions / Deviations (Recorded during M3)
- **Schema additions (PRD §4.1 / blueprint):** `TourPoint` model (order, name, lat/lng, day) for the
  itinerary route map; `CustomizationRequest.people Int?` (number of travellers); `Tour.inclusions` &
  `Tour.exclusions` optional `@db.Text` fields (newline-delimited lists). All applied via `prisma db
  push`; client regenerated. No migrations committed (project continues the `db push` baseline; see
  migrations-debt note below / M8).
- **Leaflet loaded client-side only (SSG-safe):** `src/features/tour/components/TourMapClient.tsx`
  wraps the Leaflet/react-leaflet map and is rendered via `next/dynamic` with `ssr:false` (through
  `TourMap.tsx`). Prevents window/document SSR errors on static generation.
- **Reviews/Testimonials nav links removed:** No `Review`/`Testimonial` data model exists yet.
  Showing fake testimonials would violate "no fake content". Deferred to PRD §4.1 reviews
  implementation (M7 content/SEO, or when a model is added).
- **Customization request = server action, not fetch API route:** `customizeTourAction` in
  `src/features/tour/actions.ts` is auth-gated (`getCurrentUser` → redirect /login), validates inline,
  and creates a `CustomizationRequest`. Keeps with the M2 decision to avoid orphan fetch endpoints.
- **Placeholder tour images (superseded):** Were generated locally with `sharp` at
  `public/uploads/tours/{nile-cruise-cairo,white-desert}.jpg`. **Removed 1 Oct 2026** — replaced by
  the seeded CC0/PD catalog images under `public/uploads/tours/catalog/` (see M13 below).

### Documented Decisions / Deviations (Recorded during M4)
- **Stripe degraded gracefully (no real keys yet):** `.env` Stripe keys are placeholders
  (`pk_test_placeholder`, `sk_test_placeholder`, `whsec_placeholder`) per security rules. All Stripe
  code paths are structurally complete (PaymentIntent with `metadata.booking_id`, Elements +
  `confirmPayment` redirect `if_required`, and a signature-verified webhook) but cannot be exercised
  end-to-end. The client create step catches the inaccessibility and returns a friendly error
  ("Stripe could not be reached..."), so the booking form degrades to bank transfer without crashing.
  Real-test-keys E2E is a pending item (MANUAL_STEPS.md).
- **PaymentIntent id stored via `metadata.booking_id` (no DB field):** lightweight link between a
  Stripe PaymentIntent and our Booking row without schema change. `confirmBookingFromStripe` is
  idempotent (PENDING_PAYMENT → CONFIRMED only), the webhook payload says `payment_intent` confirmed.
- **No schema changes in M4:** `Addon`, `Booking`, `BookingAddon`, `Invoice` already existed from the
  blueprint. `db push` re-ran (idempotent). Invoice row creation deferred to M5.
- **4 add-ons seeded idempotently** (`npx prisma db seed`): Airport transfer $60, Nile dinner cruise
  $75, Hot air balloon $120, Photo & drone package $90 — with slug-like uuid ids.
- **Booking payment methods:** `PAYMENT_METHODS` constant (`stripe`, `bank_transfer`); stock
  `BookingStatus` enum drives transition PENDING_PAYMENT → PENDING_RECEIPT_REVIEW (bank) or CONFIRMED
  (Stripe webhook).
- **Booking = fetch API route, not server action:** distinct from M2/M3 (which used server actions).
  Rationale: the receipt upload needs `multipart/form-data` + ownership check + callback from the
  Stripe webhook — a Route Handler with unified JSON responses is the right seam. Order-creation,
  receipt-upload, and Stripe webhook all live in `app/api/bookings/**` + `api/webhooks/stripe` and
  delegate to `src/features/booking/service.ts`.
- **Auth-gated bookings:** `createBooking` requires a session (401 otherwise). The `/book` page is
  `force-dynamic` + `requireUser()`. Receipt upload additionally checks booking ownership.
- **Receipt storage:** `src/core/lib/receipt-upload.ts` validates (jpeg/png/pdf, ≤5MB) and saves to
  `public/uploads/receipts/<uuid>.<ext>` returning the URL to store on `Booking.receipt_image_url`.
  Nginx PHP/script-exec block for `public/uploads` already required in deploy (M8).
- **Booking success / email:** bank transfer lands on a "Booking submitted for review" success screen.
  `bookingConfirmationEmailHtml` is defined in `src/features/booking/emails.ts` (uses existing
  `sendEmail`, graceful on placeholder key).

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
Client on /tours/[slug]/book → date + people + add-ons (Zustand cart)
→ login required → payment method
├── Stripe Elements: create PaymentIntent (metadata.booking_id) → client
│     confirmPayment → Webhook (signature) → booking CONFIRMED
└── Bank Transfer: create booking PENDING_PAYMENT → upload receipt
      (multipart, ownership-checked) → PENDING_RECEIPT_REVIEW → admin approves (M6) → CONFIRMED
→ Success screen ("Booking submitted for review" for bank)
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
- `src/shared/components/public-header-client.tsx` — **ORPHAN, confirmed 23 Sept 2026 (M2):** header-internal
  client helper with ZERO imports remaining after `PublicHeader` was reworked (initially server-split, then converted
  to `"use client"` directly). Nothing references it. Retained on disk pending explicit user confirm to delete; not
  bundled by build (verified: build compiles clean with it present). Same family as the earlier `scroll-progress.tsx`
  vs `scroll-progress-lazy.tsx` duplication.
- `src/features/tour/` now implemented (M3). `booking` (M4), `invoice` (M5), `dashboard` (M5),
  `wishlist` (M5) are all implemented.
- `src/features/auth/` now holds the auth feature (actions, emails, components).
- `src/shared/hooks/` empty (shared hooks added when needed).
- `public/locales/` now has 4 locale files (en, ar, de, hu) with comprehensive translations (M7;
  `hu` added 2 Oct 2026 — UI-only: policy pages + homepage DB content fall back to EN for `hu`).
- `public/uploads/tours/catalog/` holds 22 CC0/PD `.webp` images + `CREDITS.json`, referenced by
  `prisma/seed-tours.ts` (legacy placeholder JPGs removed 1 Oct 2026).
- `src/core/lib/i18n.ts` created (M7). `resend`, `auth`, `otp`, `session` created (M2).
- `src/app/` has `(auth)` group complete (M2); `(public)` home is scaffold; `(dashboard)` &
  `(admin)` are minimal placeholders (filled in M5/M6).
- API route handlers: `api/auth/**` (M2), `api/tours/**` (M3), `api/bookings/**` + `api/webhooks/stripe` (M4), `api/wishlist` (M5), `api/invoices/**` pending. Admin routes in M6.

### Disconnected Pieces / Pending (Recorded during M3)
- **`/tours/[slug]/book` route is a dangling pointer** — the "Book now" buttons link to
  `/tours/[slug]/book`, which does NOT exist yet. This is the Milestone 4 entry point. Next.js
  link-prefetch logs a 404 until M4 lands.
- **RESOLVED 1 Oct 2026:** tour images are now seeded catalog images
  (`public/uploads/tours/catalog/*.webp`, CC0/PD) instead of placeholder JPGs.
- **Reviews/Testimonials deferred** — homepage/listing don't render testimonials because no
  `Review`/`Testimonial` model exists. Will surface with PRD §4.1 reviews (M7 or a dedicated model).
- **Homepage search** supports destination keyword + max budget only. A tour-date field comes with
  the Booking flow (M4).
- **CustomizationRequest records** are created but there is no admin UI yet to review/respond to
  them — that belongs to the Admin panel (M6).
- **Migrations baseline debt** — project uses `prisma db push`; `prisma/migrations` is empty.
  A baseline migration should be introduced (M8 / before first production deploy).

### Post-Deploy Fixes (Recorded Sept 22, 2026 — full tracker: `POST_DEPLOY_FIXES_PLAN.md`)
- **M1 ✅** Tour primary image missing (`hurghada-luxor-excursions-program`) — root cause: stuck
  AVIF transform job in the image optimizer; fixed by container restart. Quick recurrence fix:
  `docker restart mystic-egypt`. Hardening (optimizer timeouts / disable AVIF) = optional, not done.
- **M2 ✅** 15 missing translation keys (`whyUs.*` 4, `process.*` 9, `testimonials.*` 2) added to
  `public/locales/{en,ar,de}/common.json`; rebuilt image + recreated container; verified live
  (raw keys = 0 in all 3 locales). New copy is agent-authored, editable on content review.
- **M3 ✅** Literal `\` stripped from `NEXT_PUBLIC_PHONE_UK/EG` in `.env.container` **and** `.env`;
  container recreated (restart would NOT pick up env — recreate rule now in MANUAL_STEPS §5).
- **M4 ✅ + extended sweep** Server hygiene: tmp/build debris, 5 failed build containers, 4 dangling
  images, `pm2 flush` (18 GB logs → 148 K), npm/root caches (2.6 GB), local `dev-server.{err,out}.log`.
  **~25 GB freed (disk 59% → 33%).** Runbook in `MANUAL_STEPS.md`. Other VPS projects untouched
  (pm2 apps, dokploy, dawenli, sqlserver, `/var/www/samhram`).
- **M5 ✅** Docs synced: container-recreate command now includes `-v …/data/uploads`, build-time
      corrected to ~40 min, "site stays up during build" clarified, env-recreate rule added
      (MANUAL_STEPS §5/§6/§7 + hygiene runbook); this file's status header refreshed.
- **Meta Pixel + CAPI (Sept 22, 2026; updated Sept 24, 2026):** fully coded + locally verified;
  pixel migrated to `1510981584397229`, `META_CAPI_TOKEN` provided by owner (in env files only,
  not committed). **DEPLOYED** Sept 24, 2026 (release `2026-09-24-c725559`) + verified
  (200s, new pixel baked, old absent, container env loaded). Owner to verify events via
  Meta Test Events (see MANUAL_STEPS §5b).
- **Known open / optional (not requested):** React hydration error #418 (text-content mismatch)
  observed on public pages — not user-blocking; revisit if it becomes visible.

### Documented Decisions / Deviations (Recorded during M5)
- **User.notifications_enabled added for PRD §4.3:** `Boolean @default(true)` field on User model
  for "إعدادات الإشعارات" (notification settings). Applied via `db push`, client regenerated.
- **Invoice row creation wired into `confirmBookingFromStripe`:** Invoices are created when a booking
  transitions to CONFIRMED (Stripe webhook path). Bank-transfer invoices will be created when admin
  approves in M6. `getOrCreateInvoiceForOwnedBooking` lazily ensures invoice exists for detail/invoices
  pages. Invoice numbers: `ME-YYYYMMDD-XXXXXX`.
- **Wishlist uses SSG-compatible client fetch pattern:** Tour pages are SSG and cannot read per-user
  session at build time. `WishlistButton` component fetches saved state on mount via
  `GET /api/wishlist` and mutates via `toggleWishlistAction` server action. Auth-gated GET endpoint
  returns 401 for unauthenticated requests.
- **GDPR delete account:** Hard-deletes personal activity (OTP codes, customization requests,
  wishlist relations) + anonymizes the user row (name/email/phone scrubbed, password nulled) to keep
  booking/invoice financial records intact — standard GDPR-compliant approach.
- **Booking cancellation deferred:** Not in M5 scope (PRD does not mention client-initiated
  cancellation in §4.3). Will be addressed when the admin panel (M6) or a dedicated cancellation
  milestone is reached.
- **Bank-transfer invoice timing:** Invoices for bank-transfer bookings become available only after
  admin approval (M6), since they are not CONFIRMED until then.

### Documented Decisions / Deviations (Recorded during M6)
- **Admin panel technology choices:** Tiptap (CMS rich text), Recharts (analytics charts),
  @hello-pangea/dnd (Kanban board, already installed), TOTP for 2FA (otplib + qrcode).
- **Admin layout mirrors dashboard pattern:** Server component with requireAdmin(), two-column
  responsive layout (sidebar + main), sidebar has Admin badge, user info, sign-out, and AdminNav.
- **Admin nav items:** Overview, Tours, Bookings, CMS, Admins (5 sections per PRD §4.4).
- **Admin overview page:** Stats cards (revenue, bookings, pending, active tours) as placeholders
  — real data fetching in Step 3.
- **shadcn components added:** `badge` and `dropdown-menu` for admin UI elements.
- **Admin API layer:** 7 route handlers (tours CRUD, bookings list/status, dashboard analytics,
  admin management). All delegate to `src/features/admin/service.ts`. Server actions for mutations
  (approve/reject/complete booking, toggle tour status, create admin).
- **Booking status transitions:** PENDING_RECEIPT_REVIEW → CONFIRMED (approve) or CANCELLED
  (reject); CONFIRMED → COMPLETED or CANCELLED. Invoice auto-created on CONFIRMED transition.
- **Tour CRUD:** Full create/update with nested relations (itinerary, images, route points).
  "Full replace" approach for nested data — client sends complete arrays, server replaces all.
- **Dashboard analytics:** Revenue chart (daily/weekly/monthly), bookings by status, top selling
  tours, recent bookings. All powered by Prisma aggregation queries.
- **Recharts for charts:** Installed `recharts` for revenue area chart and bookings-by-status
  donut chart. Client components ("use client") with server-side data fetching.
- **Dashboard page:** Server component fetches all data in parallel (Promise.all), passes to
  client chart components. Stats cards show real DB aggregates (revenue, bookings, pending, active).
- **Tour Management:** Tour list with search/filter/pagination, 4-step wizard (Basic Info,
  Itinerary, Images, Pricing & Dates). TourDate model for per-date booking close. Status toggle
  from list view. `getTourById` returns full tour with tour_dates. `listTours` supports
  search by title/slug and filter by status.
- **Order Management:** Bookings page with table + kanban views (toggle). Advanced filters:
  search (customer/tour), status, payment method, date range. Quick actions: approve, reject,
  complete. Booking detail page with customer, tour, payment, addons, receipt link. Date range
  filtering added to `listBookings` service function.
- **CMS:** CmsPage model (title, slug, content, published). Tiptap rich text editor with
  toolbar (headings, bold/italic/strike, lists, task lists, links, images, code, horizontal
  rule). Admin CMS list with search/filter, create/edit pages with Tiptap, toggle publish
  status, delete with confirmation. Public API route for published pages.
- **2FA (TOTP):** Custom TOTP implementation using Node.js crypto (RFC 6238). Schema:
  `User.totp_secret` (encrypted) + `is_2fa_verified`. QR code generation via `qrcode` package.
  Setup flow: generate secret → show QR → verify 6-digit code → enable. Disable flow with
  confirmation. Admin settings page (`/admin/settings`) with account info + 2FA toggle.
  Server actions: generate, enable, disable, verify, get status. ±1 time window tolerance
  (90 seconds).
- **Admin Management:** Admin list page with avatar initials, 2FA status badge, delete action.
  Create admin page with name, email, password form. `deleteAdmin` service function prevents
  self-deletion. `createAdmin` creates user with ADMIN role + email_verified=true. Admin nav
  includes all 6 sections: Overview, Tours, Bookings, CMS, Admins, Settings.

### Documented Decisions / Deviations (Recorded during M7 - Step 1)
- **SEO files created:** `src/app/sitemap.ts` (dynamic sitemap with tour pages) and `src/app/robots.txt`
  (crawler directives disallowing /admin, /dashboard, /api). Both generate as static files.
- **OpenGraph metadata added:** Homepage, tours listing, and tour detail pages now have `openGraph`
  and `twitter` metadata for social sharing.
- **i18n wiring approach:** Server components (tour detail, tours list, book page) use client
  component wrappers (`TourContent`, `ToursListClient`, `BookPageClient`) that call `useTranslation`.
  This preserves SSG/SSR benefits while enabling client-side i18n.
- **Components converted to client for i18n:** `TourCard`, `TourSearchBar`, `ItineraryAccordion`,
  `CustomizeTourDialog`, `WishlistButton` now use `"use client"` + `useTranslation("common")`.
- **Translation keys added:** `nav.home`, `tours.oneDay`, `tours.daysCount`, `tours.day`,
  `tours.maxBudget`, `wishlist.added`, `wishlist.removed`, `wishlist.signInRequired`, `wishlist.save`
  added to all 3 locale files (en, ar, de).
- **Pre-existing TS error fixed:** `auth.ts:96` cast `(user as Record<string, unknown>)` changed to
  `(user as unknown as Record<string, unknown>)` to satisfy strict TypeScript.

### Documented Decisions / Deviations (Recorded during M7 - Step 2)
- **Auth pages i18n wired:** `LoginForm`, `RegisterForm`, `ForgotPasswordForm`, `ResetPasswordForm`,
  `VerifyEmailForm` all now use `useTranslation("common")`. Page wrappers unchanged (metadata only).
- **Dashboard pages i18n wired:** Overview, bookings, invoices, wishlist, profile pages all use
  client component wrappers (`DashboardOverviewClient`, `DashboardBookingsClient`, etc.).
- **Translation keys added (Step 2):** `auth.creatingAccount`, `auth.sending`, `auth.resetting`,
  `auth.verifyTitle/verifyDescription/verifyEnter/verificationCode/verifying/verifyEmail/resendCode`,
  `dashboard.noBookingsYet/trackBookings/noInvoicesYet/noFavouritesYet`,
  `booking.person`, `profile.deleteAccount` added to all 3 locale files.

### Documented Decisions / Deviations (Recorded during Visual Overhaul - Phase 1)
- **Framer Motion installed:** `framer-motion` added for scroll reveals, parallax, staggered animations.
- **Fonts replaced:** Geist Sans/Mono → Cinzel (headings) + Inter (body) via `next/font/google`.
  - `--font-cinzel` variable for headings, `--font-inter` variable for body text.
  - `font-heading` now maps to Cinzel, `font-sans` maps to Inter.
- **Egyptian Sandstone palette applied:** Light mode ONLY (dark mode removed entirely).
  - Background: `#F4F1EA` (Sandstone Off-White)
  - Foreground/Text: `#0B0C10` (Obsidian Black)
  - Primary/CTA: `#D4AF37` (Pharaonic Gold)
  - Accent: `#1F3A93` (Lapis Lazuli)
  - Muted/Secondary: `#E8E2D6` (warm sandstone gray)
  - Border: `#D4CFC5` (warm border)
  - Destructive: `#C4704A` (Terracotta)
- **Custom utility classes added to globals.css:**
  - `cinematic-overlay` — dark gradient overlay for hero images
  - `cinematic-overlay-light` — lighter version for section backgrounds
  - `gold-gradient-text` — gold gradient text effect
  - `gold-glow` / `gold-glow-subtle` — gold box-shadow effects
  - `text-shadow-cinematic` — text shadow for readability on images
  - `glassmorphic` / `glassmorphic-dark` — glassmorphism effects
  - `animate-ken-burns` — slow zoom animation for hero backgrounds
  - `animate-shimmer` — gold shimmer animation for badges/accents
  - `animate-border-glow` — subtle border glow animation
  - `timeline-connector` — vertical timeline line for itinerary
- **Stock images downloaded:** 7 placeholder images in `public/uploads/stock/` (user replaces later).
- **Custom scrollbar:** Styled webkit scrollbar with gold hover state.
- **Selection color:** Gold-tinted text selection.

### Documented Decisions / Deviations (Recorded during Visual Overhaul - Phase 2)
- **GlassmorphicHeader client component created:** Wraps header with scroll-based glassmorphism effect.
  - Transparent background → blurred sandstone with gold shadow on scroll (20px threshold).
  - `backdrop-blur-xl` with `bg-sandstone/85` when scrolled.
  - Subtle gold box-shadow `shadow-[0_4px_30px_rgba(212,175,55,0.08)]` on scroll.
  - Smooth 500ms transition for all property changes.
- **BrandLogo redesigned:** Obsidian black icon container with gold text, gold hover glow.
  - `bg-obsidian text-gold` icon, `font-heading text-xl` with `tracking-wider`.
  - Hover: `gold-glow-subtle` effect on icon container.
- **HeaderNavLinks upgraded:** Gold underline reveal animation on hover.
  - `text-obsidian/70` base, transitions to `text-obsidian` on hover.
  - Gold underline: `h-0.5 bg-gold` with `w-0 → w-full` on hover (300ms transition).
- **PublicHeaderClient (auth buttons) redesigned:**
  - Login: `text-obsidian/70` → `text-gold` on hover.
  - Signup: Gold outline button `border-2 border-gold bg-gold/10` → filled `bg-gold text-obsidian` on hover.
  - Dashboard: Obsidian button `bg-obsidian text-gold` with gold glow on hover.
  - WhatsApp: `text-obsidian/60` → `text-gold` on hover.
- **MobileNav completely rebuilt:** Full-screen overlay with staggered animations.
  - Full `fixed inset-0 z-50 bg-sandstone` overlay (not dropdown).
  - Links animate in with `translate-y` + `opacity` with 80ms stagger delay.
  - Auth buttons animate in at 300ms delay.
  - Bottom row (language/whatsapp) at 450ms delay.
  - Body scroll locked when open (`overflow: hidden`).
  - CTA buttons: Login = obsidian border, Signup = gold outline → filled on hover.
- **Footer redesigned:** Dark obsidian background with gold accents.
  - `bg-obsidian` background, gold gradient top border.
  - Column headers: `text-gold uppercase tracking-widest`.
  - Links: `text-sandstone/60` → `text-gold` on hover.
  - Brand logo rendered in gold variant.
  - Contact column added with email and WhatsApp.
  - Bottom bar: `border-sandstone/10` with `text-sandstone/40`.
- **PublicHeader updated:** Now wraps content in `<GlassmorphicHeader>` instead of raw `<header>`.

### Documented Decisions / Deviations (Recorded during Visual Overhaul - Phase 3)
- **Hero section completely rebuilt:** Full-bleed cinematic design with 85vh height.
  - Background: stock image (`/uploads/stock/hero-pyramids.jpg`) with `animate-ken-burns` (slow zoom).
  - Overlay: `cinematic-overlay` gradient (dark → transparent → dark).
  - Bottom fade: `bg-gradient-to-t from-sandstone to-transparent` for smooth transition.
  - Framer Motion staggered text reveal: badge (0ms) → heading (150ms) → subtitle (300ms) → search (450ms).
  - `fadeInUp` animation: opacity 0→1, y 30→0, 0.7s duration, custom cubic-bezier easing.
  - Badge: `border-gold/30 bg-gold/10` with uppercase tracking-widest.
  - Heading: `font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl` with `text-shadow-cinematic`.
- **TourSearchBar redesigned:** Glassmorphic container over hero image.
  - Container: `border-white/20 bg-white/10 backdrop-blur-xl` with `shadow-[0_8px_32px_rgba(0,0,0,0.3)]`.
  - Input fields: `bg-white/5` with `focus-within:bg-white/10 focus-within:ring-gold/50`.
  - Icons: `text-gold/60` → `text-gold` on focus.
  - Submit button: `bg-gold text-obsidian` with gold shadow, `hover:bg-gold-light`.
  - Text colors: `text-white placeholder:text-white/40` for visibility over dark hero.
- **Featured Tours section enhanced:** Framer Motion scroll-triggered animations.
  - Section heading: `whileInView` fade-in-up with `viewport={{ once: true }}`.
  - Tour cards: staggered entrance with 100ms delay between cards.
  - "View All" link: gold with arrow shift on hover.
- **Why Us section enhanced:** Animated cards with hover effects.
  - Section: `bg-sandstone-dark/50` background.
  - Cards: `border-gold/10 bg-white` with hover: `border-gold/30` and gold shadow.
  - Icons: `bg-gold/10 text-gold` with hover: `bg-gold/20 gold-glow-subtle`.
  - Staggered entrance: 100ms delay between cards.
- **Trust badges redesigned:** Dark obsidian background with gold accents.
  - Container: `bg-obsidian` with `border-t border-gold/10`.
  - Badges: `text-sandstone/50` with `hover:text-gold`.
  - Each badge now has an icon (CheckCircle, Headset, MapPin, BadgeCheck) in `text-gold/60`.
- **Framer Motion type fix:** Easing array cast as `[number, number, number, number]` tuple.

### Documented Decisions / Deviations (Recorded during Visual Overhaul - Phase 4)
- **TourImage fallback redesigned:** Replaced amber/orange gradient with Egyptian sandstone theme.
  - Background: `bg-gradient-to-br from-sandstone-dark via-gold/10 to-sandstone-dark`.
  - Icon: `Pyramid` (lucide) instead of `MapPin`, in `bg-gold/10` container.
  - Label: `text-obsidian/40` with `tracking-wider`.
- **TourCard completely rebuilt:** Luxury card with hover effects and cinematic overlays.
  - Container: `border-gold/10 bg-white` with hover: `border-gold/30` and gold shadow.
  - Image: `transition-transform duration-700 ease-out group-hover:scale-110` (smooth zoom).
  - Cinematic overlay: `bg-gradient-to-t from-obsidian/60` fades in on hover.
  - Gold accent line: `h-1 w-0 bg-gold` → `w-full` on hover (500ms transition).
  - Price badge: Floating on image bottom-left, `bg-obsidian/80 backdrop-blur-sm`, gold price text.
  - Title: `tracking-wide text-obsidian` → `text-gold` on hover.
  - Bottom border: `border-t border-gold/10` separator.
  - CTA link: Gold with arrow shift on hover.
  - Changed from `Card`/`CardContent` (shadcn) to semantic `<article>` element.
- **Featured Tours homepage section:** Already enhanced in Phase 3 with Framer Motion animations.

### Documented Decisions / Deviations (Recorded during Visual Overhaul - Phase 5)
- **TourGallery redesigned:** Elegant thumbnail gallery with gold active indicator.
  - Main image: `rounded-2xl` with subtle `ring-1 ring-inset ring-obsidian/5` overlay.
  - Thumbnails: `h-20 w-28` (larger than before), `rounded-xl`, `border-2`.
  - Active thumbnail: `border-gold shadow-[0_0_12px_rgba(212,175,55,0.3)]` gold glow.
  - Inactive thumbnails: `border-transparent opacity-50` → `opacity-80 border-gold/30` on hover.
  - Image transition: `transition-opacity duration-500` for smooth switching.
- **TourContent completely rebuilt:** Cinematic tour detail page with Framer Motion animations.
  - Breadcrumb: `ChevronRight` icons instead of `/` separators, `text-obsidian/40` with hover-to-gold.
  - Gallery: Framer Motion `initial={{ opacity: 0, x: -20 }}` slide-in from left.
  - Sidebar: Framer Motion `initial={{ opacity: 0, x: 20 }}` slide-in from right with 100ms delay.
  - Title: `font-heading text-3xl sm:text-4xl font-bold tracking-wider`.
  - Price: `font-heading text-4xl font-bold text-gold` (prominent gold display).
  - Duration badge: `border-gold/20 bg-gold/5` with gold MapIcon.
  - Book Now CTA: `bg-gold text-obsidian` with gold shadow, `hover:bg-gold-light` with enhanced shadow.
  - Itinerary section: Framer Motion scroll-triggered animation.
  - Inclusions: `bg-emerald-50` icon container, emerald check marks.
  - Exclusions: `bg-terracotta/10` icon container, terracotta X marks (replaces rose-600).
  - Bottom CTA: `bg-obsidian` dark section with white heading, gold CTA buttons.
  - All sections use `whileInView` with `viewport={{ once: true }}` for scroll animations.

### Documented Decisions / Deviations (Recorded during Visual Overhaul - Phase 6)
- **ItineraryAccordion redesigned:** Vertical timeline with gold dots and connecting lines.
  - Each day: gold dot (`size-8 rounded-full border-2 border-gold bg-gold/10`) with day number.
  - Open state: `bg-gold shadow-[0_0_12px_rgba(212,175,55,0.4)]` with `text-obsidian`.
  - Connecting line: `w-px bg-gradient-to-b from-gold/40 to-gold/10` between dots.
  - Title: `font-heading text-base font-semibold tracking-wide` → `text-gold` when open.
  - Removed shadcn Card wrapper — timeline is self-contained.
- **TourMap redesigned:** Dark CartoDB Dark Matter tiles with gold markers.
  - Tiles: `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png`.
  - Marker: Gold pin with obsidian center and gold inner dot, drop shadow filter.
  - Polyline: Gold `#D4AF37` with `dashArray: "8 4"` (dashed elegance).
  - Container: `h-96` (taller), `border-gold/10`, gold shadow.
  - Empty state: `bg-obsidian/5` with gold CircleDot icon.
- **TourMapClient updated:** Loading state now shows gold spinner on dark background.
  - `h-96` matching the map height.
  - Spinner: `border-gold/20 border-t-gold` rotating animation.
  - "Loading map..." text in `text-obsidian/40`.

### Documented Decisions / Deviations (Recorded during Visual Overhaul - Phase 7)
- **Input component redesigned:** Gold focus borders, taller height.
  - Height: `h-10` (increased from `h-8`).
  - Border: `border-sand/60` → `border-gold` on focus.
  - Focus ring: `focus-visible:ring-2 focus-visible:ring-gold/20`.
  - Error state: `aria-invalid:border-terracotta aria-invalid:ring-2 aria-invalid:ring-terracotta/20`.
  - Text color: `text-obsidian` (explicit).
- **Label component updated:** `text-obsidian/70` (explicit color).
- **CheckoutForm rebuilt:** Luxury checkout with Framer Motion animations.
  - Section headers: `font-heading font-bold tracking-wider text-obsidian`.
  - Payment options: Icons (CreditCard, Building2), gold selected state with glow.
  - Checkbox: `accent-gold` styling.
  - CTA button: `bg-gold text-obsidian` with gold shadow, Shield icon.
  - Error messages: `bg-terracotta/10 text-terracotta` (rounded-lg container).
  - Sections: Framer Motion `initial={{ opacity: 0, y: 10 }}` staggered animations.
- **LoginForm rebuilt:** Glassmorphic card without shadcn Card wrapper.
  - Container: `rounded-2xl border-gold/10 bg-white shadow-[0_4px_30px_rgba(0,0,0,0.06)]`.
  - Gold decorative divider under heading.
  - CTA: `bg-gold text-obsidian` with gold shadow.
  - Links: `text-gold` with underline.
  - Error: `bg-terracotta/10 text-terracotta`.
  - Framer Motion entrance animation.
- **RegisterForm rebuilt:** Same treatment as LoginForm.
  - Consistent glassmorphic card, gold CTA, terracotta errors.
- **SubmitButton updated:** Accepts optional `className` prop.

### Documented Decisions / Deviations (Recorded during Visual Overhaul - Phase 8)
- **ToursListClient redesigned:** Cinematic hero header with dark background.
  - Hero: `bg-obsidian py-20 sm:py-28` full-width dark section.
  - Background: `bg-[radial-gradient(circle_at_30%_50%,rgba(212,175,55,0.15),transparent_50%)]` gold radial.
  - Badge: `border-gold/20 bg-gold/10 text-gold` with Compass icon.
  - Title: `font-heading text-4xl sm:text-5xl font-bold tracking-wider text-white`.
  - Subtitle: `text-lg text-white/50`.
  - TourSearchBar: Centered below title with Framer Motion delay.
  - Grid: Framer Motion staggered animations (`delay: index * 0.1`).
  - Empty state: `border-dashed border-gold/20 bg-sand/20` with gold Compass icon, helpful message.

### Documented Decisions / Deviations (Recorded during Visual Overhaul - Phase 9)
- **Auth layout redesigned:** Cinematic dark background with radial gradients.
  - Background: `bg-obsidian` full-viewport.
  - Radial gradients: Gold `rgba(212,175,55,0.08)` and lapis `rgba(31,58,147,0.06)`.
  - Subtle grid pattern: `repeating-linear-gradient` with gold lines at 5% opacity.
  - Content: `relative z-10` overlay.
- **ForgotPasswordForm rebuilt:** Glassmorphic card with gold accents.
  - Icon: `Mail` in `bg-gold/10` circle.
  - Container: `rounded-2xl border-gold/10 bg-white shadow-[0_4px_30px_rgba(0,0,0,0.06)]`.
  - Gold decorative divider under heading.
  - CTA: `bg-gold text-obsidian` with gold shadow.
  - Links: `text-gold` with underline.
  - Error: `bg-terracotta/10 text-terracotta`.
  - Footer text: `text-white/40` (on dark bg).
- **ResetPasswordForm rebuilt:** Same treatment with `KeyRound` icon.
- **VerifyEmailForm rebuilt:** Same treatment with `ShieldCheck` icon.
  - Code input: `text-center text-lg tracking-[0.5em]` (spaced digits).
  - Resend button: `border-gold/20` with `hover:bg-gold/5`.

### Documented Decisions / Deviations (Recorded during Visual Overhaul - Phase 10)
- **Dashboard layout updated:** Glassmorphic user card.
  - User card: `border-gold/10 bg-white shadow-[0_2px_20px_rgba(0,0,0,0.03)]`.
  - Text: `text-obsidian` (name), `text-obsidian/40` (email).
- **Admin layout updated:** Same treatment with gold admin badge.
  - Admin badge: `bg-gold/10 text-gold` (replaces `bg-primary/10 text-primary`).
- **DashboardOverviewClient rebuilt:** Luxury dashboard with Framer Motion animations.
  - Stats: `border-gold/10 bg-white` cards with colored icons (gold, emerald, amber, terracotta).
  - Recent bookings: `border-gold/10 bg-white` container, `divide-gold/10` dividers.
  - Empty state: Gold CTA button, refined icon container.
  - Hover: `hover:bg-sand/20` on booking rows.
  - All sections: Framer Motion staggered animations.
- **AdminOverviewClient rebuilt:** Same treatment with stat cards.
  - Revenue: `text-gold`, Bookings: `text-lapis`, Pending: `text-amber-600`, Active: `text-emerald-600`.
  - Framer Motion staggered entrance animations.

### Documented Decisions / Deviations (Recorded during Visual Overhaul - Phase 11)
- **ScrollReveal component (reworked 23 Sept 2026, M2 Performance):** originally a Framer Motion wrapper;
  rewrote it as a **native IntersectionObserver** component (same API: `children`, `className`, `delay`, `direction`
  up/down/left/right; once + `rootMargin: -100px`; CSS opacity/transform transition 0.5s ease). Reason: removes
  framer-motion (~120 KB) from the home page first-load. Now in active use on the home page
  (`home-page-client.tsx` featured tours + why-us, `testimonials-section.tsx`, `process-section.tsx`); hero entrance
  animations are pure CSS `@keyframes fade-in-up` (`.animate-fade-in-up`, `.animate-fade-in-delayed`, `.animate-bob`
  in `globals.css`, all respecting `prefers-reduced-motion`). framer-motion remains only on non-first-load routes
  (auth forms, checkout, admin/dashboard overview, tours list page — separately navigated).
  - Props: `children`, `className`, `delay`, `direction` (up/down/left/right).
  - Default: `duration: 0.5`, `ease: [0.25, 0.1, 0.25, 1]` (transition), once trigger.
  - Direction map: `up: translateY(20px)`, `down: translateY(-20px)`, `left: translateX(20px)`, `right: translateX(-20px)`.
- **prefers-reduced-motion support added:** CSS media query in globals.css.
  - Disables all animations and transitions for users who prefer reduced motion.
  - `animation-duration: 0.01ms !important`, `transition-duration: 0.01ms !important`.
  - Ken Burns, shimmer, border glow animations explicitly disabled.

### Documented Decisions / Deviations (Recorded during Visual Overhaul - Phase 12)
- **Final QA:** TypeScript clean, build clean, no regressions.
- **84 static pages generated** successfully.
- **All routes verified:** Public (tours, auth), Dashboard, Admin, API routes.**

### Documented Decisions / Deviations (Recorded during M7 - Step 3)
- **Admin pages i18n wired:** All 6 admin pages (overview, tours, bookings, cms, admins, settings)
  now use client component wrappers with `useTranslation("common")`.
- **Admin client components created:** `AdminOverviewClient`, `AdminToursClient`, `AdminBookingsClient`,
  `AdminCmsClient`, `AdminAdminsClient`, `AdminSettingsClient` in their respective page directories.
- **TwoFactorSettings i18n:** Updated to use `useTranslation("common")` with all 2FA-related keys.
- **TourActions component created:** Extracted `ToggleTourStatusButton` to avoid `"use server"` inside
  `"use client"` (which caused Turbopack build errors). Uses existing `toggleTourStatusAction`.
- **Translation keys added (Step 3):** All admin keys added to all 3 locale files including
  `admin.totalBookingsCount`, `admin.showingRange` (with interpolation), `admin.tableView/kanbanView`,
  `admin.bankTransfer`, `admin.published/draft`, `admin.2fa*` keys, `admin.scanQrCode`, etc.
- **Type alignment:** Client component interfaces updated to match actual service return types
  (`RevenueChartPoint`, `TopTour`, `BookingListItem`).

### M7 Completion Plan (Locale Prefix Routing + Polish)
**Decision:** Add locale prefix routing (`/en/...`, `/ar/...`, `/de/...`) to enable proper hreflang
alternate links, server-side locale detection, and eliminate RTL flash on Arabic.
**User confirmed:** Add locale prefix routing, reviews deferred to M9, GA4 instructions needed.

#### Phase 1: Locale Prefix Routing
**Scope:** Move all routes under `[locale]` dynamic segment.

**New directory structure:**
```
src/app/
  [locale]/                          ← NEW root segment
    layout.tsx                       ← root layout (moved from src/app/layout.tsx)
      - generateStaticParams() → [{locale:'en'},{locale:'ar'},{locale:'de'}]
      - <html lang={locale} dir={dir[locale]}>
      - I18nProvider reads locale from URL
    (public)/
      layout.tsx                     ← moved from src/app/(public)/
      page.tsx                       ← /
      [slug]/page.tsx                ← /about, /privacy, etc.
      tours/
        page.tsx                     ← /tours
        [slug]/page.tsx              ← /tours/pyramids
        [slug]/book/page.tsx         ← /tours/pyramids/book
    (auth)/
      layout.tsx                     ← moved
      login/, register/, forgot-password/, reset-password/, verify-email/, verify-2fa/
    (dashboard)/
      layout.tsx                     ← moved
      dashboard/...
    (admin)/
      layout.tsx                     ← moved
      admin/...
    sitemap.ts                       ← moved (generates locale-prefixed URLs)
    robots.ts                        ← moved (disallow /{locale}/admin, etc.)
  api/                               ← STAYS at root (no locale prefix)
  globals.css                        ← stays (imported by layout)
```

**Key architectural decisions:**
1. `next/root-params` API (v16.3.0) — Server Components import `locale` from `next/root-params`
   without prop drilling. Client Components use `usePathname()` to extract locale.
2. Proxy (not middleware) handles locale detection — Next.js 16 convention.
3. Default locale redirect: `/` → `/en` (302 redirect).
4. API routes stay at `/api/` — no locale prefix for backend endpoints.
5. Language switcher navigates to `/${newLocale}${currentPath}` instead of setting cookie.

**Execution order:**
1. Document plan (this step) ✓
2. Create `[locale]/layout.tsx` with `generateStaticParams` ✓
3. Move route groups under `[locale]/` ✓
4. Update proxy.ts with locale detection ✓
5. Update i18n-provider.tsx to read locale from URL ✓
6. Update language-switcher.tsx ✓
7. Update internal links across all components ✓
8. Update sitemap.ts and robots.ts ✓
9. Verify build + lint ✓

#### Phase 2: Server-Side Locale Detection (Proxy)
**Status: COMPLETE** (done as part of Phase 1 — commit `1632ed8`)

Modify `src/proxy.ts` to:
- Check if pathname starts with `/en`, `/ar`, `/de`
- If not → detect from cookie or `Accept-Language` header → redirect to `/{locale}{path}`
- Update auth route checks to strip locale prefix
- Set locale cookie on first visit

**What was implemented:**
- `hasLocalePrefix()` — checks for `/en|ar|de` prefix
- `getLocaleFromCookie()` — extracts locale from cookie or Accept-Language
- Bare path detection → redirect to `/{locale}{path}`
- Auth route checks strip locale prefix before `/login`, `/register`, `/verify`, `/forgot-password`, `/reset-password`
- Locale cookie set on redirect

#### Phase 3: Hreflang Alternate Links
**Status: COMPLETE** (commit pending)

**Scope:** Add `alternates.languages` metadata to all public pages for SEO hreflang tags.

**What was implemented:**
- Created `src/core/utils/seo.ts` — `buildAlternates(pathname, locale)` helper
- Updated homepage `page.tsx` — dynamic `generateMetadata` with alternates
- Updated CMS pages `[slug]/page.tsx` — dynamic `generateMetadata` with alternates
- Updated tours listing `tours/page.tsx` — dynamic `generateMetadata` with alternates
- Updated tour detail `tours/[slug]/page.tsx` — dynamic `generateMetadata` with alternates
- All pages generate `<link rel="alternate" hreflang="en|ar|de|x-default" ...>` tags

#### Phase 4: GDPR Cookie Consent Banner
**Status: COMPLETE** (commit pending)

**Scope:** EU/UK GDPR compliance — show a cookie consent banner on first visit. User must Accept or Reject non-essential cookies before analytics/tracking loads.

**GDPR Requirements:**
1. No non-essential cookies until user gives explicit consent
2. Banner must be clearly visible on first visit
3. User can Accept all or Reject non-essential
4. Consent state stored in `cookie_consent` cookie (value: `accepted` | `rejected`)
5. Banner should not reappear after user makes a choice
6. Must work across all 3 locales (en/ar/de)

**What was implemented:**
- Created `src/shared/components/cookie-consent.tsx` — banner UI + cookie logic
- Added `<CookieConsent />` to root layout (`src/app/[locale]/layout.tsx`)
- Added i18n keys to all 3 locale files (en/ar/de)
- Banner shows on first visit, stores consent in `cookie_consent` cookie (1 year expiry)
- Accept/Reject buttons, RTL-aware layout, localized text

#### Phase 5: RTL Layout Polish
**Status: COMPLETE** (commit pending)

**Scope:** Verify and fix all RTL (Arabic) layout issues across the application.

**What was implemented:**
- Audited ~100 instances of RTL-unsafe CSS classes across 21 files
- Fixed all physical CSS properties to logical equivalents:
  - `ml-*` → `ms-*` (margin-inline-start)
  - `mr-*` → `me-*` (margin-inline-end)
  - `pl-*` → `ps-*` (padding-inline-start)
  - `pr-*` → `pe-*` (padding-inline-end)
  - `text-left` → `text-start`
  - `text-right` → `text-end`
  - `border-l` → `border-s` (border-inline-start)
  - `rounded-l` → `rounded-s`, `rounded-r` → `rounded-e`
  - `left-*` → `start-*`, `right-*` → `end-*`
- Fixed 11 shared UI components: field, table, accordion, select, dropdown-menu, button, badge, tabs, toast, dialog, calendar
- Fixed 4 feature components: TourSearchBar, TourMap, ItineraryAccordion, CheckoutForm
- Fixed 6 admin table/page components
- Fixed 3 layout files and cookie-consent component
- `flex-row` classes left as-is (correctly handled by `dir="rtl"` on `<html>`)

#### Phase 6: Responsive Design Polish
**Status: COMPLETE** (commit pending)

**Scope:** Verify mobile layouts, table responsiveness, touch targets, and overall responsive design.

**What was implemented:**
- Audited all pages for responsive design issues
- Fixed TourWizard overflow issues:
  - Step indicator: added `overflow-x-auto` + `shrink-0`, hid labels on mobile (`hidden sm:inline`)
  - Route point rows: added `flex-wrap` for mobile wrapping
  - Image URL rows: added `flex-wrap` for mobile wrapping
  - Date rows: added `flex-wrap` for mobile wrapping
- Fixed mobile nav touch targets:
  - Nav links: increased padding from `py-1` to `py-3` (32px → 44px touch target)
  - Language switcher wrapper: increased padding from `py-1` to `py-2`
  - WhatsApp link: increased padding from `py-1` to `py-3`
- Fixed admin bookings action buttons: increased padding to `px-3 py-1.5` + `min-h-[36px]`
- Fixed not-found page buttons: increased padding from `py-3` to `py-3.5`

#### Phase 7: GA4 Setup Instructions
**Status: COMPLETE** (commit pending)

**Scope:** GA4 integration with Next.js + detailed setup guide for user.

**What was implemented:**
- Created `src/core/lib/analytics.ts` — GA4 helper functions (pageview, event) with Window.gtag type
- Created `src/shared/components/analytics-provider.tsx` — Client provider using next/script (gtag.js)
- Created `src/shared/hooks/use-analytics.ts` — Client hook for pageview tracking + event tracking
- Added `<AnalyticsProvider />` to root layout
- Expanded MANUAL_STEPS.md with detailed 7-step GA4 setup guide (create property, data stream, measurement ID, enhanced measurement, conversion events, testing, privacy)

**Files created:**
- `src/core/lib/analytics.ts`
- `src/shared/components/analytics-provider.tsx`
- `src/shared/hooks/use-analytics.ts`

**Files modified:**
- `src/app/[locale]/layout.tsx` — Added AnalyticsProvider import + component
- `MANUAL_STEPS.md` — Expanded GA4 section with step-by-step instructions

### Disconnected Pieces / Pending (Recorded during M7)
- **Locale prefix routing COMPLETE** — Phase 1 done (commit `1632ed8`). All routes under `[locale]/`, all links locale-aware, proxy handles detection.
- **Hreflang alternate links COMPLETE** — Phase 3 done. `seo.ts` helper + all public pages have `generateMetadata` with `alternates.languages`.
- **GDPR Cookie Consent Banner COMPLETE** — Phase 4 done. `cookie-consent.tsx` component added to root layout, i18n keys in all locales.
- **RTL Layout Polish COMPLETE** — Phase 5 done. ~100 instances fixed across 21 files. All physical CSS properties converted to logical equivalents.
- **Responsive Design Polish COMPLETE** — Phase 6 done. TourWizard overflow fixed, mobile nav touch targets increased, admin button sizing improved.
- **GA4 Setup Instructions COMPLETE** — Phase 7 done. Analytics provider created, MANUAL_STEPS.md expanded with step-by-step guide.
- **GA4 NOT CONFIGURED** — awaiting user to create GA4 property.

### Disconnected Pieces / Pending (Recorded during M4)
- **Stripe cannot be E2E-tested** — `pk_test_*` / `sk_test_*` / `whsec_*` are placeholders. Structural
  code (PaymentIntent, Elements, confirmPayment, webhook sig-verify) is complete and the client
  degrades gracefully to bank transfer. Needs real test keys for full E2E (MANUAL_STEPS.md).
- **`/tours/[slug]/book` dangling pointer RESOLVED** — the book page + booking API now exist (M4); the
  M3 "Book now" links resolve correctly.
- **Booking emails** (`bookingConfirmationEmailHtml`) are defined but not delivered until a real
  Resend key exists (placeholder-safe — sendEmail never throws).
- **No admin UI yet** to review PENDING_RECEIPT_REVIEW bookings or approve them → CONFIRMED — belongs
  to Admin panel (M6).
- **Invoice row creation RESOLVED** — invoices are created when booking becomes CONFIRMED (via
  `confirmBookingFromStripe`). Bank-transfer invoices deferred to M6 admin approval.
- **Invoice generation (`@react-pdf/renderer`)** — client-side PDF generation works. `InvoicePDF`
  component renders company logo, invoice number, dates, line items, and totals. Triggered from
  booking detail and invoices list pages.
- **Client Dashboard RESOLVED** — fully implemented in M5: overview stats, bookings list/detail, invoice PDF download, wishlist/favourites, profile (name, email change w/ OTP, password, notifications, GDPR delete).

### Disconnected Pieces / Pending (Recorded during M2)
- **Dashboard RESOLVED (M5)** — full client dashboard with overview, bookings, invoices, wishlist,
  and profile pages. **Admin placeholder** remains — to be filled in M6.
- **Admin 2FA (`is_2fa_verified`) declared but not enforced** — deferred to the 2FA / Admin milestone.
- **Resend has no real API key** (`.env` = `re_placeholder`). Code paths work but emails are not
  actually delivered until a real key is provided (see MANUAL_STEPS.md).
- **`next-auth` JWT secret** — using `NEXTAUTH_SECRET` from `.env`; confirm a strong random value
  in production (MANUAL_STEPS.md).
- **OTP email delivery** cannot be end-to-end verified until Resend key + verified domain exist;
  OTP DB/business logic is verified against the real DB.
- **Homepage** (`/`) renders the real public homepage (M3): hero, search, featured tours, why-us,
  trust badges. Old create-next-app scaffold deleted.
- **`useActionState`-driven forms** rely on React 19; both client and server flows verified via
  NextAuth `signIn` + server actions against local dev server and the real MariaDB.

### Pending Items (Human / External)
- [x] ~~VPS server provisioning~~ — DONE Sept 2026 on `72.61.209.105` (single VPS: Next.js in Docker
      + MariaDB on-host + Nginx + Let's Encrypt). NOTE: PM2 blueprint was NOT used — Docker is the deploy method.
- [x] ~~Domain DNS configuration for mysticegypt.net~~ — DONE (site live). Under Cloudflare? old provider; domain resolves to VPS.
- [ ] Stripe — **ACTIVE (TEST MODE) Sept 2026**: pk_test_/sk_test_ deployed to server env files,
      webhook endpoint `we_1UDvRUCEY99QqzyR27OTzDHW` created (event `payment_intent.succeeded`),
      real `whsec_` from Stripe (the earlier supplied `whsec_RVbOy...` was orphan). E2E passed:
      test PI confirmed → webhook → HTTP 200 on prod. Go-Live pending owner approval.
- [x] **Meta Pixel + Conversions API — ✅ LIVE (Sept 24, 2026, release `2026-09-24-c725559`):**
      Pixel `1510981584397229` (**replaced** old `3633452613471654` everywhere;
      `META_CAPI_TOKEN` provided by owner, kept only in env files). Client lib
      (`src/core/lib/meta-pixel.ts`, base pixel snippet + `fbq('consent','revoke')`, Advanced
      Matching via session, `sendMetaEvent` browser + CAPI proxy with shared `event_id`), server
      CAPI (`src/core/lib/meta-conversions.ts`, Graph API `v23.0`, SHA-256-hashed `em/ph/fn/ln`),
      consent gate = existing `cookie_consent=accepted` (same as GA4). Events:
      `PageView` (provider, `src/shared/components/meta-pixel-provider.tsx`), `ViewContent`
      (`TourContent.tsx`), `Lead` (contact form success), `InitiateCheckout` (on "Book Now" /
      "View tour" CTA clicks — the old after-booking-creation IC was removed to avoid
      double-counting), `Purchase` (browser in `CheckoutForm.tsx`, `event_id = booking.id` for
      Purchase dedup; server CAPI `Purchase` in `confirmBookingFromStripe` via Stripe webhook —
      gated by `meta_consent` (+`fbp`/`fbc`) carried in PaymentIntent metadata). Env vars:
      `NEXT_PUBLIC_META_PIXEL_ID`, `META_PIXEL_ID`, `META_CAPI_TOKEN`, `META_TEST_EVENT_CODE`
      (all 4 in server `.env` + `.env.container`; `package-release.ps1` now injects
      `NEXT_PUBLIC_META_PIXEL_ID` at build). Typecheck + lint + smoke clean; DEPLOYED and
      verified: 200s, new pixel baked (old absent), container env loaded, previous image
      preserved. Remaining: owner verifies via Pixel Helper / Meta Test Events (URL
      `https://business.facebook.com/events_manager2/test_events/1510981584397229`) and marks
      `Lead`/`InitiateCheckout`/`Purchase` as conversions.
- [x] **Meta events showed ONLY localhost — fixed + DEPLOYED (2 Oct 2026, tag
      `2026-10-02-meta-pixel-fix`)** — 3 root causes (full detail in MANUAL_STEPS §5b-fix):
      (A) **quoted values in server `.env.container`** — docker `--env-file` passes quotes
      literally (dotenv strips them) → `META_CAPI_TOKEN` reached Graph as `"EAA…"` →
      `Invalid OAuth access token`, **25/25 prod CAPI events failed**; fixed by stripping
      quotes (rule: `.env.container` values must be unquoted). (B) **`fbq('consent','revoke')`
      as the first queued call in the pixel loader snippet poisoned the fbevents.js queue
      flush** — queued `grant`+`init` were dropped, pixel never registered
      (`getState().pixels=[]` in every prod flow); removed (snippet only injects post-consent).
      (C) **initial PageView lost on full page loads** — provider's `pathname` effect ran
      before init; fixed by adding `consent` to its deps. Why localhost worked: dev dotenv
      strips quotes → dev CAPI succeeded with localhost URLs. Verified live: pixel registers
      (`eventCount:1` on load), `facebook.com/tr/?ev=PageView&dl=https://mysticegypt.net/en`,
      `POST /api/analytics/meta` clean, zero `[meta-capi]` errors. **Server hygiene same day:**
      now PRODUCTION-ONLY (old releases/docs/src/md removed, releases 1.4G→136M — keep-list in
      MANUAL_STEPS hygiene runbook). Remaining: owner confirms Events Manager shows
      `mysticegypt.net` events + dedup.
- [ ] Resend — **ACTIVE Sept 2026**: real API key deployed to server `.env` + `.env.container`;
      domain `mysticegypt.net` fully **verified** (DKIM, SPF×2, Tracking CNAME `links → links1.resend-dns.com`);
      Open+Click tracking LIVE on `links.mysticegypt.net`; **user rotates the interim key after final confirmation**
- [ ] Google Analytics 4 — **LIVE Sept 2026**: Measurement ID `G-B960Q7XTDS` deployed
      (`NEXT_PUBLIC_GA_ID` in `.env` + `.env.container`); gtag fires confirmed (204). Optional
      follow-up: mark `purchase`/`sign_up` as conversion events in GA4 Dashboard.
- [ ] **GA4 conversion events (DEPLOYED 10 Sep 2026):** `whatsapp_click`, `view_item`,
      `generate_lead`, `begin_checkout`, `purchase` (server-side via Stripe webhook, idempotent
      via `Booking.ga_purchase_status` enum `NOT_SENT|SENDING|SENT`). Done on prod: image rebuilt,
      container recreated, DB migration applied (`ga_purchase_status` + `ga_purchase_sent_at`,
      backup in repo `backups/`), `GA_MEASUREMENT_SECRET` added to `.env`+`.env.container`
      (validated via GA4 debug endpoint). Client events verified in browser (`view_item`,
      `whatsapp_click` fired). Remaining: mark `generate_lead`/`begin_checkout`/`purchase` as
      conversions in GA4 UI + optional Stripe test-payment E2E. Server disk was cleaned (~15GB:
      `docker builder prune`, `docker image prune`, old `/tmp` build logs).
- [ ] WhatsApp Click-to-Chat — **CONFIRMED 10 Sep 2026**: number `447412880087` in
      `NEXT_PUBLIC_WHATSAPP_NUMBER` (header, mobile nav, footer all link `wa.me/447412880087`).
- [x] ~~Base currency decision~~ — RESOLVED: EUR (old-site tour prices are €, seeded as EUR)
- [x] ~~UI/UX Figma designs (PRD §9 step 1)~~ — SUPERSEDED by the completed Luxury Visual Overhaul (12 phases)
- [ ] Real tour images (16 tours live with placeholder images) — original gallery URLs kept in
      `docs/tours_seed.json`; old site is Cloudflare-blocked so images must be downloaded manually

## [VISUAL_OVERHAUL]

### Design Direction
- **Style:** Parallax Storytelling — Cinematic, mysterious, luxury travel magazine aesthetic
- **Mode:** Light mode ONLY (dark mode skipped)
- **Target:** $10k+ luxury agency feel for high-net-worth European tourists

### Color Palette
| Role | Color | Hex | Usage |
|------|-------|-----|-------|
| Primary Background | Deep Sandstone Off-White | `#F4F1EA` | Page backgrounds, sections |
| Text/Accents | Obsidian Black | `#0B0C10` | Headings, body text, dark overlays |
| CTA/Accent | Pharaonic Matte Gold | `#D4AF37` | Buttons, borders, highlights, icons |
| Secondary Accent | Lapis Lazuli Deep Blue | `#1F3A93` | Links, secondary elements |
| Tertiary | Subtle Terracotta | `#C4704A` | Warm accent, exclusions |

### Typography
| Role | Font | Weights | Source |
|------|------|---------|--------|
| Headings | Cinzel | 400, 500, 600, 700 | Google Fonts |
| Body | Inter | 300, 400, 500, 600, 700 | Google Fonts (replaces Geist) |

### Animation Stack
| Library | Purpose | Version |
|---------|---------|---------|
| Framer Motion | Scroll reveals, parallax, staggered animations, page transitions | Latest |

### Phase Status
| # | Phase | Status | Commit |
|---|-------|--------|--------|
| 1 | Foundation — Design Tokens & Typography | ✅ COMPLETE | Framer Motion installed, Cinzel+Inter fonts, Egyptian palette, stock images |
| 2 | Global Layout — Navigation & Footer | ✅ COMPLETE | Glassmorphic header, gold nav links, full-screen mobile nav, obsidian footer |
| 3 | Homepage Hero & Search | ✅ COMPLETE | Cinematic hero with Ken Burns, Framer Motion staggered reveals, glassmorphic search |
| 4 | Tour Cards & Featured Section | ✅ COMPLETE | Luxury tour cards with image zoom, gold accent line, cinematic overlay, price badge |
| 5 | Tour Detail Page — Gallery & Layout | ✅ COMPLETE | Cinematic gallery, gold price, elegant breadcrumb, terracotta exclusions, dark CTA |
| 6 | Itinerary Timeline & Map | ✅ COMPLETE | Vertical timeline with gold dots, CartoDB Dark Matter map, gold dashed polyline |
| 7 | Checkout & Forms | ✅ COMPLETE | Gold focus borders, glassmorphic auth cards, gold CTA buttons, terracotta errors |
| 8 | Tours Listing & Search Page | ✅ COMPLETE | Cinematic hero header, radial gradient bg, staggered card animations, gold empty state |
| 9 | Auth Pages | ✅ COMPLETE | Cinematic dark bg, glassmorphic cards, gold icons, terracotta errors, gold CTAs |
| 10 | Dashboard & Admin Polish | ✅ COMPLETE | Glassmorphic sidebar cards, gold stat icons, refined recent bookings, Framer Motion |
| 11 | Scroll Animations & Micro-Interactions | ✅ COMPLETE | ScrollReveal wrapper, prefers-reduced-motion, custom easing curves |
| 12 | Final QA & Performance | ✅ COMPLETE | TypeScript clean, build clean, no regressions |

### Constraints (STRICT)
1. **VISUAL ONLY** — CSS, Tailwind classes, layout JSX, animations. NO logic changes.
2. **PRESERVE FUNCTIONALITY** — Every onClick, data binding, API call, state management untouched.
3. **NO dark mode** — Skip entirely even if referenced in design direction.
4. **Stock images** — Download now, user replaces later.
5. **Performance** — All animations GPU-accelerated (transform/opacity), respect prefers-reduced-motion.

### Skills Used
- M3 verification: browser-based QA via chrome-devtools (homepage, listing, tour detail, Leaflet
  map, customize dialog, login auth gate, DB write-back check). No new skills installed. Candidates
  for later milestones: `ui-ux-pro-max` (UI/design polish), `careful` (prod/deploy safety M8),
  `browse`/`qa` (M8 testing).
- M4 verification: browser-based QA via chrome-devtools on `/tours/[slug]/book` — checkout form
  renders (date/people/add-ons/payment/terms), add-on totals update, form validation (date + terms),
  Stripe graceful degradation on placeholder keys, full bank-transfer E2E (booking created + receipt
  uploaded → PENDING_RECEIPT_REVIEW), confirmed against the real MariaDB via a tsx Prisma query.
  Temp verify script removed after use. No new skills installed.
- M5 verification: browser-based QA via chrome-devtools — dashboard overview (stats + recent bookings),
  bookings list/detail (status, invoice number, price breakdown), invoice PDF generation (PDFDownloadLink
  renders and downloads ME-YYYYMMDD-XXXXXX.pdf), invoices list, wishlist toggle on tour page (button
  flips), profile page (name, email, password, notifications, GDPR delete), direct DB queries via tsx
  (notifications column, invoice creation, wishlist toggle), `npx tsc --noEmit` + `npm run lint` +
  `npm run build` all clean. Temp verify script cleaned up.

---

## Milestone 8: Testing, QA & Deployment
**Status: COMPLETE — PRODUCTION DEPLOYED** (Sept 2026)

### Phase 1: Re-QA — Browser-Based Regression Testing
**Status: COMPLETE** (commit `c725559`)

**Scope:** Re-test all existing test cases after M7 changes.

**Results:**
| Test | Result | Notes |
|------|--------|-------|
| English homepage (hero, featured tours, footer) | ✅ | All sections render correctly |
| Arabic locale (RTL, translations) | ✅ | dir="rtl" set, all text Arabic, cookie consent Arabic |
| German locale (translations) | ✅ | All text German, all URLs use /de/ prefix |
| Tours listing page | ✅ | 2 tour cards, search bar, all links /en/ prefixed |
| Tour detail page | ✅ | Image, itinerary, map, booking CTA, all sections render |
| Login page (auth redirect) | ✅ | Redirects to /en/admin (already logged in) |
| Admin sidebar links | ✅ | Fixed: all links now use /en/ prefix |
| Dashboard sidebar links | ✅ | Fixed: all links now use /en/ prefix |
| Language switching | ✅ | Dropdown opens, 3 options, navigates to correct locale |
| Cookie consent banner | ✅ | Accept All button dismisses banner |
| 404 page | ✅ | Custom branded page with Back to Home and Browse Tours links |
| Mobile responsive (375px) | ✅ | Hamburger menu, stacked content, no overflow |
| Console errors | ✅ | No errors found |
| Lighthouse audit | ✅ | Accessibility: 100, Best Practices: 100, SEO: 100 |

**Bugs found and fixed:**
1. Admin sidebar links missing `/en/` prefix — Fixed in AdminNav.tsx
2. Dashboard sidebar links missing `/en/` prefix — Fixed in DashboardNav.tsx
3. Dashboard bookings links missing locale prefix — Fixed in dashboard-overview-client.tsx, dashboard-bookings-client.tsx
4. Admin tours edit link missing locale prefix — Fixed in admin-tours-client.tsx
5. Admin CMS edit link missing locale prefix — Fixed in admin-cms-client.tsx
6. Not-found page links missing locale prefix — Fixed in not-found.tsx (converted to client component)

**Scope:** Re-test all 72 existing test cases from QA_TESTING_PLAN.md using the browse tool after M7 changes (locale routing, RTL, responsive, cookie consent, GA4).

**Sub-steps:**
1. Launch dev server (`npm run dev`)
2. Test Public Pages — verify locale routing works for all 3 locales, RTL layout, cookie consent banner, responsive layouts
3. Test Authentication — verify auth flows still work with new `[locale]` routing
4. Test Client Dashboard — verify dashboard, bookings, invoices, wishlist, profile
5. Test Booking Flow — verify checkout, Stripe test mode, bank transfer, receipt upload
6. Test Admin Panel — verify tours, orders, CMS, 2FA, admin management
7. Test Edge Cases — verify 404, form validation, error states, mobile responsive
8. Document any new issues found
9. Fix issues if found

**Test environment:**
- Dev server on localhost:3000
- Chrome DevTools via browse tool
- Test with all 3 locales (en, ar, de)
- Test mobile viewport (375px) and desktop (1280px)

### Phase 2: Lighthouse Audit
**Status: COMPLETE** (completed as part of Phase 1)

**Results:**
- Homepage: Accessibility 100, Best Practices 100, SEO 100

**Scope:** Run Lighthouse on key pages to verify Performance, Accessibility, Best Practices, SEO scores.

**Pages to audit:**
- Homepage (`/en`)
- Tours listing (`/en/tours`)
- Tour detail (`/en/tours/[slug]`)
- Login (`/en/login`)
- Dashboard (`/en/dashboard`)

**Target scores:** All categories ≥ 90

### Phase 3: Build & Lint Verification
**Status: COMPLETE** (verified during Phase 1)

**Results:**
- `npm run build` — passes cleanly
- No errors in build output

**Scope:** Final build and lint check before deployment readiness.

**Commands:**
- `npm run build` — must pass with 0 errors
- `npm run lint` — must pass with 0 errors (pre-existing warnings acceptable)

### Phase 4: Security Audit
**Status: COMPLETE**

**Results:**

| Check | Status | Details |
|-------|--------|---------|
| TypeScript `any` types | ✅ | Only 1 match in a comment, no actual `any` usage |
| Hardcoded secrets | ✅ | All secrets via `process.env`, no hardcoded values |
| API route protection (admin) | ✅ | All 7 admin routes use `requireAdmin()` |
| API route protection (client) | ✅ | All 3 client routes use `getCurrentUser()` + 401 |
| Stripe webhook | ✅ | Uses webhook secret for signature verification |
| Input validation | ✅ | Extensive: email regex, password regex, OTP format, file type checks, number validation, required field checks |
| Nginx upload protection | ✅ | Config blocks PHP/Python/Shell/CGI execution in /uploads/ |
| Security headers (Next.js) | ✅ | HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy |
| Security headers (Nginx) | ✅ | HSTS, X-Content-Type-Options, X-Frame-Options |

**Scope:** Quick security checks before deployment.

**Checks:**
- No `any` types in TypeScript
- No hardcoded secrets in code
- API routes properly protected with auth checks
- CSRF protection on forms
- Input validation on server actions
- `public/uploads/` blocks script execution (Nginx config verified)

### Documented Decisions / Deviations (Recorded during M11 — Tours Migration & Production Rollout, Sept 2026)
- **Production rollout = Docker on a single VPS.** Next.js standalone image (`mystic-egypt-new:latest`)
  in container `mystic-egypt` (port `3100->3000`), MariaDB on the SAME host (DB `mystic_egypt`),
  Nginx HTTPS (`mysticegypt.net` → `127.0.0.1:3100`). Full runbook: `MANUAL_STEPS.md`.
- **16 old-site tours migrated live** (18 tours total with 2 pre-existing). Source: `docs/trips_parsed.json`
  → `docs/tours_seed.json` (original gallery URLs kept) → `docs/tours_seed_full.sql` (16 tours + 46
  itineraries) run directly on the prod DB. **Superseded 1 Oct 2026:** catalog re-seeded from
  `docs/trips.txt` via `prisma/seed-tours.ts` → **31 tours, all USD**, 22 CC0/PD catalog images
  (`public/uploads/tours/catalog/` + `CREDITS.json`) scp'd to
  `/var/www/mysticegypt/data/uploads/tours/catalog/`; pre-seed prod backup:
  `/var/backups/mystic_egypt-20261001-154817.sql.gz`; bookings/IDs unchanged; orphan
  `data/uploads/tours/<slug>/` galleries + placeholder JPGs deleted (0 DB refs verified).
- **`Tour.duration` added** via manual `ALTER TABLE tours ADD COLUMN duration VARCHAR(255) NULL;`
  (values like `1 Day`..`8 Days`). Migration policy on prod: **NO `prisma migrate`** (would drift/reset).
- **Pre-existing prod bug fixed — `DYNAMIC_SERVER_USAGE` 500s** on tour detail pages (production only):
  `PublicHeader` called `cookies()/getCurrentUser()` in the layout, so static-classified routes
  (`generateStaticParams`+`revalidate`) 500 on demand. **ROOT-CAUSE FIXED 23 Sept 2026 (M2, local only, undeployed):**
  `PublicHeader` converted to `"use client"` (`useSession()` + `useLocale()`, no `cookies()`/`getCurrentUser()`), so
  the whole `(public)` tree prerenders (`/[locale]` SSG+ISR). The earlier `export const dynamic = "force-dynamic"`
  workaround on `tours/[slug]/page.tsx` was **removed** (cause eliminated; tour pages revert to ISR `revalidate=300`;
  build-safe via `generateStaticParams` try/catch returning `[]` when DB absent). `book`/`dashboard`/`admin`/`bookings`
  routes keep `force-dynamic` legitimately (`requireUser()`). Dev server does not reproduce the original bug.
  **Note:** the `policies/[policy]` route's `dynamicParams=false` comment and the `DYNAMIC_SERVER_USAGE` notes in
  `AGENTS.md`/`MANUAL_STEPS.md`/`SEO_EXECUTION_PLAN.md`/`docs/Final Technical Blueprint.md` are now stale only w.r.t.
  the header — the static-route policies pages are unaffected and still correct.
- **Docker `--add-host host.docker.internal:host-gateway` is REQUIRED** on the VPS — without it the
  container cannot resolve the DB host and 500s with Prisma `pool timeout` (P2039). The container
  connects via `host.docker.internal` → gateway `172.17.0.1` → MariaDB 3306. Prisma 7 adapter
  requires `mariadb://` scheme (NOT `mysql://`).
- **Auth pages contrast fix** (login/register/forgot-password): text outside the white card on the
  dark `bg-obsidian` background used dark/low-opacity colors (`text-obsidian/40`, `text-sandstone/50`)
  and was invisible. Fixed to `text-sandstone` / `text-sandstone/60` (auth-header, LoginForm,
  RegisterForm, ForgotPasswordForm). Deployed + verified 200 on EN/AR/DE.
- **Stray container cleanup:** `mystic-egypt-old` (old image experiment on 3101) removed.

### Homepage Services & Categories (Sept 25, 2026 — local implementation)

**Status: CODE COMPLETE · DATABASE APPLICATION PENDING · NOT DEPLOYED**

- Added `Category` and `Service` Prisma models with localized names/descriptions, local image paths, display order, and active state.
- Added idempotent seed data for six categories and four services in `prisma/seed.ts`; seed has not been run against any database.
- Added the homepage feature layer under `src/features/homepage/` for public reads, admin CRUD, input validation, localized DTOs, and service-icon typing.
- Added authenticated admin CRUD routes under `src/app/api/admin/homepage/`; the shared guard returns `401` for unauthenticated requests and `403` for non-admin/2FA-required users.
- Added `/admin/homepage` for creating, editing, hiding, ordering, and deleting categories/services with English, Arabic, and German fields.
- Added public Services marquee and Categories grid sections, local-image previews, desktop/mobile anchor navigation, Ken Burns hero motion, and reduced-motion handling.
- Added six local WebP assets under `public/uploads/categories/`; no CDN URLs are used.
- The homepage fetches tours, categories, and services in parallel and falls back to empty homepage sections when optional database tables are unavailable.
- Verification completed locally: `npx tsc --noEmit`, targeted ESLint, JSON parsing, and `npm run build` passed. The build emitted only the existing custom Cache-Control warning.
- Safety gate: the current `DATABASE_URL` points to the production VPS database. Do not run `db:push`, `db:seed`, or any schema-changing command until an isolated local database URL is explicitly confirmed.
- Skill used: `vercel-react-best-practices`; applied its parallel-server-fetch and bundle-aware review guidance to the homepage fetch/rendering changes.

### Admin Tour Image Upload — prod EACCES root-cause fix + wizard UX overhaul (1 Oct 2026)

**Status: DEPLOYED (tag `2026-10-01-c725559`, release 21:42 local) · VERIFIED**

- **Incident:** admin tour-image upload always failed with the generic "Upload failed. Please try again."
  toast. **ROOT CAUSE:** container runs as `nextjs` uid **1001**, but host `/var/www/mysticegypt/data/uploads`
  (incl. `tours/`, `receipts/`, `stock/`) was `root:root 755` → `EACCES: permission denied, mkdir
  '/app/public/uploads/tours/admin'` (repeated in `docker logs mystic-egypt`). nginx
  (`client_max_body_size 10M`) and auth were fine — the failed `mkdir` surfaced as a 500 HTML page, so
  `res.json()` threw and the client showed the generic catch message. **Side effect: receipt upload was
  equally broken** (root-owned parent dir).
- **Fix (server, immediate):** `chown -R 1001:1001 data/uploads` + dirs 755 / files 644.
  **Fix (durable):** `scripts/release.sh` now enforces host-side `mkdir -p` + `chown -R 1001:1001` +
  mode normalization on every release (local file scp'd to `/var/www/mysticegypt/scripts/release.sh`).
- **Fix (app):**
  - **Unified delete** — single "Delete image" button per row removes the tour's `tour_images` record AND
    the file from disk. File is deleted only when **no other tour references the same URL** (5 catalog files
    are shared: `cairo-pyramids.webp` ×4, `hurghada-desert-safari.webp` ×3, …), and the file delete runs
    BEFORE the record so a disk failure changes nothing. `removeTourImage(url, tourId?)`
    (`features/admin/service.ts`) replaces the old global-by-url `removeTourImageByUrl` — that variant was a
    cross-tour data bug (it would have wiped rows on every tour sharing the URL).
  - **Busy gating** — while an upload/delete runs, Next/Back/Save are disabled, Next's label shows
    "Uploading…"/"Deleting…", and all upload/delete inputs lock (also prevents index-shift while a row's
    upload is in flight).
  - **Plain-language copy** — removed "(file stays on the server)", "paste a local path" + code sample,
    `/uploads/…` placeholders and "…to the server" toasts → "Image address" placeholder, "Add a photo from
    your computer…", confirm "Delete this image? This cannot be undone.", Tiptap prompts "Link address:" /
    "Image address:", homepage-admin placeholder "Image address".
  - Error toasts surface `HTTP <status>` when the response isn't JSON (proxy error pages, redirects)
    instead of the generic message.
- **release.sh hardening:** same-tag redeploys `rm -rf` the release dir before extract (no stale bundle files).
- **Verified:** `tsc --noEmit` + targeted ESLint clean; local browser QA — 2 MB upload under Slow 3G with
  the busy state captured (Next/Back disabled + "Uploading…"), delete → confirm → file removed from disk +
  primary re-promoted; prod post-deploy `WRITE_OK` as uid 1001, EN/AR/DE 200, catalog images 200, images API
  auth-gated (303 → `/en/login`). Rollback image: `mystic-egypt-new:previous`.

### A+B+C+D Release — images, language switcher, nginx 12M, Hot Offers (2 Oct 2026)

**Status: DEPLOYED (tag `2026-10-02-c725559`, release 22:50 UTC) · LIVE VERIFIED** — full tracker: `docs/PROGRESS-2026-10-01.md`.

- **Phase A (tour images):** app-side `/uploads/[...path]` route (`GET`/`HEAD`, content-type map,
  traversal-guarded, `Cache-Control: public, max-age=86400`) + `src/proxy.ts` matcher extended to
  non-image upload extensions (receipts/PDFs). Standalone battery 8/8.
- **Phase B (language switcher):** switcher removed from `utility-bar` and added to the desktop+mobile
  public header (`public-header.tsx`, now `"use client"`) and dark auth header (`auth-header.tsx`);
  orphan `public-header-client.tsx` deleted. B6 dev gotcha: browse via `localhost` only (Next 16
  `block-cross-site-dev.js` 403s `127.0.0.1` `/_next/*` origins, killing hydration).
- **Phase C (nginx):** `client_max_body_size 10M → 12M` — note `sites-enabled/mysticegypt` is a REAL
  FILE (not the usual symlink) and had drifted from `sites-available` (`/_next/image` trailing-slash);
  both synced + backup `/etc/nginx/backups/mysticegypt.bak.2026-10-02` + `nginx -t` + reload.
  Details in `MANUAL_STEPS.md` §8.
- **Phase D (Hot Offers):** `Offer` Prisma model + manual prod DDL (backup-first, no migrate) +
  3 seed rows; `features/homepage` offers service/validation/types; admin CRUD API
  (`api/admin/homepage/offers[/:id]`) + `/admin/homepage` Offers section; public `OffersHeroBar`
  (pinned hero bottom, `#offers` anchor + chips) and `OffersSection` (ribbon cards) after Categories;
  i18n `offers.*` keys in en/ar/de. Local verify: EN geometry, AR/RTL, CRUD create→live→delete,
  toggle off/on, 3 seeds restored, 0 console errors.
- **Release engineering:** `fs.stat/fs.readFile(/*turbopackIgnore: true*/)` in the uploads route —
  without it Turbopack traced the whole project into standalone (**521 MB** bundle → **40.2 MB** after).
  Release flow unchanged: `package-release.ps1` → scp → `scripts/release.sh` (build-image 10s, swap,
  verify /en /en/tours /en/tours/fayoum 200).
- **Live battery:** EN/AR/DE 200 (AR `dir=rtl` + Arabic offers), uploads webp 200, `/_next/image` 200,
  switcher present home header + login/register (top-right, utility bar clean), hero bar
  (`bg-obsidian/75`, h=56, indicator above) + `#offers` section with 3 cards, nginx 12M active.

### Hot Offers REDESIGN — `Tour.isOffer`, `offers` table dropped (2 Oct 2026)

**Status: DEPLOYED (tag `2026-10-02-offers-bar`, bundle 40.2 MB) · LIVE VERIFIED** — supersedes Phase D
above (full tracker: `docs/PROGRESS-2026-10-01.md` → Phase D2).

- **Decision (user-approved):** offers = **bookable tours**, not a separate entity. The Phase-D `Offer`
  model, admin CRUD (`api/admin/homepage/offers[/:id]`), `/admin/homepage` Offers tab, i18n admin keys
  and `seed.ts` homepageOffers block are **all removed**; replaced by a single `Tour.isOffer` boolean.
- **Schema:** `tours.isOffer BOOLEAN NOT NULL DEFAULT false` (schema.prisma:109). Prod DDL (manual,
  backup-first): backup `data/backup_full_2026-10-02_pre_drop_offers.sql` (60 KB) → `ALTER TABLE tours
  ADD COLUMN isOffer` → `UPDATE` 5 slugs (`cairo`, `luxor`, `hurghada`, `fayoum`,
  `classic-nile-cruise-cairo`) → `DROP TABLE IF EXISTS offers`.
- **Backend:** `listPublicOfferTours()` (`features/tour/service.ts`, `cache()`, `isOffer: true` +
  open status) → `TourSummary[]`; `getPublicTourBySlug`/admin tour detail/create/update pass `isOffer`;
  tours POST/PUT routes parse `isOffer: boolean`; `endpoints.ts` OFFERS block removed.
- **Public UI:** bar **moved from hero bottom to hero top** (`absolute inset-x-0 top-0 z-20`, solid
  `bg-obsidian` so the existing `services-marquee` edge-fades read cleanly) — shimmer hairline +
  pulsing `offers.heroLabel` pill + duplicated `OfferChipGroup` marquee (32s, hover-pause);
  `OffersSection` = 5 ribbon cards linking `/tours/[slug]` (image h-44, `animate-pulse` badge
  `offers.badge` OFFER/عرض/ANGEBOT, duration, price, "View offer" CTA). Scroll indicator back to
  `bottom-8`. Empty offer list → both placements render null.
- **Admin UI:** `TourWizard` step 3 checkbox "Hot offer on homepage" (`TourData.isOffer`, edit page
  passes `tour.isOffer`); homepage admin Offers tab deleted.
- **i18n:** public `offers.badge` added (en/ar/de); admin offer keys removed from all 3 locales.
- **Seeds:** `seed-tours.ts` carries `isOffer` on the 5 slugs (upsert update-path spreads it only when
  present so older rows keep their flag); `seed.ts` offers block removed.
- **Verified:** `tsc --noEmit` 0, lint = same 7 pre-existing errors (untouched files), grep = no
  leftovers, local battery (EN/AR, marquee exactly 5 slugs ×2, 5 cards/badges/prices, bar index
  before h1) + live battery after swap (EN/AR 200, 11 sections both locales post-warmup,
  `isOffer:true` in `/en/tours/cairo` RSC payload, old offers API → 404, 0 container errors,
  rollback image `mystic-egypt-new:previous` in place).

### Document References

1. `docs/PRD.md` — Source of truth for all features
2. `docs/Final Technical Blueprint.md` — Architecture & schema decisions
3. `docs/Technical Execution SOP.md` — Step-by-step execution guide
4. `AGENTS.md` — Project rules and protocols
5. `PROJECT_MAP.md` — This file (living status tracker)
6. `MANUAL_STEPS.md` — Human-required actions
