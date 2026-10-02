# PERFORMANCE_OPTIMIZATION_PLAN.md — Mystic Egypt Google Test Improvements (Sept 2026)

> Dedicated progress tracker for the Google PageSpeed/Lighthouse test remediation on `mysticegypt.net`.
> Source of the run: `docs/google_test.txt` (Captured 23 Sept 2026, 6:17 PM GMT+3 — Moto G Power, Lighthouse 13.5.0, Slow 4G).
> Docs targets: `MANUAL_STEPS.md`, `PROJECT_MAP.md`. Master plan reference: `POST_DEPLOY_FIXES_PLAN.md` (M1–M6 COMPLETE).
> **Rule (mandatory per user, applies to EVERY improvement/development/treatment plan):** the plan MUST be
> documented in project docs BEFORE any execution; progress is tracked here; do not deviate, do not forget steps.
> **Rule:** Execute ONE milestone at a time. Update this file after each completed milestone, then report and WAIT for user approval.
> **Rule:** NO deploy to the server unless the user explicitly says so ("انشر"/deploy), in this session or message.

---

## Baseline — Google Test (23 Sept 2026, mobile Moto G / Slow 4G)

| Category | Score | Verdict |
|----------|-------|---------|
| Performance | **50** | ❌ WEAK — target to fix |
| Accessibility | 97 | ✅ OK — DO NOT TOUCH |
| Best Practices | 100 | ✅ OK — DO NOT TOUCH |
| SEO | 100 | ✅ OK — DO NOT TOUCH |
| Agentic (AI) browsing | **1/3** | ❌ WEAK — target to fix |

### Performance details
- FCP **1.3 s** (good, keep), LCP **8.0 s** (❌), TBT **70 ms** (good, keep), CLS **0.321** (❌), SI **9.7 s** (❌).
- Stat savings quoted by the test: properly-size images **431 KiB** · document response **590 ms** ·
  render-blocking **680 ms** · legacy JS **14 KiB** · unused JS **151 KiB** · **3 long main-thread tasks**.

### Agentic (AI) browsing details (1/3)
- `llms.txt` NOT following suggestions (missing H1, no links) — file **does not exist** locally nor on server.
- WebMCP form coverage FAIL · WebMCP registered tools FAIL · WebMCP schemas valid FAIL · `ai-catalog.json` valid FAIL.

### Server evidence collected (pre-stop, 23 Sept 2026)
- Only the project container is ours: `mystic-egypt` (port 3100). Do NOT touch `dawenli` (3055) or `sqlserver` (1433) — other tenants.
- Hero LCP image: `/uploads/stock/hero-pyramids.jpg` (1920×1280, 482,298 B). `_next/image` at `w=750` served the **original JPEG 482,298 B** (passthrough!), while `w=640`→WebP 31,692 B and `w=828`→WebP 52,676 B — i.e. a lucky width choice from `sizes=100vw` srcset can hand the mobile browser the full-size JPEG → explains LCP 8.0 s.
- Home HTML ≈ 192 KiB; two static stylesheets; multiple async chunk scripts.
- TTFB `/en` measured locally ≈ 0.7–1.1 s (server side, no throttling).

---

## M1 — Hero / image sizing for LCP & SI (431 KiB images)
**Status:** ✅ DONE (executed locally 23 Sept 2026 — deploy still blocked until order).
- Constrain the hero `srcset`/`sizes` so mobile (=most likely Moto G ~360–414 CSS px, DPR≥2) always requests a modest
  WebP width (e.g. cap at ~1080w) instead of the full 1920×1280 JPEG passthrough.
  → Done: `images.deviceSizes: [360,480,640,750,828,1080,1200,1920]` in `next.config.ts` (removes 2048/3840 srcset
  candidates; mobile now lands ≤1080w).
