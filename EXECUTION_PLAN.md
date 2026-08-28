# EXECUTION_PLAN.md - Mystic Egypt Tourism Platform

## Master Plan (Phased Execution)
**Created:** August 28, 2026
**Status:** AWAITING APPROVAL
**Total Phases:** 8 Milestones

---

## Overview

This plan breaks the entire project into **8 independent milestones**, each with verifiable goals. No phase begins until the previous one is approved and verified. Each milestone is self-contained and produces a working, testable artifact.

---

## MILESTONE 1: Project Initialization & Core Foundation
**Goal:** Empty repo → running Next.js app with Prisma, Auth, and folder structure.
**Estimated Effort:** 1-2 sessions
**Verifiable Output:** `npm run dev` starts, Prisma connects to DB, login page renders.

### Deliverables:
1. Initialize Next.js project with TypeScript, Tailwind, ESLint, App Router, src directory
2. Install ALL dependencies (verified versions from AGENTS.md §5)
3. Initialize shadcn/ui and install core components: button, input, card, table, dialog, form, toast, calendar, select, tabs
4. Create complete folder structure: `src/core/`, `src/features/`, `src/shared/`, `public/locales/`, `public/uploads/`
5. Configure `tsconfig.json` path aliases (`@/*`, `@/core/*`, `@/features/*`, `@/shared/*`)
6. Configure `next.config.js` (image optimization for WebP/AVIF, security headers, NO CDN)
7. Create `.env.example` and `.env` with all required variables
8. Set up Prisma with the full schema from the Technical Blueprint
9. Create `src/core/lib/prisma.ts` (Singleton Pattern)
10. Create `src/core/api/endpoints.ts` (centralized API endpoints)
11. Initialize git repository

### Acceptance Criteria:
- [ ] `npm run dev` runs without errors
- [ ] `npx prisma db push` succeeds (MariaDB connection)
- [ ] All path aliases resolve correctly
- [ ] shadcn/ui components render properly
- [ ] Folder structure matches Technical Blueprint exactly

---

## MILESTONE 2: Authentication System (Auth Feature)
**Goal:** Full auth system with OTP login, session management, and role-based access.
**Estimated Effort:** 2-3 sessions
**Verifiable Output:** User can register, login via OTP, see session, admin 2FA flow works.

### Deliverables:
1. Configure NextAuth.js with Prisma adapter and Resend OTP provider
2. Create `src/features/auth/` module:
   - `lib/auth.ts` — NextAuth configuration with OTP
   - `components/LoginForm.tsx` — Email input + OTP request
   - `components/OTPVerify.tsx` — 6-digit OTP verification
   - `components/RegisterForm.tsx` — Name, email, phone registration
3. Create `src/app/(auth)/login/page.tsx`
4. Create `src/app/(auth)/register/page.tsx`
5. Create `src/core/lib/providers.tsx` — SessionProvider + QueryClientProvider wrapper
6. Update `src/app/layout.tsx` to use Providers
7. Create auth middleware for protected routes:
   - `(dashboard)` — requires session
   - `(admin)` — requires session + `is_2fa_verified === true`
8. Create `src/features/auth/actions/` — server actions for register, request OTP, verify OTP
9. Create `src/core/constants/roles.ts` — Role enum constants

### Acceptance Criteria:
- [ ] User can register with name, email, phone
- [ ] User receives OTP via email (Resend)
- [ ] OTP verification creates session
- [ ] Unauthenticated users redirected from `/dashboard` to `/login`
- [ ] Non-admin users blocked from `/admin` routes
- [ ] Session persists across page refreshes

---

## MILESTONE 3: Tour Feature (Public Pages - SSG)
**Goal:** Tour listing and detail pages with itinerary, images, map, and reviews section.
**Estimated Effort:** 2-3 sessions
**Verifiable Output:** Homepage shows featured tours, tour detail page renders with map and accordion itinerary.

