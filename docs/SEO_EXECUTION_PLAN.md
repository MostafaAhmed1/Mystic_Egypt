# SEO EXECUTION PLAN — Mystic Egypt

> Derived from `docs/Seo_plan.md` (the SEO Engineering Agent brief).
> Execution methodology: **(1) Implement → (2) Verify → (3) Update this file** — one step at a time, waiting for explicit GO between steps.
> **Safeguard rule:** No changes to routing, redirects, database schema, or canonical/sitemap structure without a dedicated risk note + approval. Metadata-only changes are low-risk and executed autonomously.

**Status:** IN PROGRESS — Steps 1–7 COMPLETE, awaiting GO for Step 8
**Started:** September 2026

---

## Priority System (from Seo_plan.md §Priority System)

| Level | Meaning |
|-------|---------|
| P0 | Could seriously damage indexing/crawling/rendering/tracking/revenue |
| P1 | Strong potential impact on rankings/traffic/conversions |
| P2 | Meaningful optimization |
| P3 | Minor improvements |

---

## Baseline (from Step 0/1 audit — no fabricated data)

| Area | Current state |
|------|---------------|
| Framework | Next.js 16.3.3 App Router, Turbopack, `src/proxy.ts` (locale redirects + auth guard) |
| Locales | `en` (default, always prefixed), `ar` (RTL), `de` |
| Sitemap | `src/app/sitemap.ts` — dynamic, includes: `/{locale}` + `/{locale}/tours` + `/{locale}/tours/{slug}` × N. **Missing:** CMS pages (`/[slug]`), contact. `BASE_URL` hardcoded (not via env) |
| Robots | `src/app/robots.ts` — Disallow `/api/`, `/*/admin`, `/*/dashboard`. Sitemap reference present |
| Canonical/hreflang | Central helper `src/core/utils/seo.ts` → `buildAlternates()` (canonical + hreflang + x-default). Used on: home, tours list, tour detail, CMS page. **Missing on:** contact |
| Metadata | Dynamic on: home, tours list, tour detail (from DB), CMS page (title only, **no description/OG**). Static on: contact, auth, dashboard, admin. **No `og:image` anywhere on the site** |
| Structured data | Only 1 JSON-LD (`TouristTrip`) — injected **client-side** in `TourContent.tsx`. No Organization/WebSite/BreadcrumbList. TourCard shows **fabricated static rating `4.9`** |
| Internal search | `/tours?q=&maxPrice=` server-filtered. **Indexable today** — no `noindex` on query results. Canonical pinned to `/tours` (correct) |
| Protected routes | Auth / Dashboard / Admin / **Book (checkout)** — **no `noindex` meta**. Google can index them |
| GA4 | Consent-gated, but `NEXT_PUBLIC_GA_ID` placeholder — NOT configured (missing user key) |
| 3rd party | gtag only. No Meta Pixel. No chat widget identified |
| Performance | `TourCard` uses `priority` on every card image (LCP risk). Hero image heavy. `force-dynamic` on sitemap + tour detail |

Indexable routes today (baseline count): `1 (home) + 3 (locale) + 1 (tours index) × 3 + N tours × 3 + CMS pages × 3 + contact × 3` — enumerated dynamically, not counted.

---

## Target Market & Language Coverage (decision gate)

Business target markets per owner: **Germany, United Kingdom, Hungary, Bulgaria** (languages DE / EN / HU / BG).

| Market | Language | Locale in app | hreflang/canonical/sitemap | Status |
|--------|----------|---------------|---------------------------|--------|
| Germany 🇩🇪 | German | `de` ✅ | emitted automatically | ✅ Covered |
| UK 🇬🇧 | English | `en` ✅ | emitted automatically (+ `x-default`) | ✅ Covered |
| Hungary 🇭🇺 | Hungarian | `hu` ❌ | NOT emitted | ❌ Gap |
| Bulgaria 🇧🇬 | Bulgarian | `bg` ❌ | NOT emitted | ❌ Gap |

**Architectural fact:** every SEO signal — `buildAlternates()` (canonical + hreflang + x-default), sitemap URLs, og:locale — is *derived from the `locales` array* in `src/core/i18n-config.ts`. The SEO plan is therefore **locale-driven and automatically correct for any language that has real pages**. It needs zero code changes to support HU/BG; what's missing is the content.

**Why HU/BG are a decision, not a quick SEO win** (per `Seo_plan.md` Step 19):
- "Do not use automatic machine translation as a substitute for quality localized content."
- "Do not introduce hreflang without valid alternate pages."
→ Adding `hu`/`bg` requires *human-quality translations* of the whole UI (3 `common.json` files, tour content, emails, invoice PDF). Shipping machine-translated or partial pages would create thin/duplicate localized pages → SEO penalization. This is a **content/i18n feature**, so it needs PRD approval + a translation budget — it cannot be silently folded into an SEO code pass.

**Plan impact:**
- Canonical / hreflang / og:locale work (Steps 2–3) stays locale-driven → fully forward-compatible when HU/BG land.
- New **Decision Gate D1** added below: enable `hu` + `bg` locales with human translations → registered as a feature milestone, not an SEO task.
- GEO/SERP visibility for HU/BG in the interim: English pages still rank for EN-queries from HU/BG users; that is the only honest interim position without translated pages.

**Decision Gate D1 — Add HU/BG locales (DEFERRED — needs owner decision)**
- Requires: PRD approval, human translation content for `public/locales/{hu,bg}`, locale registration in `i18n-config`, `proxy.ts` (locale detection), root layout `generateStaticParams`.
- Then automatically: hreflang × 5, sitemap × 5 languages, og:locale per BCP-47.
- Not executed now. Owner sign-off required (out of SEO execution scope).

---

## Steps (executed one at a time, awaiting GO between)

| Step | Scope | Priority | Risk | Status |
|------|-------|----------|------|--------|
| **1** | **Indexation Safety** — add `noindex,follow` to auth, dashboard, admin, checkout(book), and search-result URLs | P0 | Low (metadata only) | ✅ COMPLETE |
| **2** | **Canonical/hreflang/OG completeness** — Contact canonical+hreflang; tour OG image + twitter:card; locale-driven `og:locale` | P0 | Low (metadata only) | ✅ COMPLETE |
| **3** | **Metadata engine** — centralize `buildPageMetadata()` in `seo.ts`; apply to all public pages; add `og:image` + twitter | P1 | Low-Med | ✅ COMPLETE |
| **4** | **Structured data (server-side)** — move TouristTrip to server page; add BreadcrumbList + Organization + WebSite; remove fabricated `4.9` rating | P1 | Med | ✅ COMPLETE |
| **5** | **Sitemap + robots refinement** — env base URL, add CMS pages + contact; validate output; keep alternates | P1 | ⚠️ HIGH (sitemap) — plan first | ✅ COMPLETE |
| **6** | **Internal linking / related tours** — related-content component on tour pages; breadcrumb consistency | P2 | Med | ✅ COMPLETE |
| **7** | **Image SEO + performance** — LCP image policy (eager/high vs lazy), deprecated `priority` API migration, alt audit, OG image alt | P2 | Med | ✅ COMPLETE |
| **8** | **Internal search SEO guard** — keep results `noindex`, document valuable-query → landing page opportunities (needs GSC data) | P2 | Low | ⏳ Pending (1st half done; 2nd GSC-blocked) |
| **9** | **E-E-A-T & content/trust** — business info, policies links, genuine trust signals (no fabrication) | P2 | Med | ✅ COMPLETE |
| **10** | **Documentation + monitoring** — update PROJECT_MAP / MANUAL_STEPS; SEO monitoring checklist + alerts | P3 | Low | ⏳ Pending |
| **11** | **Performance optimization** — framer-motion dynamic import, GA4 afterInteractive, cache headers, loading states, Arabic font | P1 | Med | ✅ COMPLETE |