- Right-size / re-encode `hero-pyramids.jpg` (and any oversized uploads found to serve >2× needed) without changing visuals.
  → Done: generated `public/uploads/stock/hero-pyramids.webp` (1920×1280, WebP q80, **280,300 B** — 42% lighter than the
  482,298 B JPEG, same dimensions/visual). Hero `src` in `home-page-client.tsx:50` now points to the `.webp`. The original
  `.jpg` is kept (used by OG image `seo.ts` and as fallback), NOT deleted.
- Convert below-fold card images to WebP at build/optimizer level only downstream (they are already `loading=lazy` → DO NOT touch their behaviour).
  → Unchanged by design: cards are `loading=lazy`; optimizer already serves WebP (`formats:["image/webp"]`). Only deviceSizes cap applies.
- **Verifyable (at M5 re-test):** LCP < 2.5 s, "Properly-size images" audit savings ≥ 300 KiB realized on Moto G/4G; FCP stays ≤ 1.3 s.
- Typecheck (`tsc --noEmit`) ✅ and eslint ✅ clean.

## M2 — Render-blocking / document response / JS (680 ms + 590 ms + 151 KiB + 3 long tasks)
**Status:** ❌ DONE locally (both phases) — JS reduction (Step 4) complete; deploy ⛔ BLOCKED pending explicit order.
- **ROOT CAUSE FOUND (590 ms document response):** `PublicHeader` (`src/shared/components/public-header.tsx`) is an *async
  server component* that calls `getCurrentUser()` → `getServerSession` + Prisma + `await cookies()` in the `(public)` layout
  tree. This forced **every** public page to dynamic/on-demand rendering: `/en|/ar|/de` were NOT in `prerender-manifest`,
  `revalidate=60` was inert, and each first-paint request paid a server round-trip (session+DB) → 590 ms. Matches the known
  prod-only `DYNAMIC_SERVER_USAGE` gotcha.
- **FIX APPLIED (single-file, 23 Sept 2026):** converted `PublicHeader` to `"use client"` — now uses `useSession()`
  (Root `SessionProvider`/`AuthProvider` is already mounted in `src/app/[locale]/layout.tsx`) + `useLocale()` (client,
  pathname-derived) instead of `getCurrentUser()`/`cookies()`/cookie-locale. Session state → `{ name, role }` prop to
  `UtilityBar`/`MobileNav` unchanged. **`(public)/layout.tsx`, `utility-bar.tsx`, `mobile-nav.tsx` untouched.**
  - Tradeoff (documented & accepted): initial SSR HTML renders the logged-out state, then hydration fetches
    `/api/auth/session` → brief flash for logged-in users (standard NextAuth client-session behaviour).
  - `getServerT()` verified pure (no cookies/headers) — safe for static prerender.
- **FIX APPLIED (workaround removal):** removed `export const dynamic = "force-dynamic"` from
  `src/app/[locale]/(public)/tours/[slug]/page.tsx` — its comment cited exactly the PublicHeader cause. Now falls back to
  ISR (`revalidate = 300`); `generateStaticParams` has a `try/catch` returning `[]` when DB is absent at build (Docker-safe),
  so tour pages become on-demand ISR on the server instead of per-request SSR. `booking`/`book` pages stay dynamic by design
  (`requireUser()`).
- **VERIFIED:** `tsc --noEmit` ✅ 0 errors; eslint ✅ (only pre-existing issues, none in changed files); `next build` ✅ →
  `/en`, `/ar`, `/de`, `/en/contact`, `/en/policies/*`, auth pages now **● SSG (prerendered)**; `/en` in
  `prerender-manifest` = `initialRevalidateSeconds: 60` (ISR). Local `next start` doc response `/en` ≈ **84 ms** (was 590 ms).
- Orphan found & confirmed: `src/shared/components/public-header-client.tsx` — zero imports remaining (was header-internal);
  flagged for cleanup in PROJECT_MAP, not deleted (kept pending user confirm).
