# QA Testing Plan — Mystic Egypt Platform

## Overview
Comprehensive browser-based testing of all functions and UI/UX before M7 (Deployment).
Each phase is executed sequentially, documented with results, errors, and fixes.

**Start Date:** August 30, 2026
**Method:** Real browser testing via Chrome DevTools (browse tool)

---

## Phase 1: Public Pages & Navigation
**Status:** 🔄 PENDING
**Scope:** Homepage, tour listing, tour detail, navigation, i18n

| # | Test Case | Result | Notes |
|---|-----------|--------|-------|
| 1.1 | Homepage loads (hero, featured tours, footer) | ⬜ | |
| 1.2 | Tours listing page loads with tour cards | ⬜ | |
| 1.3 | Tour search/filter functionality | ⬜ | |
| 1.4 | Tour detail page (itinerary, map, pricing) | ⬜ | |
| 1.5 | Public header navigation links | ⬜ | |
| 1.6 | Mobile menu toggle | ⬜ | |
| 1.7 | Footer links (About, Privacy, Terms) | ⬜ | |
| 1.8 | i18n language switching (AR/EN/DE) | ⬜ | |
| 1.9 | "Book Now" CTA → redirects to booking | ⬜ | |
| 1.10 | "Customize" CTA → redirect to login | ⬜ | |

---

## Phase 2: Authentication Flow
**Status:** ⬜ PENDING
**Scope:** Login, register, email verification, password reset

| # | Test Case | Result | Notes |
|---|-----------|--------|-------|
| 2.1 | Login form loads with email/password fields | ⬜ | |
| 2.2 | Login with valid credentials → dashboard redirect | ⬜ | |
| 2.3 | Login with invalid credentials → error message | ⬜ | |
| 2.4 | Register form loads with all fields | ⬜ | |
| 2.5 | Register with valid data → success + verification email | ⬜ | |
| 2.6 | Register with existing email → error | ⬜ | |
| 2.7 | Password reset request form | ⬜ | |
| 2.8 | Password reset flow (request → token → new password) | ⬜ | |
| 2.9 | Email verification flow | ⬜ | |
| 2.10 | Auth guard: unauthenticated → /login redirect | ⬜ | |
| 2.11 | Auth guard: client → /admin redirect | ⬜ | |

---

## Phase 3: Client Dashboard
**Status:** ⬜ PENDING
**Scope:** Dashboard, bookings, invoices, profile, wishlist

| # | Test Case | Result | Notes |
|---|-----------|--------|-------|
| 3.1 | Dashboard overview loads with stats | ⬜ | |
| 3.2 | Bookings list with status filters | ⬜ | |
| 3.3 | Booking detail page | ⬜ | |
| 3.4 | Invoice list loads | ⬜ | |
| 3.5 | Invoice PDF download | ⬜ | |
| 3.6 | Profile page loads with user data | ⬜ | |
| 3.7 | Profile update (name, phone) | ⬜ | |
| 3.8 | Wishlist page loads | ⬜ | |
| 3.9 | Add/remove tour from wishlist | ⬜ | |
| 3.10 | Sidebar navigation between sections | ⬜ | |

---

## Phase 4: Tour Booking Flow
**Status:** ⬜ PENDING
**Scope:** Complete booking process from tour selection to payment

| # | Test Case | Result | Notes |
|---|-----------|--------|-------|
| 4.1 | "Book Now" → booking form loads | ⬜ | |
| 4.2 | Date picker shows available dates | ⬜ | |
| 4.3 | People count selector | ⬜ | |
| 4.4 | Add-ons selection & price update | ⬜ | |
| 4.5 | Stripe checkout (test mode) | ⬜ | |
| 4.6 | Bank transfer checkout | ⬜ | |
| 4.7 | Receipt upload (bank transfer) | ⬜ | |
| 4.8 | Booking confirmation page | ⬜ | |
| 4.9 | Price calculation accuracy | ⬜ | |
| 4.10 | Booking appears in dashboard | ⬜ | |

