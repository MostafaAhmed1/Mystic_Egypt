"use client";

import { API_ENDPOINTS } from "@/core/api/endpoints";

/**
 * Client-side Meta Pixel plumbing.
 *
 * Mirrors the GA4 integration in `./analytics.ts`: nothing loads or fires
 * until the visitor accepts the cookie-consent banner (the `cookie_consent`
 * cookie), matching Meta's consent-mode recommendation and the confirmed
 * GDPR decision for the site.
 *
 * Deduplication contract: every event gets a unique `event_id` that is passed
 * BOTH to the browser Pixel (via the `eventID` option) and to the server-side
 * Conversions API (through `/api/analytics/meta`). Meta counts browser and
 * server events with the same `event_id` only once.
 */

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const FBQ_SOURCE = "https://connect.facebook.net/en_US/fbevents.js";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export interface MetaUserData {
  em?: string;
  ph?: string;
  fn?: string;
  ln?: string;
}

let snippetLoaded = false;
let pixelEnabled = false;
let advancedMatching: MetaUserData | undefined;
let lastMatchingKey = "";

/** True when the visitor accepted cookies AND a Pixel ID is configured. */
export function isMetaPixelEnabled(): boolean {
  return pixelEnabled && Boolean(PIXEL_ID);
}

/**
 * Create a unique event id. Exposed so callers can generate the id first and
 * reuse it for the matching server-side Conversions API event (deduplication).
 */
export function createEventId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 14)}`;
}

/**
 * Inject the Meta Pixel loader snippet (it defines `fbq` and queues calls
 * until fbevents.js finishes loading).
 *
 * NOTE: the snippet must NOT start with `fbq('consent','revoke')`. A leading
 * revoke in the pre-load queue poisons the flush: the queued `consent grant`
 * + `init` behind it are dropped and the pixel never registers (verified:
 * `fbq.getState().pixels` stays empty). The snippet is only injected AFTER
 * the visitor accepts cookies anyway, so default (granted) consent is correct.
 */
function ensurePixelSnippet(): void {
  if (snippetLoaded || typeof document === "undefined") return;
  snippetLoaded = true;
  const inline = document.createElement("script");
  inline.async = true;
  inline.textContent = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','${FBQ_SOURCE}');`;
  document.head.appendChild(inline);
}

function callFbq(...args: unknown[]): void {
  if (typeof window === "undefined") return;
  window.fbq?.(...args);
}

function matchingKey(data: MetaUserData | undefined): string {
  return [
    data?.em ?? "",
    data?.ph ?? "",
    data?.fn ?? "",
    data?.ln ?? "",
  ].join("|");
}

/**
 * Grant consent, register the pixel (with optional Automatic Advanced
 * Matching data) and mark the module enabled. Idempotent.
 */
export function initMetaPixel(userData?: MetaUserData): boolean {
  if (!PIXEL_ID) return false;
  ensurePixelSnippet();
  advancedMatching = userData;
  const key = matchingKey(userData);
  callFbq("consent", "grant");
  callFbq("init", PIXEL_ID, userData && citeMetaUserData(userData));
  pixelEnabled = true;
  lastMatchingKey = key;
  return true;
}

/** Re-apply Advanced Matching data when it becomes available later (e.g.
 * after the session loads). Safe to call again with the same pixel id. */
export function updateMetaUserData(userData?: MetaUserData): void {
  if (!pixelEnabled || !PIXEL_ID) return;
  advancedMatching = userData;
  const key = matchingKey(userData);
  if (key === lastMatchingKey && advancedMatching) return;
  lastMatchingKey = key;
  callFbq("init", PIXEL_ID, userData && citeMetaUserData(userData));
}

/** Current Advanced Matching payload, reused for server-side events. */
export function getMetaUserData(): MetaUserData | undefined {
  return advancedMatching;
}

/**
 * Send a standard Meta event (browser Pixel + Conversions API) with a shared
 * `event_id`. The server event travels through the same-origin proxy route so
 * the Access Token never reaches the browser. No-op before consent.
 */
export function sendMetaEvent(
  eventName: string,
  eventData: Record<string, unknown> = {},
  options?: { eventId?: string },
): string | null {
  if (!isMetaPixelEnabled()) return null;

  const eventId = options?.eventId ?? createEventId();
  callFbq("track", eventName, eventData, { eventID: eventId });

  void fetchCapi({
    event_name: eventName,
    event_id: eventId,
    event_data: eventData,
    user_data: advancedMatching,
    source_url: window.location.href,
    fbp: readFbpCookie(),
    fbc: readFbcCookie() ?? undefined,
  }).catch(() => {
    // Best effort — a lost CAPI event must never break the page.
  });

  return eventId;
}

interface CapiProxyPayload {
  event_name: string;
  event_id: string;
  event_data: Record<string, unknown>;
  user_data?: MetaUserData;
  source_url: string;
  fbp?: string;
  fbc?: string;
}

async function fetchCapi(payload: CapiProxyPayload): Promise<Response> {
  return fetch(API_ENDPOINTS.ANALYTICS.META, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

/**
 * Read or create the `_fbp` browser id cookie (format `fb.1.<ts>.<rand>`).
 * Required for Meta to stitch browser and server events to the same person.
 */
export function readFbpCookie(): string {
  if (typeof document === "undefined") return "";
  const existing = document.cookie.match(/(?:^|; )_fbp=([^;]*)/);
  if (existing?.[1]) return existing[1];
  const stamp = Math.floor(Date.now() / 1000);
  const rand = Math.floor(Math.random() * 1e9);
  const value = `fb.1.${stamp}.${rand}`;
  document.cookie = `_fbp=${value}; max-age=${15552000}; path=/; SameSite=Lax`;
  return value;
}

/** Read the `_fbc` click id cookie set by Meta's Click ID parameter. */
export function readFbcCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|; )_fbc=([^;]*)/);
  return match?.[1] ?? null;
}

/** True when the visitor accepted the cookie banner. */
export function hasMetaConsent(): boolean {
  if (typeof document === "undefined") return false;
  const match = document.cookie.match(/(?:^|; )cookie_consent=([^;]*)/);
  return match?.[1] === "accepted";
}

/** Only spread fields that are actually present (Meta ignores unknowns but
 * this keeps the payload clean). */
function citeMetaUserData(data: MetaUserData): MetaUserData {
  const out: MetaUserData = {};
  if (data.em) out.em = data.em;
  if (data.ph) out.ph = data.ph;
  if (data.fn) out.fn = data.fn;
  if (data.ln) out.ln = data.ln;
  return out;
}