Deferred (needs business decision / external data):
- **Phase 2 — HU/BG locales (Decision Gate D1)**: formalized as a FUTURE MILESTONE below with numbered steps — no machine translation; needs PRD approval + human translations → content feature milestone, not an SEO task.
- **Destination architecture** (Step 10 of brief): no `Destination` model in DB — requires entity model decision (out of scope without approval).
- **Programmatic SEO** (Step 28): requires GSC demand evidence.
- **GA4 / Ads / Meta integration** (Steps 22–25): requires measurement IDs from owner.
- **hreflang validation against GSC** (Step 19): GSC ownership **verified via DNS** (MANUAL_STEPS §6) — the report check itself still waits on the user pulling up the International Targeting report.

---

## Step 1 — Indexation Safety ✅ COMPLETE

Goal: no protected/utility page is indexable by Google; indexable pages are untouched.

Changes made:
1. ✅ `src/app/[locale]/(auth)/layout.tsx` → added `export const metadata = { robots: { index: false, follow: true } }` (applies to all 6 auth pages — title from leaf pages merges with layout robots)
2. ✅ `src/app/[locale]/(dashboard)/layout.tsx` → added `robots: { index: false, follow: true }` to layout metadata
3. ✅ `src/app/[locale]/(admin)/layout.tsx` → added `robots: { index: false, follow: true }` to layout metadata
4. ✅ `src/app/[locale]/(public)/tours/[slug]/book/page.tsx` → added `robots: { index: false, follow: true }` (checkout flow)
5. ✅ `src/app/[locale]/(public)/tours/page.tsx` → `generateMetadata` now reads `searchParams`; when `q` or `maxPrice` present → `robots: { index: false, follow: true }`; canonical stays `/tours`

Verification:
- ✅ `npx tsc --noEmit` passes (zero errors)
- ✅ `(public)/layout.tsx` untouched — no robots restriction → tours, CMS pages, contact remain indexable
- ✅ Metadata shallow-merge confirmed: leaf-page `title` + layout `robots` both applied (standard Next.js behavior)

Result: ✅ done — 5 files modified, zero indexable pages harmed.

---

## Step 2 — Canonical/hreflang/OG completeness ✅ COMPLETE

Goal: every **indexable** public page gets canonical + hreflang + basic OG/twitter, with locale-correct `og:locale`. Non-indexable pages untouched.

Changes made:
1. ✅ `src/core/i18n-config.ts` → added `ogLocale: Record<Locale, string>` = `{ en: "en_US", ar: "ar_EG", de: "de_DE" }` — locale-driven, HU/BG-ready.
2. ✅ `src/core/utils/seo.ts` → added `resolveAbsoluteImageUrl()` — null-safe absolute URL resolution (handles relative `/uploads/...` AND legacy absolute legacy seed URLs).
3. ✅ `contact/page.tsx` → dynamic `generateMetadata({ params })`: canonical + hreflang + x-default via `buildAlternates("/contact")`, `og:locale`, default OG + twitter image.
4. ✅ `tours/[slug]/page.tsx` (tour detail) → `twitter:card=summary_large_image`, `og:image` = tour primary image (absolute via resolver), `og:locale` locale-driven.
5. ✅ `(public)/page.tsx` (home) → `og:locale` locale-driven + default OG image (stock hero) + twitter image.
6. ✅ `tours/page.tsx` → `og:locale` locale-driven + default OG + twitter image (search-param noindex from Step 1 preserved).
7. ✅ `[slug]/page.tsx` (CMS pages) → **fixed empty metadata bug**: added derived `description` (HTML-stripped excerpt), `og:locale`, default OG + twitter image — previously title-only.

Verification:
- ✅ `npx tsc --noEmit` passes (zero errors)
- ✅ Every indexable public route now emits canonical + hreflang + x-default: home, tours, tour detail, contact, CMS pages
- ✅ All indexable pages emit `og:locale` + OG image + twitter card
- ✅ No hardcoded `en_US` remaining; no route/DB/redirect changes

Result: ✅ done — 6 files, every indexable page now canonically+hreflang+OG complete, CMS metadata bug fixed.

---

## Phase 2 — FUTURE MILESTONE: HU/BG language expansion (Decision Gate D1)

**Status:** ⏳ NOT STARTED — blocked. Owner decision + PRD approval + translation budget required. NOT part of the Phase 1 SEO execution queue.

**Why it's gated:** per `Seo_plan.md` Step 19 — no machine translation; no hreflang without valid alternate pages. HU/BG need full human-quality translations before any locale is registered, or Google sees thin/duplicate localized pages.

**What is ALREADY automated (zero extra SEO code needed when HU/BG land):** Steps 2–3 built all SEO signals from the `locales` array, so registering `hu`/`bg` in `i18n-config.ts` automatically extends canonical/hreflang/x-default/og:locale/sitemap to 5 languages. Only product/i18n work remains.

### Planned future steps (executed as their own milestone, one at a time, awaiting approval each)

| # | Step | Deliverable | Notes |
|---|------|-------------|-------|
| **D1.1** | PRD approval + scope sign-off | Approved requirement doc, translation budget, timeline | Owner decision gate — starts this phase |
| **D1.2** | Hungarian content: `public/locales/hu/common.json` + tour content + emails + invoice | Human-translated HU strings (no machine translation) | Translate actual DB tour text, not just UI chrome |
| **D1.3** | Bulgarian content: `public/locales/bg/common.json` + tour content + emails + invoice | Human-translated BG strings (no machine translation) | Same standard as D1.2 |
| **D1.4** | Register locales: `src/core/i18n-config.ts` (`locales`, `dir`, `localeNames`, `ogLocale` + `Locale = "en" \| "ar" \| "de" \| "hu" \| "bg"`) | Locale-aware app config | All SEO signals (hreflang/sitemap/og:locale) auto-extend — verify with `tsc` |
| **D1.5** | Runtime wiring: `src/proxy.ts` locale detection for `hu`/`bg`, root layout `generateStaticParams` | Route-level i18n routing | ⚠️ HIGH-RISK — requires its own pre-plan + approval before touching `proxy.ts` |
| **D1.6** | Data + assets: seed/host translated tour content in DB, upload translated image assets, verify RTL-neutral builds | Correct localized content live | No partial/placeholder translations |
| **D1.7** | End-to-end validation | hreflang × 5 on every page, sitemap × 5 languages, GSC hreflang report clean, no thin pages | Verify in GSC + sitemap fetch; document in PROJECT_MAP |