---

## Phase 5: Admin Panel — Tours & Orders
**Status:** ⬜ PENDING
**Scope:** Admin dashboard, tour management, order management

| # | Test Case | Result | Notes |
|---|-----------|--------|-------|
| 5.1 | Admin login → /admin redirect | ⬜ | |
| 5.2 | Dashboard analytics (stats, charts) | ⬜ | |
| 5.3 | Tour list with search/filter | ⬜ | |
| 5.4 | Tour create wizard (4 steps) | ⬜ | |
| 5.5 | Tour edit wizard | ⬜ | |
| 5.6 | Tour status toggle | ⬜ | |
| 5.7 | Order list (table view) | ⬜ | |
| 5.8 | Order list (kanban view) | ⬜ | |
| 5.9 | Order quick actions (approve/reject/complete) | ⬜ | |
| 5.10 | Order detail page | ⬜ | |
| 5.11 | Order filters (status, date, payment) | ⬜ | |

---

## Phase 6: Admin Panel — CMS, 2FA, Admins
**Status:** ⬜ PENDING
**Scope:** CMS management, 2FA setup, admin user management

| # | Test Case | Result | Notes |
|---|-----------|--------|-------|
| 6.1 | CMS page list loads | ⬜ | |
| 6.2 | CMS create page with Tiptap editor | ⬜ | |
| 6.3 | CMS edit page loads content | ⬜ | |
| 6.4 | CMS publish/unpublish toggle | ⬜ | |
| 6.5 | CMS delete with confirmation | ⬜ | |
| 6.6 | 2FA setup (QR code display) | ⬜ | |
| 6.7 | 2FA enable (verify code) | ⬜ | |
| 6.8 | 2FA disable | ⬜ | |
| 6.9 | Admin list page | ⬜ | |
| 6.10 | Create admin form | ⬜ | |
| 6.11 | Delete admin with confirmation | ⬜ | |
| 6.12 | Settings page (account info + 2FA) | ⬜ | |

---

## Phase 7: Edge Cases, Error Handling & Performance
**Status:** ⬜ PENDING
**Scope:** Error states, validation, responsiveness, performance

| # | Test Case | Result | Notes |
|---|-----------|--------|-------|
| 7.1 | 404 page for invalid URLs | ⬜ | |
| 7.2 | Form validation (empty fields) | ⬜ | |
| 7.3 | API error responses (500, 401, 403) | ⬜ | |
| 7.4 | Loading states & skeletons | ⬜ | |
| 7.5 | Mobile responsive (375px) | ⬜ | |
| 7.6 | Tablet responsive (768px) | ⬜ | |
| 7.7 | Lighthouse performance audit | ⬜ | |
| 7.8 | Lighthouse accessibility audit | ⬜ | |

---

## Summary

| Phase | Status | Tests | Passed | Failed | Fixed |
|-------|--------|-------|--------|--------|-------|
| 1. Public Pages | 🔄 PENDING | 10 | 0 | 0 | 0 |
| 2. Authentication | ⬜ PENDING | 11 | 0 | 0 | 0 |
| 3. Client Dashboard | ⬜ PENDING | 10 | 0 | 0 | 0 |
| 4. Booking Flow | ⬜ PENDING | 10 | 0 | 0 | 0 |
| 5. Admin Tours & Orders | ⬜ PENDING | 11 | 0 | 0 | 0 |
| 6. Admin CMS/2FA/Admins | ⬜ PENDING | 12 | 0 | 0 | 0 |
| 7. Edge Cases & Performance | ⬜ PENDING | 8 | 0 | 0 | 0 |
| **TOTAL** | | **72** | **0** | **0** | **0** |

---

## Fix Log

| Date | Phase | Issue | Fix | Status |
|------|-------|-------|-----|--------|
| | | | | |