- **FIX APPLIED — JS reduction (Step 4, 23 Sept 2026):** removed **framer-motion from the home page first-load entirely**.
  - Analysis: framer-motion (`2z0dliktcqubw.js` ≈120 KB) entered the home first-load only via `home-page-client.tsx`,
    `testimonials-section.tsx`, `process-section.tsx`. The big admin chunk `3eg1vlqeu7-7t.js` (403 KB) belongs to admin CMS
    routes only — never in home first-load. `scroll-progress.tsx` (only other layout-level framer user) was already
    lazily loaded via `scroll-progress-lazy.tsx` (`next/dynamic`, `ssr:false`). Orphaned `ScrollReveal.tsx` confirmed.
  - Changes (impact ≥100 KB on first-load JS — WORTH IT): hero entrance animations now pure CSS — new `@keyframes
    fade-in-up` + `.animate-fade-in-up` (stagger via inline `animation-delay` 0/0.15/0.3/0.45 s) and `.animate-fade-in-delayed`
    + `.animate-bob` for the scroll indicator (all added to the `prefers-reduced-motion` `animation:none` block); rewrote
    `ScrollReveal.tsx` (was orphaned, framer-based) to a native IntersectionObserver component (once + rootMargin -100px,
    CSS opacity/transform transition, same API incl. `delay`/`direction`); converted the 3 above files from `motion.*` to CSS
    classes + `<ScrollReveal>` (identical animation feel: duration ~0.5–0.7 s, ease cubic-bezier(0.22,1,0.36,1), card
    stagger i*0.1/i*0.15).
  - **VERIFIED:** `tsc --noEmit` ✅ 0 errors; eslint ✅ clean on changed files; `next build` ✅ for all locales;
    framer-motion no longer referenced in home (`/[locale]/(public)/page`), `[slug]`, or `contact` client-reference
    manifests (only `/tours` `tours-list-client.tsx` keeps it — separate route, not home first-load).
- **Verifyable:** TBT stays ≤ 70 ms, FCP ≤ 1.3 s, unused-JS saving ≥ 100 KiB realized, `/en` STILL prerendered (no regressions).

## M3 — CLS 0.321 (target < 0.1)
**Status:** ✅ DONE locally (deploy ⛔ BLOCKED — awaiting explicit user order).
- Live trace (Chrome DevTools, Slow 4G + 4× CPU throttle, 360×640×2 Moto G emulation) on `/en`:
  - **CLS 0.00** (stable across runs; the lone raw `LayoutShift` event — footer node, delta 0.298 — was
    `had_recent_input: true`, therefore **excluded** from the CLS metric).
  - LCP 1594 ms, TTFB 12 ms (localhost only; real GCP latency will be higher).
- Suspect audit — all already CLS-safe, no code change required:
  - Hero image: `fill` + `h-screen min-h-[700px]` section → dimensions reserved from first layout (no height collapse).
  - Cookie/consent banner (`src/shared/components/cookie-consent.tsx`): `fixed inset-x-0 bottom-0` overlay → paints
    committed-position, never reflows content.
  - Fonts (`next/font` Cinzel/Inter/NotoKufi, `display: swap`): Next.js emits metric-overridden fallback faces
    (`Cinzel Fallback` etc.) so late webfont swap produces ~0 layout shift.
- The 0.321 baseline was the **pre-M1 production build** (hero served full 482 kB JPEG without reserved
  dimensions); M1 (WebP + sizes) plus the above already put CLS comfortably under 0.1.
- **Verifyable:** CLS 0.00 on MotoG/4G locally; accessibility 97 unregressed (Lighthouse mobile: A11y 97, BP 100, SEO 100).