**Exit criteria for Phase 2:** `Locales` array contains `hu` + `bg`; all public pages serve 5-language hreflang clusters; every HU/BG page has real human-translated content; GSC shows no thin/duplicate flags.

**Interim GEO/SERP position (documented, not ideal):** EN + DE pages are the only honest indexable content for HU/BG users until Phase 2; EN pages still rank for EN-only queries from those countries. No fake localized pages until then.

---

## Step 3 — Metadata engine ✅ COMPLETE

Goal: single centralized `buildPageMetadata()` so every public page emits the identical, correct metadata shape — no per-page drift.

Changes made:
1. ✅ `src/core/utils/seo.ts` → added `buildPageMetadata({ pathname, locale, title, description, ogImage?, ogImageAlt?, ogType? })` returning complete `Metadata` (title, description, canonical + hreflang via `buildAlternates`, og:site_name, og:locale, og:image, og:type, twitter card + image). Centralized `DEFAULT_OG_IMAGE` (= `/uploads/stock/hero-pyramids.jpg`).
2. ✅ `(public)/page.tsx` (home) → refactored to `buildPageMetadata` (7th file touched since Step 2 but same output — removed 30 lines of duplicated per-page OG/twitter).
3. ✅ `tours/page.tsx` → refactored to `buildPageMetadata`; search-param `robots: noindex,follow` override preserved.
4. ✅ `tours/[slug]/page.tsx` → refactored to `buildPageMetadata` with `ogType: "article"` + tour primary image + alt.
5. ✅ `contact/page.tsx` → refactored to `buildPageMetadata`.
6. ✅ `[slug]/page.tsx` (CMS) → refactored to `buildPageMetadata` (derived excerpt description preserved).

Verification (browser-rendered `<head>`, dev server):
- ✅ `npx tsc --noEmit` passes (zero errors)
- ✅ `/en` → canonical + 3 hreflang + x-default; og:title/desc/url/site_name/locale=`en_US`/image(default hero)/type=website; twitter card+desc+image
- ✅ `/en/tours` → same shape; `?q=nile` → `robots: noindex, follow` + canonical pinned to `/en/tours`
- ✅ `/en/tours/classic-nile-cruise-cairo` → og:type=article, `og:image` = tour image (`/uploads/tours/.../1.jpg` absolute), og:image:alt = title
- ✅ `/en/contact` → canonical/hreflang + og complete
- ✅ `/en/about` (CMS) → derived description + og complete, no robots (indexable)
- ✅ No hardcoded `en_US`/`BASE_URL` remains in page files; all via centralized `seo.ts`

**Observed pre-existing issue (NOT fixed — out of scope):** root layout title template `"%s | Mystic Egypt"` appends to leaf titles that already contain the brand → `/en/contact` renders `Contact Us | Mystic Egypt | Mystic Egypt`. Impact is cosmetic/SERP-title duplication, low risk. Candidate for a future title-formatting micro-step (needs approval).

Result: ✅ done — 1 core file + 5 pages refactored to the single metadata engine; verified live on all 5 public page types.

---

## Step 4 — Structured data (server-side) ✅ COMPLETE