### Deliverables:
1. Create `src/features/tour/` module:
   - `lib/tour.service.ts` — Prisma queries for tours (list, by slug, featured)
   - `components/TourCard.tsx` — Card for tour listing
   - `components/TourGallery.tsx` — Image gallery with Next.js Image
   - `components/TourItinerary.tsx` — Day-by-day accordion
   - `components/TourMap.tsx` — Leaflet map (dynamic import, no SSR)
   - `components/TourInclusions.tsx` — Inclusions/Exclusions lists
   - `components/TourReviews.tsx` — Reviews section
2. Create `src/app/(public)/page.tsx` — Homepage with:
   - Search bar (destination, date, budget)
   - Featured Tours section
   - "Why Us?" section (UK Registered + Local Experts)
   - Testimonials section
   - Trust Badges section
3. Create `src/app/(public)/tours/page.tsx` — Tour listing (SSG)
4. Create `src/app/(public)/tours/[slug]/page.tsx` — Tour detail (SSG)
5. Create `src/features/tour/actions/` — server actions for tour queries
6. Create `src/features/tour/components/CustomizationRequestForm.tsx` — "Request Customization" modal
7. Create `src/core/api/endpoints.ts` additions for tour endpoints
8. Seed sample tour data via `prisma/seed.ts`

### Acceptance Criteria:
- [ ] Homepage loads with `force-static` (SSG)
- [ ] Tour listing page shows all tours with cards
- [ ] Tour detail page shows gallery, itinerary accordion, map, inclusions
- [ ] Leaflet map renders without SSR errors (dynamic import)
- [ ] "Book Now" and "Request Customization" buttons work
- [ ] Page load time < 2 seconds on public pages
- [ ] Image optimization working (WebP/AVIF in Network tab)

---

## MILESTONE 4: Booking & Payment Feature
**Goal:** Complete checkout flow with Stripe payment and bank transfer options.
**Estimated Effort:** 3-4 sessions
**Verifiable Output:** User can complete booking flow, pay via Stripe (test mode), or upload bank receipt.

### Deliverables:
1. Create `src/features/booking/` module:
   - `lib/booking.service.ts` — Prisma queries for bookings
   - `lib/cancellation.ts` — Pure function for cancellation policy (30/15/14 day rules)
   - `components/BookingWizard.tsx` — Multi-step checkout form
   - `components/DatePicker.tsx` — Tour date selection
   - `components/AddonsSelector.tsx` — Add-ons with quantity
   - `components/PaymentStep.tsx` — Stripe / Bank Transfer choice
   - `components/ReceiptUpload.tsx` — File upload for bank transfer
   - `components/TermsCheckbox.tsx` — Mandatory T&C + cancellation policy checkbox
2. Create `src/features/booking/store.ts` — Zustand store for cart/booking state
3. Create `src/app/(public)/booking/[tourSlug]/page.tsx` — Checkout page
4. Create Stripe integration:
   - `src/features/booking/lib/stripe.ts` — Stripe client setup
   - `src/features/booking/components/StripePayment.tsx` — Stripe Elements form
   - `src/app/api/webhooks/stripe/route.ts` — Stripe webhook handler
5. Create bank transfer flow:
   - `src/features/booking/actions/uploadReceipt.ts` — Server action for file upload
   - File validation: MIME type (jpeg, png, pdf), max 5MB, rename with crypto.randomUUID()
6. Create `src/app/api/bookings/route.ts` — Booking creation endpoint
7. Create `src/app/api/bookings/[id]/receipt/route.ts` — Receipt upload endpoint
8. Create booking status management:
   - `PENDING_PAYMENT` → Stripe success or receipt uploaded
   - `PENDING_RECEIPT_REVIEW` → Bank transfer selected
   - `CONFIRMED` → Admin approves (Milestone 6) or Stripe webhook

### Acceptance Criteria:
- [ ] Checkout wizard flows: Tour → Date → People → Add-ons → Auth → Payment → Confirm
- [ ] Stripe Elements renders and processes test payment
- [ ] Bank transfer option shows receipt upload (validated: type, size, renamed)
- [ ] Booking created in DB with correct status
- [ ] Stripe webhook updates booking to CONFIRMED
- [ ] Mandatory terms checkbox enforced before submission
- [ ] Cancellation policy function returns correct percentages

---

