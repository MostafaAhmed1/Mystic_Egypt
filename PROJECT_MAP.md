# PROJECT_MAP.md - Mystic Egypt Tourism Platform

## Status: MILESTONE 7 IN PROGRESS
**Last Updated:** August 31, 2026

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
| 7 | i18n, SEO & Polish | 🔄 IN PROGRESS | Steps 1-3 complete, Phase 1 complete (locale prefix routing), 6 phases remaining |
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
- **Placeholder tour images:** Generated locally with `sharp` at
  `public/uploads/tours/{nile-cruise-cairo,white-desert}.jpg` (small JPGs). Replaced by
  admin-uploaded real photos in M6.

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
- `src/features/tour/` now implemented (M3). `booking` (M4), `invoice` (M5), `dashboard` (M5),
  `wishlist` (M5) are all implemented.
- `src/features/auth/` now holds the auth feature (actions, emails, components).
- `src/shared/hooks/` empty (shared hooks added when needed).
- `public/locales/` now has 3 locale files (en, ar, de) with comprehensive translations (M7).
- `public/uploads/tours/*.jpg` referenced by seed DO NOT exist yet (placeholder image paths;
  real tour images uploaded via admin in M6).
- `src/core/lib/i18n.ts` created (M7). `resend`, `auth`, `otp`, `session` created (M2).
- `src/app/` has `(auth)` group complete (M2); `(public)` home is scaffold; `(dashboard)` &
  `(admin)` are minimal placeholders (filled in M5/M6).
- API route handlers: `api/auth/**` (M2), `api/tours/**` (M3), `api/bookings/**` + `api/webhooks/stripe` (M4), `api/wishlist` (M5), `api/invoices/**` pending. Admin routes in M6.

### Disconnected Pieces / Pending (Recorded during M3)
- **`/tours/[slug]/book` route is a dangling pointer** — the "Book now" buttons link to
  `/tours/[slug]/book`, which does NOT exist yet. This is the Milestone 4 entry point. Next.js
  link-prefetch logs a 404 until M4 lands.
- **`public/uploads/tours/*.jpg` are local placeholder JPGs** (generated with sharp). Real tour
  images to be uploaded by admin in M6.
- **Reviews/Testimonials deferred** — homepage/listing don't render testimonials because no
  `Review`/`Testimonial` model exists. Will surface with PRD §4.1 reviews (M7 or a dedicated model).
- **Homepage search** supports destination keyword + max budget only. A tour-date field comes with
  the Booking flow (M4).
- **CustomizationRequest records** are created but there is no admin UI yet to review/respond to
  them — that belongs to the Admin panel (M6).
- **Migrations baseline debt** — project uses `prisma db push`; `prisma/migrations` is empty.
  A baseline migration should be introduced (M8 / before first production deploy).

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

### Document References
1. `docs/PRD.md` — Source of truth for all features
2. `docs/Final Technical Blueprint.md` — Architecture & schema decisions
3. `docs/Technical Execution SOP.md` — Step-by-step execution guide
4. `AGENTS.md` — Project rules and protocols
5. `PROJECT_MAP.md` — This file (living status tracker)
6. `MANUAL_STEPS.md` — Human-required actions
