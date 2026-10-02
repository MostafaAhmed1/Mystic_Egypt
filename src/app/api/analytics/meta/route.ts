import { NextResponse } from "next/server";
import { sendMetaServerEvent } from "@/core/lib/meta-conversions";

/**
 * CAPI proxy for browser-generated events (PageView, ViewContent, …).
 *
 * The browser sends the (un-hashed) payload here over HTTPS; this route adds
 * the visitor's IP + user agent, hashes the PII, and forwards it to Meta using
 * the server-only Access Token. The token never reaches the client.
 */
export async function POST(request: Request) {
  let body: {
    event_name?: unknown;
    event_id?: unknown;
    event_data?: unknown;
    user_data?: unknown;
    source_url?: unknown;
    fbp?: unknown;
    fbc?: unknown;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const eventName = body.event_name;
  const eventId = body.event_id;
  if (typeof eventName !== "string" || eventName.length === 0) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (typeof eventId !== "string" || eventId.length === 0) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const forwarded = request.headers.get("x-forwarded-for");
  const clientIp = forwarded ? forwarded.split(",")[0].trim() : undefined;
  const userAgent = request.headers.get("user-agent") ?? undefined;
  const eventSourceUrl =
    typeof body.source_url === "string" ? body.source_url : undefined;

  await sendMetaServerEvent({
    eventName,
    eventId,
    userData: asUserData(body.user_data),
    customData:
      body.event_data && typeof body.event_data === "object"
        ? (body.event_data as Record<string, unknown>)
        : undefined,
    eventSourceUrl,
    clientIp,
    userAgent,
    fbp: typeof body.fbp === "string" ? body.fbp : undefined,
    fbc: typeof body.fbc === "string" ? body.fbc : undefined,
  });

  return NextResponse.json({ ok: true });
}

function asUserData(value: unknown): { em?: string; ph?: string; fn?: string; ln?: string } | undefined {
  if (!value || typeof value !== "object") return undefined;
  const record = value as Record<string, unknown>;
  const out: { em?: string; ph?: string; fn?: string; ln?: string } = {};
  if (typeof record.em === "string") out.em = record.em;
  if (typeof record.ph === "string") out.ph = record.ph;
  if (typeof record.fn === "string") out.fn = record.fn;
  if (typeof record.ln === "string") out.ln = record.ln;
  return Object.keys(out).length > 0 ? out : undefined;
}