## MILESTONE 5: Client Dashboard & Invoice
**Goal:** Authenticated user dashboard with bookings, wishlist, profile, and PDF invoice.
**Estimated Effort:** 2-3 sessions
**Verifiable Output:** User sees their bookings, can download PDF invoice, manage wishlist and profile.

### Deliverables:
1. Create `src/features/invoice/` module:
   - `components/InvoicePDF.tsx` — @react-pdf/renderer component (client-side generation)
   - `lib/invoice.service.ts` — Invoice data from Prisma
2. Create `src/app/(dashboard)/layout.tsx` — Dashboard layout with sidebar nav
3. Create `src/app/(dashboard)/bookings/page.tsx` — Bookings list with status badges
4. Create `src/app/(dashboard)/bookings/[id]/page.tsx` — Booking detail
5. Create `src/app/(dashboard)/invoices/page.tsx` — Invoices list with PDF download
6. Create `src/app/(dashboard)/wishlist/page.tsx` — Saved tours
7. Create `src/app/(dashboard)/profile/page.tsx` — Edit name, email, password, notifications
8. Create `src/features/booking/components/WishlistButton.tsx` — Toggle wishlist
9. Create `src/features/booking/actions/wishlist.ts` — Add/remove wishlist server actions
10. Create `src/features/booking/components/BookingStatusBadge.tsx` — Color-coded status

### Acceptance Criteria:
- [ ] Dashboard only accessible when logged in
- [ ] Bookings page shows all user bookings with correct status
- [ ] Invoice PDF generates in browser and downloads
- [ ] Wishlist shows saved tours with remove option
- [ ] Profile form updates user data
- [ ] "Delete My Account" button present (GDPR requirement)

---

## MILESTONE 6: Admin Panel
**Goal:** Full admin dashboard with tour management, booking management (3 views), CMS, and analytics.
**Estimated Effort:** 4-5 sessions
**Verifiable Output:** Admin can manage tours, process bookings via Kanban, edit CMS content, view reports.

### Deliverables:
1. Create `src/app/(admin)/layout.tsx` — Admin layout with 2FA check middleware
2. Create `src/app/(admin)/page.tsx` — Admin dashboard with analytics:
   - Sales/revenue charts (daily, weekly, monthly)
   - Booking counts by status
   - Top selling tours
   - Tax reports
   - Customer source by country
3. Create `src/features/tour/admin/` — Tour management:
   - `components/TourWizard.tsx` — Multi-step tour creation form
   - `components/TourList.tsx` — Tour listing with actions
   - `components/TourDateManager.tsx` — Open/close booking per date
   - `actions/tour.actions.ts` — CRUD server actions
4. Create `src/features/booking/admin/` — Booking management:
   - `components/BookingTable.tsx` — Table view with advanced filters
   - `components/BookingCalendar.tsx` — Calendar view
   - `components/BookingKanban.tsx` — Kanban board (drag & drop)
   - `components/BookingActions.tsx` — Quick actions for bank transfer bookings
   - `actions/booking.actions.ts` — Status update server actions
5. Create `src/features/booking/admin/components/ReceiptReviewModal.tsx` — Approve/reject receipts
6. Create CMS:
   - `src/features/cms/components/RichTextEditor.tsx` — Rich text editor
   - `src/app/(admin)/cms/page.tsx` — CMS page management
   - `src/app/(admin)/blog/page.tsx` — Blog management
7. Create `src/features/admin/components/AdminSetup.tsx` — Add new admins
8. Create admin middleware: `is_2fa_verified === true` enforced

### Acceptance Criteria:
- [ ] Admin routes blocked without 2FA verification
- [ ] Tour wizard allows creating tours with itinerary, images, pricing
- [ ] Booking Kanban allows drag-and-drop between status columns
- [ ] Bank transfer bookings show approve/reject/request-receipt actions
- [ ] CMS editor saves content correctly
- [ ] Analytics dashboard shows real data from database
- [ ] Admin can add new admin users

---

## MILESTONE 7: i18n, SEO & Polish
**Goal:** Multi-language support, SEO optimization, and final polish.
**Estimated Effort:** 2-3 sessions
**Verifiable Output:** Site works in EN/AR/DE, SEO audit passes 90+, all pages polished.