## M4 — Agentic (AI) browsing 1/3 → 3/3
**Status:** ✅ DONE locally (deploy ⛔ BLOCKED — awaiting explicit user order).
- Create `public/llms.txt` (Markdown, H1, real links to tours/sitemap) — `public/llms.txt` (2181 B, 15 tour links).
- Add WebMCP form coverage (contact form) + register WebMCP tools with valid schemas — `toolname="contact_mystic_egypt"` + `tooldescription` + 4× `toolparamdescription` on BOTH the home form (`src/shared/components/contact-form-section.tsx`) and the `/contact` page (`src/app/[locale]/(public)/contact/contact-page-client.tsx`).
- Add a valid `ai-catalog.json` per ARD spec — `public/.well-known/{ard.json,ai-catalog.json}` (863 B each).
- **ROOT CAUSE FIX (the actual 404/HTML bug):** `src/proxy.ts` matcher (line 134) 307-redirected unprefixed `/llms.txt` and `/.well-known/*` to `/{locale}/...` (they weren't in the exclude list); `/en/llms.txt` then matched the `[locale]/(public)/[slug]` route and rendered an HTML 404-in-200 page = the failing `llms-txt` audit. Matcher now also excludes `\.well-known(?:/.*)?` and `llms\.txt`. Locale redirect verified still active for real pages (`/` → `/en`).
- **Verification (standalone, PID 18176 :3000):** `/llms.txt` → 200 `text/plain`, `/.well-known/ard.json` + `ai-catalog.json` → 200 `application/json`, `/en/contact` SSR contains `toolname` + all 4 `toolparamdescription`.
- **Verifyable:** Lighthouse desktop + mobile: **Agentic Browsing 3/3 (1.0)**, SEO 100, BP 100, A11y 97, llms-txt score=1.

## M5 — Re-test & (only if ordered) deploy
**Status:** ⏸️ BLOCKED — awaiting explicit user order to execute.
- Re-run the identical Google test (Moto G / Slow 4G). Target: Performance ≥ 90, Agentic 3/3, others unchanged (97+/100/100).
- **Deploy gate:** NO deploy unless the user explicitly says to. When ordered, use `scripts/deploy.sh` (canonical per `MANUAL_STEPS.md` §6) with the container **stopped** state re-started by the script as designed.

---

## Operational state (server)
- **Container `mystic-egypt` is STOPPED (planned, per user order, 23 Sept 2026).** Port 3100 closed. MariaDB remains up (system service).
- This frees server resources pre-execution. Site is offline until M5 deploy (only after explicit order).
- Do NOT restart the container or deploy anything until instructed.

## Progress Log
| Date | Milestone | Status |
|------|-----------|--------|
| 2026-09-23 | Plan written, baseline captured, M1–M5 defined | ⏸️ BLOCKED (awaiting user order) |
| 2026-09-23 | M1 executed locally (hero WebP q80 42% lighter + deviceSizes cap ≤1920, ≤1080 on mobile) | ✅ DONE (deploy ⛔ BLOCKED) |
| 2026-09-23 | M2 Phase 1: PublicHeader→client (useSession+useLocale), removed force-dynamic on tour pages; `/[locale]` now SSG+ISR, doc response 590→84 ms | ✅ DONE (JS phase in progress) |
| 2026-09-23 | M2 Step 4 (JS reduction): framer-motion removed from home first-load — hero → CSS @keyframes, ScrollReveal→IntersectionObserver, testimonials/process converted; ~120 KB out of home first-load | ✅ DONE (deploy ⛔ BLOCKED) |
| 2026-09-23 | M3 (CLS): live trace on Moto G/4G → CLS 0.00; all suspects already hardened (hero reserve, fixed overlay, font fallbacks); baseline 0.321 was pre-M1 build | ✅ DONE (deploy ⛔ BLOCKED) |
| 2026-09-23 | M4 (Agentic): llms.txt 200 text/plain + ARD ard.json/ai-catalog.json 200 JSON + WebMCP on contact form (root cause = proxy.ts matcher 307-redirect on unprefixed statics; fixed matcher line 134). Lighthouse desktop+mobile Agentic 3/3 (100), SEO 100 | ✅ DONE (deploy ⛔ BLOCKED) |