Goal: move all structured data off the client (where crawlers can't reliably see it) and render it server-side; add Organization/WebSite/BreadcrumbList; remove fabricated data.

Changes:
1. ✅ New `src/core/utils/structured-data.ts` — pure schema builders (framework-agnostic core, no `any`): `organizationSchema()` (Organization: name/url/logo), `websiteSchema(locale)` (WebSite: name/url/inLanguage), `breadcrumbSchema(items)` (BreadcrumbList → ListItem items, mirrored to the visible nav), `touristTripSchema(input)` (TouristTrip: name/description/url/image/touristType/itinerary[TouristAttraction x days]/offers{price,priceCurrency,availability InStock}).
2. ✅ New `src/shared/components/json-ld.tsx` — server-safe `<script type="application/ld+json">` renderer escaping `<` (script-breakout guard: `JSON.stringify(data).replace(/</g, "\\u003c")`).
3. ✅ `src/app/[locale]/layout.tsx` → renders `[organizationSchema(), websiteSchema(locale)]` on every page (server-side, correct per locale).
4. ✅ `src/app/[locale]/(public)/tours/[slug]/page.tsx` → server-renders `[breadcrumbSchema(Home→Tours→Tour), touristTripSchema(tour)]`; page now destructures `{ locale, slug }` from params. TouristTrip emits `url`, absolute `image` (primary, via `resolveAbsoluteImageUrl`), full itinerary and offers — identical/richer than the old client version.
5. ✅ `src/features/tour/components/TourContent.tsx` → removed the client-side inline `tourSchema` `<script>` block (now server-side); JSX kept single-root.
6. ✅ `src/features/tour/components/TourCard.tsx` → removed fabricated static `4.9` rating badge + unused `Star` import (no real review data exists → was a false trust signal).

Verification (dev server on :3777, browser-rendered HTML):
- ✅ `npx tsc --noEmit` passes (zero errors)
- ✅ `/en/tours/classic-nile-cruise-cairo` → exactly 2 `ld+json` blocks: `[Organization, WebSite]` (layout) + `[BreadcrumbList 3 items, TouristTrip {name, description, url, image, touristType, itinerary[3 TouristAttraction], offers{USD 1499, InStock}}]`
- ✅ `/en/tours` rendered HTML → no remaining rating badge element; the 5 `4.9` source hits are SVG path coordinates (4.849…), not ratings
- ✅ Email/social schemas rejected during implementation and omitted (Reviewable not configured — Organization stays name/url/logo only)

### Title duplication fix (user-approved) — included in Step 4
- Root layout template `"%s | Mystic Egypt"` duplicated brands already present in leaf titles (e.g. `Contact Us | Mystic Egypt | Mystic Egypt`, CMS `About Mystic Egypt | Mystic Egypt`). Fixed leaf-side so the brand appears exactly once:
  1. ✅ `(public)/page.tsx` (home) → title shortened to `Luxury Tours & Authentic Egyptian Experiences` (brand-free)
  2. ✅ `contact/page.tsx` → title shortened to `Contact Us`
  3. ✅ `src/core/utils/seo.ts` → `buildPageMetadata()` gained `absoluteTitle?: boolean` → emits `{ absolute: title }` (bypasses the layout template)
  4. ✅ `[slug]/page.tsx` (CMS) → passes `absoluteTitle: /mystic egypt/i.test(page.title)` so `About Mystic Egypt` renders standalone
- **Not touched (out of scope):** auth/dashboard/admin leaf titles hardcode `| Mystic Egypt` — all `noindex` (Step 1), cosmetic only.
- Verified live: `/en` → `Luxury Tours & Authentic Egyptian Experiences | Mystic Egypt`; `/en/contact` → `Contact Us | Mystic Egypt`; `/en/about` → `About Mystic Egypt` (no duplication); `/en/tours` + tour detail → brand once.

Result: ✅ done — 2 new files + layout + tour page + 2 feature components + 2 page titles + seo.ts (1 new option) + CMS page; all structured data server-side; fabricated rating gone; title duplication resolved.

---

## Step 5 — Sitemap + robots refinement ✅ COMPLETE

Goal: remove the hardcoded base URL, close the sitemap coverage gap (contact + published CMS pages), keep hreflang alternates intact, and validate the output. Highest-risk step → safest-first decisions.

**Risk note + decisions (applied before editing):**
- **Base URL:** `NEXT_PUBLIC_BASE_URL` is **not set** in any env (`.env` has only GA/WhatsApp; `.env.example` only `DATABASE_URL`; MANUAL_STEPS confirms the `NEXT_PUBLIC_*` build-time precedence and lists no `BASE_URL`). Switched the sitemap/robots to the centralized `SITE_URL` from `seo.ts`, whose fallback is **exactly** the previously hardcoded `https://mysticegypt.net` → **zero behavioural change in production**, now env-overridable.
- **Robots — no `/book` block:** checkout pages are already `noindex,follow` (Step 1). Disallowing them in robots.txt would hide the `noindex` from Google; the correct pattern is noindex WITHOUT a robots block. Rule list left unchanged.
- **No route/redirect/structure changes:** same URL shapes, same `force-dynamic`, same per-locale alternates (no `x-default` added to the sitemap — the on-page hreflang already carries it; kept the existing set to avoid scope creep).
- **Per-locale coverage is automatic:** `alternatesFor()` derives every hreflang from the `locales` array, so HU/BG (Phase 2) extend here with zero code changes.

Changes:
1. ✅ `src/features/admin/service.ts` → added `listPublishedCmsPages()` (owner of `CmsPage`): returns `{ slug, updated_at }[]` for `published: true` only, ordered by `updated_at desc`. Public read accessor alongside `getPublishedCmsPage`.
2. ✅ `src/app/sitemap.ts` → rewritten:
   - `BASE_URL` hardcode removed → `SITE_URL` from `seo.ts`.
   - `defaultLocale` imported explicitly (no reliance on array order); all URLs now `/{locale}`-generic → HU/BG-ready.
   - Added `alternatesFor(suffix)` helper (hreflang × all locales) used by every entry — removes duplication.
   - New entries: **`/{locale}/contact`** (0.6, monthly) and **published CMS pages `/{locale}/{slug}`** (0.5, monthly, `lastModified` = real `updated_at`).
   - `listPublishedCmsPages()` added inside the existing `try/catch` → sitemap still renders the static entries when the DB is unavailable during Docker build.
3. ✅ `src/app/robots.ts` → sitemap reference now `${SITE_URL}/sitemap.xml` (was hardcoded). Rule list untouched.

Verification (dev server on :3777):
- ✅ `npx tsc --noEmit` passes (zero errors)
- ✅ `/robots.txt` → 200, rules unchanged, `Sitemap: https://mysticegypt.net/sitemap.xml`
- ✅ `/sitemap.xml` → 200, **24 `<url>` entries**: home + tours index + contact + 18 tours + 3 published CMS pages (`about`, `terms`, `privacy`)
- ✅ XML well-formed (parsed with `XmlDocument`), 24 `<loc>`, **0 invalid locs**, 72 `hreflang` links (24 × 3 locales)
- ✅ CMS `lastmod` uses real `updated_at` (e.g. `2026-08-30T08:12:17.664Z`); contact/CMS carry full en/ar/de alternates
- ✅ No regression: `/en`, `/en/tours`, `/en/about`, `/en/contact`, `/en/privacy`, `/en/tours/classic-nile-cruise-cairo` all 200

Result: ✅ done — 2 files modified + 1 service function added; base URL centralized; sitemap coverage gap closed (contact + published CMS); robots rules preserved; output structurally validated.

---

## Step 6 — Internal linking / related tours ✅ COMPLETE

Goal: give every tour page outbound internal links to other relevant tours (crawl-depth + topical clustering + session depth), and render a correctly-localized breadcrumb in the **server** HTML (the previous visible breadcrumb lived in a client component).

### Risk note + decisions (applied before editing)
- **Destination signal — no schema change (constraint respected):** `prisma/schema.prisma` `model Tour` has **no `destination` field** and `TourPoint.label` is **unindexed**; 16 of 18 public tours have **empty route data**. Therefore relevance is derived from **slug tokens** (e.g. `hurghada-cairo-trip-program` → `hurghada`, `cairo`) — the only destination signal available for all 18 tours, with **zero DB/schema/migration risk**. A real `Destination` entity stays a deferred, approval-gated item.
- **Ordering decision (user-specified):** destination match first, then `created_at desc` (newest first) — implemented as the query's primary ordering.
- **Bounded queries:** max **2** DB round-trips per tour page (1 match query + 1 bounded backfill), each capped at `RELATED_CANDIDATE_LIMIT = 12`, then sliced to 3 → no N+1, no full-table growth as the catalog scales.
- **Route/canonical structure untouched:** no URL shape, redirect, canonical, sitemap, or robots change.

### Changes
1. ✅ `src/features/tour/service.ts`
   - Extracted `toTourSummary(tour)` + `mapCurrency()` from `listPublicTours` → single mapping source reused by the new related query (**no duplicated mapping logic**).
   - Added `RELATED_STOPWORDS` + `destinationTokens(slug)`: slug split on `-`, keep tokens `length > 3`, drop stopwords → `{hurghada, cairo-trip-program}`-style noise filtered out.
   - Added `listRelatedTours(slug, limit = 3)`, wrapped in `cache()`: `where { slug: { not: slug }, OR: tokens.map(t => ({ slug: { contains: t } })) }`, `orderBy: { created_at: "desc" }`, `take: RELATED_CANDIDATE_LIMIT`; then a single bounded backfill (`slug: { notIn: [slug, ...picked] }`) when fewer than `limit` matches exist → every tour page always renders a full related row.
2. ✅ `src/features/tour/components/TourCard.tsx` — added `TourCardProps` with optional `priority?: boolean` (default `true`). Existing callers (`tours-list-client.tsx`, `home-page-client.tsx`) render `<TourCard tour={tour} />` → **behaviour unchanged**; only related cards opt into `priority={false}`. *(Superseded in Step 7: the prop was removed entirely — all card images are now always lazy, for measured reasons.)*
3. ✅ New `src/features/tour/components/RelatedTours.tsx` — `"use client"` `motion.section` (`aria-labelledby="related-tours-heading"`, `mt-16`) rendering a `sm:grid-cols-2 lg:grid-cols-3` grid of `TourCard`; returns `null` when empty. Heading matches the page's existing `<h2>` style exactly (`font-heading mb-6 text-2xl font-bold tracking-wider text-obsidian`). *(Step 7 superseded the `priority={false}` argument — cards are lazy by default now.)*
4. ✅ `src/features/tour/components/TourContent.tsx` — props `{ tour, relatedTours, relatedHeading }`; visible breadcrumb nav removed (moved to a server component); container padding `py-8 sm:py-12` → `pb-8 sm:pb-12` (top padding now supplied by the breadcrumb wrapper, so **total spacing is byte-identical**); renders `RelatedTours` after the bottom CTA.
5. ✅ New `src/features/tour/components/TourBreadcrumb.tsx` (**server** component) — `{ locale, title }`, `getServerT(locale)`, `localizedPath()`, `aria-label="Breadcrumb"`, `mb-8`.
6. ✅ `src/app/[locale]/(public)/tours/[slug]/page.tsx` — `Promise.all([getPublicTourBySlug(slug), listRelatedTours(slug)])` (parallel, no added serial latency); JSON-LD breadcrumb labels now sourced from `getServerT(locale)` so visible nav and structured data match; wraps the page in `mx-auto w-full max-w-6xl px-4 pt-8 sm:px-6 sm:pt-12` and mounts `TourBreadcrumb` above `<TourContent />`.
7. ✅ New `src/core/lib/i18n-resources.ts` — shared locale bundle (single source of truth) imported by both entry points.
8. ✅ New `src/core/lib/i18n-server.ts` — i18next core `createInstance()` + `getServerT(locale)`; **server-safe**.
   - ⚠️ **Root-cause fix:** `src/core/lib/i18n.ts` is **client-only** (`i18n.use(initReactI18next)`) — importing it into a server component threw `TypeError: {imported module …/rsc/react.js}.createContext is not a function` → **500 on all tour pages**. `i18n.ts` now imports the shared `resources`; server code never touches react-i18next.
9. ✅ `public/locales/{en,ar,de}/common.json` → added `tours.relatedTours`: `"You May Also Like"` / `"قد يعجبك أيضاً"` / `"Das könnte Ihnen auch gefallen"`.

### Verification (dev server on :3777)
- ✅ `npx tsc --noEmit` → exit 0 (zero errors); all 3 locale JSONs parse.
- ✅ All tour pages 200 (previously **500** from the react-i18next server import) — root cause fixed, not worked around.
- ✅ `/en|ar|de/tours/cairo` → related = `hurghada-cairo-trip-program`, `nile-trip-cairo`, `hurghada-luxor-cairo-excursions-program` (true destination matches).
- ✅ **Backfill works:** `white-desert-bahariya` + `siwa-oasis` (no destination-token peers) render a full 3-card row.
- ✅ **Server-rendered localization (fixed locally):** raw SSR HTML carries the localized breadcrumb (`الرئيسية الجولات` / `Startseite Touren`) *and* the localized related heading (`قد يعجبك أيضاً` / `Das könnte Ihnen auch gefallen`) with **no JS execution** — verified by raw `fetch` of the response body, not just the hydrated DOM.
- ✅ **RTL:** `/ar/tours/cairo` → `dir=rtl`, heading direction `rtl`, 3 cards side-by-side with descending left offsets (916/540/164) = correct RTL order.
- ✅ **Layout regression check (DOM-measured, 1440×1000):** breadcrumb left `164` == grid left `164` (aligned), gap breadcrumb→content `32px` (unchanged `mb-8`), 3 cards × `352px` at 3 columns, section reveals to `opacity: 1` on scroll.
- ✅ **Crawlability:** related `<a href>`s are present in the initial HTML (no-JS), locale-prefixed.
- ✅ Regression sweep — 19 URLs: `/robots.txt`, `/sitemap.xml`, `/en|ar|de`, `/en|ar/tours`, `/en/contact`, `/en/about`, `/en/privacy`, 4 tour details, `/ar|de/tours/cairo` all **200**; `/en/dashboard`, `/en/admin`, `/en/tours/cairo/book` **307** (expected auth guards). ALL OK.

### New finding (documented, NOT fixed — out of scope)
- **Pre-existing, app-wide SSR-English gap:** `I18nProvider` switches language in a `useEffect` **after hydration**, so the raw SSR HTML renders every client-side `t()` string in **English for all locales** (e.g. `html lang="ar"` with an English body). This is real, pre-existing, and affects the whole app — an app-wide fix (locale-aware server rendering across all components) is a **separate milestone requiring approval**, not a Step 6 side effect. Step 6's new strings (breadcrumb + related heading) were deliberately rendered server-side so they are **not** part of the gap.
- Related cards inherit the site-wide **placeholder tour images** (`/uploads/tours/…` → `_next/image` 400) already tracked in `AGENTS.md` ("18 tours live — images pending manual download"). The related row auto-resolves once images are downloaded; nothing to fix in code.

Result: ✅ done — 3 files modified + 4 new files + 3 locale edits; internal linking added (destination-matched, newest-first, backfilled, ≤2 queries); breadcrumb now server-rendered + localized; a latent 500-causing client/server i18n boundary bug fixed at the root; zero route/schema/canonical/sitemap changes.

---

## Step 7 — Image SEO + performance ✅ COMPLETE (7a policy/alt + 7b measurement)

Goal: make the real LCP image optimal (delivery + priority hint + alt) and correct the eager/lazy policy so images no longer compete with the LCP. Then **measure** rather than assume — the policy is derived from traced LCP elements, not from a rule of thumb.

### Findings (measured BEFORE any change)
- **Baseline homepage trace: LCP 1490 ms.** LCP element = `<div class="absolute inset-0 animate-ken-burns bg-cover bg-center">` → CSS `background-image: url('/uploads/stock/hero-pyramids.jpg')`. The check `fetchpriority=high` **FAILED**, request priority **Low**, raw **471 KB JPEG**, discovered only *after* CSS parse (queued 1079 ms / sent 1293 ms), load duration 322 ms. As a CSS background it bypassed `next/image` completely: no AVIF/WebP, no srcset, no `alt`, no preload.
- **The eager/lazy policy was exactly inverted.** `/en`: **18 `as=image` preloads** (every tour card eager) while the actual LCP image was a CSS background. `/en/tours`: all 18 cards eager. `/en/tours/cairo`: the above-the-fold gallery main image was **lazy**.
- **LCP element per page (traced):** homepage = hero **image**; `/tours` and `/tours/[slug]` = **text** (LCP breakdown contains only TTFB + render delay — no load delay/duration).
- **Alt audit: clean.** `TourCard` → `alt={tour.title}`; gallery main → `alt={`${title} — image N`}`; gallery thumbnail `alt=""` inside `<button aria-label="View image N">` is **correct decorative practice — deliberately NOT changed**. 0 images missing `alt` site-wide.
- ⚠️ **Next.js 16 breaking change discovered:** `priority` is **deprecated** in favour of `preload` (`node_modules/next/dist/docs/01-app/03-api-reference/02-components/image.md` → `#### priority`). Verified empirically by inspecting the rendered HTML: **neither `priority` nor `preload` emits `fetchpriority="high"`** — so the pre-existing `priority = true` default on every `TourCard` was both the deprecated API *and* ineffective at signalling priority.

### Changes
1. ✅ `src/app/[locale]/(public)/home-page-client.tsx` — the CSS-background hero → `next/image` (`fill`, `sizes="100vw"`, `className="animate-ken-burns object-cover object-center"`), keeping the Ken Burns animation (its keyframes are pure `transform: scale()`, identical on an `<img>`; `prefers-reduced-motion` already disables it). Uses the **documented Next 16 LCP recipe `loading="eager"` + `fetchPriority="high"`** — verified as the *only* combination for which Next emits the `<head>` preload link **with** `fetchpriority=high` (whereas `preload`/`priority` emitted it *without* the hint). Added localized `hero.imageAlt` to all 3 locales.
2. ✅ **Priority policy corrected from traced evidence:**
   - homepage hero → eager + `fetchPriority="high"` (its measured LCP element);
   - **all `TourCard` images → always lazy** — the `TourCard` prop was **removed entirely**, because measured LCP on `/tours` and `/tours/[slug]` is **text**; preloading a card there only competes with the real LCP;
   - `TourGallery` main image → `lcp` (eager + high): **forward-correct** for when the 18 real tour photos land (today they 400 into gradient fallbacks, so the LCP is text).
3. ✅ `src/features/tour/components/TourImage.tsx` — the `priority`/`preload` props replaced by one semantic **`lcp?: boolean`** mapping to `loading={lcp ? "eager" : "lazy"}` + `fetchPriority={lcp ? "high" : undefined}`. One explicit flag, no deprecated API. Call sites updated (`TourGallery` uses it; `TourCard`, `RelatedTours`, both page clients no longer pass anything).
4. ✅ `src/core/utils/seo.ts` — the default OG image now **always** gets `og:image:alt` (`DEFAULT_OG_IMAGE_ALT`); previously the alt was emitted *only* when a page passed one explicitly, so home/tours/contact/CMS pages had none. The constant is intentionally English-only: the shared photograph is not localized.

### Verification
- ✅ `npx tsc --noEmit` → exit 0. No `priority`/`preload` Image props remain anywhere in `src/` (only the unrelated `sitemap.ts` priorities).
- ✅ Hero renders as a real `<img alt="Pyramids at golden hour in Egypt" loading="eager" fetchpriority="high">` plus a `<head><link rel="preload" as="image" fetchpriority="high" …>`; `/ar` + `/de` alts localized.
- ✅ **LCP: 1490 ms → 1277 ms / 1322 ms** across two runs (dev server; ~1000 ms of that is dev TTFB). Breakdown: **load delay 51 → 9 ms**, **load duration 322 → 9-10 ms**, CLS **0.00 unchanged**.
- ✅ **LCPDiscovery now passes all three checks** — `fetchpriority=high applied: PASSED` (was FAILED), `shouldn't use loading=lazy: PASSED`, `discoverable in initial document: PASSED`; request priority **High** (was **Low**); "Estimated savings: none".
- ✅ **Payload:** served as **AVIF** through `/_next/image` — 482,298 B → **133,880 B @1920w (-72%)**, 46,654 B @1080w, **17,702 B @640w**, with a responsive srcset from 640w to 3840w.
- ✅ **Structural audit, before → after:** `/en` 18 image-preloads + 0 lazy + 1 CSS-bg → **1 image preload + 18 lazy + 0 CSS-bg** (21 `<img>`, 0 missing alt); `/en/tours` 18 eager → **0 image preloads, 18 lazy**; `/en/tours/cairo` 0 eager/7 lazy → **1 preload (gallery) / 6 lazy**.
- ✅ Regression sweep — 21 URLs: every valid route **200**; `/en/dashboard`, `/en/admin`, `/en/tours/cairo/book` **307** (expected auth guards, unchanged); booking pages keep `noindex,follow`. (Correction: `/book/cairo` is **not** a route — the real path is `/tours/[slug]/book`.)

### Findings documented, NOT fixed (out of Step 7 scope / needs approval)
- ⚠️ **`/tours` + `/tours/[slug]` LCP ≈ 2.7 s is dominated by render delay ≈ 1707 ms** (TTFB ≈ 1033 ms) — **not** an image problem, so Step 7 cannot move it. It is the app-wide client-side i18n hydration gap already documented in Step 6 (+ render-blocking CSS). The real fix is the locale-aware server-rendering milestone, which is **approval-gated**.
- ⚠️ **6 of 7 stock images are orphans (~1.9 MB, referenced nowhere in `src`):** `tour-temple.jpg` (471 KB), `tour-camel.jpg` (420 KB), `tour-nile.jpg` (420 KB), `hero-desert.jpg` (309 KB), `section-whyus.jpg` (186 KB), `tour-valley.jpg` (90 KB). **Not deleted** — they may be referenced by `docs/tours_seed.json` or planned content. **Awaiting a decision.**
- `public/uploads/tours/` holds only 2 placeholder files (`nile-cruise-cairo.jpg`, `white-desert.jpg`), so all 18 tour images 400 into gradient fallbacks — pre-existing, tracked in `AGENTS.md`.
- **Measurement caveat:** Turbopack dev inflates TTFB and render delay, so absolute LCP here overstates production. The reliable signals are the *deltas*: load delay, load duration, format/size, priority and preload counts.

Result: ✅ done — 5 files modified + 3 locale edits; the homepage LCP image moved from a 471 KB unprioritized CSS background to a preloaded, `fetchpriority=high`, AVIF/SRCSET `<img>` with a localized alt (all 3 LCPDiscovery checks now pass); the inverted eager/lazy policy corrected on measured evidence; deprecated Next 16 `priority` API fully migrated to an explicit `lcp` flag; default OG alt gap closed; zero route/schema/canonical/sitemap changes.

---

## Post-Step-7 remediation ✅ COMPLETE (same session, user-authorized)

Three items the user asked to close before Step 8, plus one discovery.

### 1. SSR locale root cause FIXED — all locales were server-rendered in English
- **Root cause:** `src/core/lib/i18n.ts` exported a **module singleton** initialized with `lng: "en"`. `I18nProvider` applied the active locale only inside `useEffect` — which **never runs on the server**. So for `/ar` and `/de` the pre-hydration HTML contained **English** UI strings, then the client swapped them after hydration. This was the app-wide driver of the high *render delay* flagged in Step 7 (and it is genuinely bad for SEO: Google indexes the SSR HTML).
- **Fix:** `src/core/lib/i18n.ts` → factory `createI18n(locale)` via `createInstance()` (module singleton + `changeLanguage` + default export removed). `src/shared/components/i18n-provider.tsx` → `const [i18n] = useState(() => createI18n(locale))`, dead `mounted` state removed; the `useEffect` now only handles *client-side* locale switches + `document.documentElement.lang/dir`.
- **Verified in raw SSR HTML (not the DOM):** `/ar` **1503 Arabic chars** (was **0**); `/de` 25 umlauts + 8× "Touren"; `/en` unchanged (control). Hero `alt` localized with `fetchpriority="high"` intact on all three.
- **Browser-verified:** `lang="ar"` `dir="rtl"`, H1/H2 and nav fully Arabic; **zero hydration errors** on `/ar` and `/de/tours` (only the known pre-existing 400s for missing tour images).

### 2. Two hardcoded public-facing English strings FIXED (bypassed `t()`)
- `src/app/[locale]/layout.tsx` skip-link → `getServerT(locale)("a11y.skipToContent")` (a11y-critical: it is the **first focusable node in the HTML**, present on every page; it was English on AR/DE).
- `src/app/[locale]/(public)/home-page-client.tsx` hero scroll hint → `t("hero.scroll")`.
- Added `a11y.skipToContent` + `hero.scroll` to all 3 locales (en/ar/de; proper translations, not placeholders).
- **Verified in raw HTML:** skip-link `/ar` 25 chars / 22 Arabic, `/de` 24 chars, `/en` 20 chars; scroll label `/ar` "اكتشف" (5 Arabic), `/de` "Entdecken" (9), `/en` "Discover" (8).
- A broader JSX-text scan over all `(public)` routes + public components returned **no further hardcoded strings**. (Note: `CheckoutForm`, `OrderSummary`, `ProfileForms`, `InvoicePDF`, dashboard booking pages also contain English literals, but they are auth-gated `noindex` / PDF-only → **not SEO-relevant**; left untouched to avoid scope creep.)

### 3. 6 orphan stock images DELETED (user-approved)
- Removed `tour-temple.jpg`, `tour-camel.jpg`, `tour-nile.jpg`, `hero-desert.jpg`, `section-whyus.jpg`, `tour-valley.jpg` from `public/uploads/stock/` after confirming they are referenced **nowhere** in `src/`, seed or CSS.
- **1.85 MB freed**; only `hero-pyramids.jpg` (482,298 B, the live homepage LCP image) remains.

### 4. Step 8 discovery — half of it is ALREADY implemented; the rest is GSC-blocked
- The `noindex` half **already exists**: `src/app/[locale]/(public)/tours/page.tsx` `generateMetadata` (L13–33) reads `searchParams` and emits `robots: { index: false, follow: true }` when `q` or `maxPrice` is present; the canonical stays the clean `/tours`. `src/app/robots.ts` correctly does **not** disallow query params (crawlability is required for a `noindex` to be seen).
- The second half (query → landing-page opportunities) **cannot be done without GSC**; `docs/Seo_plan.md:1641` forbids fabricating GSC data. Instructions written to `MANUAL_STEPS.md` → "6. Google Search Console".
- ⚠️ **Side-effect:** reading `searchParams` at route level forces `/tours` to render **dynamically on every request** (no static caching) — a candidate contributor to its TTFB. **Not changed** (needs approval).

### ⚠️ NEW FINDING — page metadata is NOT localized (not yet fixed, needs a decision)
`<title>` and `<meta name="description">` are **English for every locale** — measured **0 Arabic/German characters** on `/ar` + `/de` for home, `/tours` and `/tours/[slug]`. Examples: `/de/tours` → `Tours | Mystic Egypt`; `/ar/tours/cairo` → `Cairo City Tour | Mystic Egypt`.
This is a high-impact SEO gap (title/description drive the SERP snippet and CTR) but it is a **content-translation workstream** distinct from the technical fixes above: static pages (home/tours/about/contact) need per-locale title+description text, and tour pages derive theirs from **DB content**, which is single-language. **Recommendation:** treat as its own step (metadata + content localization) before Steps 19/28.

### Verification summary
- ✅ `npx tsc --noEmit` → exit 0; all 3 locale JSONs parse.
- ✅ Regression sweep 21 URLs → **0 failures** (all valid routes 200; `/en/dashboard`, `/en/admin`, `/en/tours/cairo/book` 307 auth guards; `robots.txt` + `sitemap.xml` 200).
- ✅ Zero hydration errors; `/tours` booking `noindex,follow` intact.
- ✅ No route / canonical / sitemap / schema / DB changes.

---

## Step 9 — E-E-A-T & content/trust ✅ COMPLETE

Goal: give Google real, honest trust signals — a complete, GDPR/UK-GDPR-correct privacy policy and transparent cancellation terms, business identity with real (non-fabricated) contact details and addresses, and legal links in the footer. **Explicitly NOT included** (per `docs/Seo_plan.md` — no fabricated signals): registration number, ratings/reviews, or testimonials. Company name/registration decisions: owner instructed **no UK registration number on the site** (fraud-prevention) and **no ratings/reviews**.

### Cancellation truth (aligned with `src/core/utils/cancellation.ts`)
- ≥30 days before arrival → **95% refund** (5% non-refundable administration fee)
- 15–29 days → **50% refund**
- <15 days → **no refund**
- Non-refundable third-party costs (e.g. internal Egypt flights booked on the customer's behalf) **deducted in full first**, whatever the timing
- Policy copy mirrors these tiers exactly in all 3 locales.

### Changes
1. ✅ **New `src/features/policy/content.ts`** — typed single source of trust content:
   - `PolicyType` = `privacy-policy | terms-and-conditions | cancellation-policy | cookie-policy`; `POLICY_TYPES` (canonical order), `isPolicyType`, `PolicySection`, `PolicyContent`, `getPolicyContent(type, locale)` (en fallback).
   - Full legal copy for **4 policies × 3 locales** (en/ar/de). Guardrails embedded: GDPR & UK GDPR, cookie classes (necessary/analytics GA4/optional), index data sources (accounts, emails, bookings, Stripe payment intents — **no card data stored**, Stripe tokens only), retention (7 years financial records), data-subject rights (access/rectification/erasure/portability/objection), Europe-originating data processed in UK/EEA with safeguards, force majeure, limitation of liability, governing law England & Wales, contact `info@mysticegypt.net`.
2. ✅ **New `src/features/policy/components/PolicyLayout.tsx`** — server-composed presenter (title, description, updated date, mapped sections; consistent `border-gold/20`, `bg-obsidian/40`, `text-gold`, `text-sandstone` theme).
3. ✅ **New `src/app/[locale]/(public)/policies/[policy]/page.tsx`** — static route:
   - `export const dynamicParams = false` + `generateStaticParams()` from `POLICY_TYPES` → all **12 (locale×policy) combos prerendered at build**; unknown `/policies/*` → `notFound()` at build. **This is why it does NOT 500 in production:** on-demand static renders of the `(public)` layout hit the known `DYNAMIC_SERVER_USAGE` error (`PublicHeader` → `cookies()`/`getCurrentUser()`); a fully prerendered route never re-renders on demand (same reason `tours/[slug]` uses `force-dynamic`).
   - `generateMetadata` → `buildPageMetadata({ pathname: `/policies/${policy}`, locale, title, description, ogType: "website" })` — canonical + hreflang × 3 + x-default + og:locale all auto-emitted.
4. ✅ **`src/shared/components/public-footer-client.tsx`** — new **Legal column** (privacy / terms / cancellation / cookie links via `href("/policies/...")` + localized `footer.*` labels), plus **2 address lines** (`footer.ukAddress`, `footer.egyptAddress` with `MapPin` icons) in the contact column; socials + phone links now fall back to `BUSINESS` constants when `NEXT_PUBLIC_PHONE_UK`/`_EG` env vars are unset.
5. ✅ **`src/app/sitemap.ts`** — `POLICY_TYPES` import + `policyPages` entries (priority 0.3, changeFrequency "yearly", full trilingual alternates).
6. ✅ **`BUSINESS` constants applied as fallbacks everywhere contact/socials render when env vars are absent:** `contact-page-client.tsx`, `public-header.tsx` (phones), `utility-bar.tsx`, `public-header-client.tsx`, `mobile-nav.tsx` (socials).

### Verification (dev server on :3777)
- ✅ `npx tsc --noEmit` → exit 0; all 3 locale JSONs parse.
- ✅ 12 policy routes (en/ar/de × 4) → all **200** with localized real content (spot-verified: `Privacy Policy` + `UK GDPR` on `/en`; `سياسة الخصوصية` on `/ar`; `Datenschutzerklärung` on `/de`; cancellation tiers `95%`/`50%`/`no refund` present; `Google Analytics 4` in cookie policy; `Limitation of liability` in terms).
- ✅ `/en/policies/bogus` → **404** (dynamicParams=false path).
- ✅ Footer (verified in raw HTML): 4 legal links + `Cleveland Tower` + `Hurghada` + both phone fallbacks present. Home `<title>`/`description` localized per-locale (en/ar/de).
- ✅ `/sitemap.xml` → 200, **all 4 policy URLs** present with alternates.
- ✅ Regression sweep 21 URLs → **0 failures** (homepage, tours×3, contact×3, 12 policy routes, sitemap; bogus policy 404 as designed).
- ✅ Dev server stopped, port freed, no temp files left (hygiene).

### Remaining (GSC-blocked, per MANUAL_STEPS §6)
- Step 8 second half (query→landing pages), Step 19 hreflang report, Step 28 programmatic SEO — all need real GSC Performance/Indexing data from the owner; instructions are written and waiting.
- Tour-image LCP stays provisional until the 18 real tour photos are uploaded (pre-existing, tracked in AGENTS.md).

Result: ✅ done — 3 new files + 6 modified + 3 locale edits; complete, honest E-E-A-T trust surface live (4 trilingual policy pages, footer legal + UK/EG addresses, env-free BUSINESS fallbacks, sitemap entries); static-route design avoids the production `DYNAMIC_SERVER_USAGE` 500; zero fabricated signals added.

---

## Step 10 — Documentation + monitoring ⏳ PENDING (GSC performance data required)

Ready to write the monitoring checklist + alerts once the owner provides GSC Performance data (queries, impressions, clicks, CTR per market/lang). Partial updates already landed: Step 9 status in this table, `MANUAL_STEPS.md` §6 (GSC ownership verified — remaining sub-tasks listed), §7 (GBP instructions). Deliverable: SEO monitoring runbook (weekly GSC/GA4 review, alerts, indexation watchlist) after data arrives.

---

## Step 11 — Performance optimization ✅ COMPLETE

Goal: reduce bundle size, remove render-blocking resources, add caching, and improve perceived load time — addressing the PageSpeed Insights gap (mobile 66, desktop 85 on the **old code** before recent changes).

### Findings (from full codebase audit)
- **ScrollProgress** in root layout imports `framer-motion` on EVERY page (~44KB gzipped) — even CMS, 404, admin.
- **GA4 consent init** used `strategy="beforeInteractive"` → render-blocking before hydration.
- **No Cache-Control** headers for `/_next/static/` or `/uploads/`.
- **No `loading.tsx`** for any route → blank screen during SSR on dynamic pages.
- **Cinzel** loaded with only `latin` subset → Arabic headings fall back to system font.
- `recharts` (~200KB) and `@react-pdf/renderer` (~300KB) not dynamically imported — admin/invoice only.

### Changes
1. ✅ **`src/app/[locale]/layout.tsx`** — `ScrollProgress` → `dynamic(() => import(...), { ssr: false })`. framer-motion deferred to client hydration on every page. Added `Noto_Kufi_Arabic` font (`--font-arabic`, `subsets: ["arabic"]`, weights 400–700).
2. ✅ **`src/app/globals.css`** — `[dir="rtl"] { --font-heading: var(--font-arabic); }` — all `font-heading` elements auto-switch to Noto Kufi Arabic when `dir=rtl`.
3. ✅ **`src/shared/components/analytics-provider.tsx`** — GA4 consent init: `beforeInteractive` → `afterInteractive`.
4. ✅ **`next.config.ts`** — `cacheHeaders`: `/_next/static/*` → `max-age=31536000, immutable`; `/uploads/*` → `max-age=86400`; favicon/icon → `max-age=86400`.
5. ✅ **`src/app/[locale]/(public)/loading.tsx`** (NEW) — spinner skeleton for public pages.
6. ✅ **`src/app/[locale]/(public)/tours/loading.tsx`** (NEW) — 6-card skeleton grid.
7. ✅ **`src/app/[locale]/(public)/tours/[slug]/loading.tsx`** (NEW) — hero + text skeleton.

### What was NOT changed (deferred)
- `recharts` dynamic import — admin-only, not in public critical path.
- `@react-pdf/renderer` dynamic import — invoice-only, not in public critical path.
- Dynamic i18n loading — high complexity, risk of breaking SSR locale rendering (Post-Step-7 fix). Dedicated milestone.
- PublicHeader `getCurrentUser()` — architecture-level server→client handoff. Requires approval.

### Expected impact
- ~44KB less JS in main bundle (framer-motion deferred from all pages).
- Render-blocking JS removed (GA4 consent no longer beforeInteractive).
- Static assets cached (no re-download of `_next/static/` within 1 year).
- Arabic typography fixed (Noto Kufi Arabic instead of system fallback).
- Better perceived load (loading skeletons vs blank screen).
- PageSpeed mobile 66 → expected improvement once old server code is replaced (PSI results were from pre-fix deployment).

Result: ✅ done — 3 new files + 4 modified + 1 CSS edit; bundle size reduced, render-blocking removed, caching added, Arabic typography fixed, loading UX improved.