### Deliverables:
1. Configure `src/core/lib/i18n.ts` — i18next setup with language detection
2. Create `public/locales/en.json`, `public/locales/ar.json`, `public/locales/de.json`
3. Add language switcher component in header
4. Implement RTL support for Arabic
5. Create SEO components:
   - `src/shared/components/SEO.tsx` — JSON-LD schema markup (Tour Schema)
   - Dynamic `sitemap.xml` generation
   - `robots.txt` configuration
6. Add Schema Markup to tour pages (price, rating, duration)
7. Clean URLs for all pages
8. Add Cookie Consent Banner (GDPR)
9. Add Privacy Policy and Terms pages
10. Final responsive design polish
11. Accessibility audit and fixes

### Acceptance Criteria:
- [ ] Language switcher toggles between EN/AR/DE
- [ ] Arabic pages render RTL correctly
- [ ] Lighthouse scores 90+ on Performance, Best Practices, Accessibility
- [ ] JSON-LD schema validates in Google Rich Results Test
- [ ] sitemap.xml includes all public pages
- [ ] Cookie consent banner appears on first visit
- [ ] Privacy Policy and Terms pages are accessible

---

## MILESTONE 8: Testing, QA & Deployment
**Goal:** Full testing pass, production deployment, and go-live verification.
**Estimated Effort:** 2-3 sessions
**Verifiable Output:** Site live at mysticegypt.net with all features working.

### Deliverables:
1. **Unit Testing:**
   - Test cancellation policy function (all tiers + edge cases)
   - Test file upload validation (MIME types, size limits)
   - Test currency conversion logic
2. **Integration Testing:**
   - Full booking flow: Tour → Add-ons → OTP Login → Bank Transfer → Receipt Upload → Admin Approve → Confirmed
   - Full booking flow: Tour → Stripe Payment → Confirmed
   - Admin flow: Login → 2FA → Create Tour → Manage Bookings → CMS Edit
3. **Performance Testing:**
   - Lighthouse audit on homepage and tour page (target 90+)
   - Image optimization verification (WebP/AVIF)
   - Page load time < 2 seconds
4. **Security Testing:**
   - Verify `public/uploads/` blocks PHP/script execution
   - Verify no `any` types in codebase
   - Verify no hardcoded API keys
   - Verify Stripe test mode works end-to-end
5. **Deployment:**
   - Server setup per MANUAL_STEPS.md
   - Git push to production server
   - PM2 process running
   - SSL certificate active
   - DNS verified
6. **Post-Deploy Verification:**
   - Site loads via HTTPS
   - Email delivery works (Resend)
   - Images served as WebP/AVIF
   - All user flows functional

### Acceptance Criteria:
- [ ] All unit tests pass
- [ ] Full integration test flow completes successfully
- [ ] Lighthouse 90+ on public pages
- [ ] Site accessible at https://mysticegypt.net
- [ ] SSL certificate valid and auto-renewing
- [ ] No console errors in browser
- [ ] Stripe payments process correctly in live mode
- [ ] Email delivery confirmed

---

## Dependencies & Prerequisites

| Milestone | Depends On | Human Action Required |
|-----------|-----------|----------------------|
| 1 | None | — |
| 2 | Milestone 1 | Resend API key, NextAuth secret |
| 3 | Milestone 1 | — |
| 4 | Milestone 2, 3 | Stripe API keys |
| 5 | Milestone 2, 4 | — |
| 6 | Milestone 2 | — |
| 7 | Milestone 3 | Translation content |
| 8 | All previous | Server access, DNS config |

---

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Stripe integration complexity | High | Use Stripe test mode from Milestone 4 start |
| Leaflet SSR issues | Medium | Always use dynamic import with `ssr: false` |
| File upload security | High | Strict MIME validation, size limits, renamed filenames |
| i18n RTL layout issues | Medium | Use CSS logical properties from the start |
| No staging environment | High | Test everything in test modes before production |
| MariaDB compatibility | Low | Prisma MySQL connector is MariaDB compatible |
