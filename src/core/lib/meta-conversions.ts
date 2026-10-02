import "server-only";
import { createHash } from "node:crypto";

/**
 * Server-side Meta Conversions API (CAPI) delivery.
 *
 * Elevates the browser Pixel events with trustworthy server-side events. All
 * PII in `user_data` is SHA-256 hashed here before leaving the server (Meta's
 * requirement for `em`/`ph`/`fn`/`ln`). Events that must not fire without
 * consent are gated by the callers (the booking flows carry a `meta_consent`
 * flag from the browser). Never throws — analytics failures must never break
 * business logic.
 */

const PIXEL_ID = process.env.META_PIXEL_ID;
const ACCESS_TOKEN = process.env.META_CAPI_TOKEN;
const TEST_EVENT_CODE = process.env.META_TEST_EVENT_CODE;
const GRAPH_VERSION = "v23.0";

export interface MetaServerUserData {
  em?: string;
  ph?: string;
  fn?: string;
  ln?: string;
}

export interface MetaServerEventParams {
  eventName: string;
  /** Same id used by the browser Pixel — Meta deduplicates on this. */
  eventId?: string;
  eventTime?: number;
  userData?: MetaServerUserData;
  customData?: Record<string, unknown>;
  eventSourceUrl?: string;
  clientIp?: string;
  userAgent?: string;
  fbp?: string;
  fbc?: string;
}

/* ---------------------------------------------------------------------------
 * Normalization + hashing (Meta: SHA-256 hex, lowercase, from normalized raw)
 * ------------------------------------------------------------------------ */

export function hashMetaEmail(email: string): string | undefined {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return undefined;
  return sha256Hex(normalized);
}

export function hashMetaPhone(phone: string): string | undefined {
  const digits = phone.replace(/\D/g, "").replace(/^0+/, "");
  if (!digits) return undefined;
  return sha256Hex(digits);
}

export function splitMetaName(
  name: string,
): { fn?: string; ln?: string } {
  const clean = name.trim().replace(/\s+/g, " ");
  if (!clean) return {};
  const parts = clean.split(" ");
  if (parts.length === 1) return { fn: parts[0] };
  return { fn: parts[0], ln: parts.slice(1).join(" ") };
}

export function hashMetaUserData(
  userData?: MetaServerUserData,
): Record<string, string> {
  const out: Record<string, string> = {};
  if (!userData) return out;
  const em = userData.em ? hashMetaEmail(userData.em) : undefined;
  const ph = userData.ph ? hashMetaPhone(userData.ph) : undefined;
  const name = userData.fn || userData.ln
    ? { fn: userData.fn, ln: userData.ln }
    : undefined;
  const fn = name?.fn ? sha256Hex(name.fn.trim().toLowerCase()) : undefined;
  const ln = name?.ln ? sha256Hex(name.ln.trim().toLowerCase()) : undefined;
  if (em) out.em = em;
  if (ph) out.ph = ph;
  if (fn) out.fn = fn;
  if (ln) out.ln = ln;
  return out;
}

function sha256Hex(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

/* ---------------------------------------------------------------------------
 * Delivery
 * ------------------------------------------------------------------------ */

/**
 * Send one website event to Meta's Conversions API. Returns true when Meta
 * accepted the event (`events_received: 1`). Requires META_PIXEL_ID and
 * META_CAPI_TOKEN; when META_TEST_EVENT_CODE is set the event is routed to the
 * CAPI Test Events tool instead of production matching.
 */
export async function sendMetaServerEvent(
  params: MetaServerEventParams,
): Promise<boolean> {
  if (!PIXEL_ID || !ACCESS_TOKEN) {
    console.warn(
      `[meta-capi] "${params.eventName}" skipped: META_PIXEL_ID/META_CAPI_TOKEN not configured`,
    );
    return false;
  }

  const userData: Record<string, string | number> = {
    ...hashMetaUserData(params.userData),
  };
  if (params.clientIp) userData.client_ip_address = params.clientIp;
  if (params.userAgent) userData.client_user_agent = params.userAgent;
  if (params.fbp) userData.fbp = params.fbp;
  if (params.fbc) userData.fbc = params.fbc;

  const event: Record<string, unknown> = {
    event_name: params.eventName,
    event_time: params.eventTime ?? Math.floor(Date.now() / 1000),
    action_source: "website",
    user_data: userData,
  };
  if (params.eventId) event.event_id = params.eventId;
  if (params.customData && Object.keys(params.customData).length > 0) {
    event.custom_data = params.customData;
  }
  if (params.eventSourceUrl) event.event_source_url = params.eventSourceUrl;

  const payload: { data: unknown[] } & Record<string, unknown> = {
    data: [event],
  };
  if (TEST_EVENT_CODE) {
    payload["test_event_code"] = TEST_EVENT_CODE;
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/${GRAPH_VERSION}/${PIXEL_ID}/events?access_token=${encodeURIComponent(ACCESS_TOKEN)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );

    const body = (await response.json().catch(() => ({}))) as {
      events_received?: number;
      error?: { message?: string; code?: number };
    };

    if (!response.ok || body.events_received !== 1) {
      console.error(
        `[meta-capi] "${params.eventName}" failed: HTTP ${response.status} — ${body.error?.message ?? "events_received != 1"}`,
      );
      return false;
    }
    return true;
  } catch (err) {
    console.error(
      `[meta-capi] "${params.eventName}" request failed:`,
      err instanceof Error ? err.message : err,
    );
    return false;
  }
}