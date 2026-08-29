import { NextResponse } from "next/server";
import { getCurrentUser } from "@/core/lib/session";
import { createBooking } from "@/features/booking/service";
import { PAYMENT_METHODS } from "@/features/booking/constants";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Authentication required." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  const tourId = getString(body, "tour_id");
  const tourDate = getString(body, "tour_date");
  const numPeople = getNumber(body, "num_people");
  const addons = Array.isArray((body as { addons?: unknown }).addons)
    ? ((body as { addons: unknown[] }).addons.map((a) => ({
        addon_id: getString(a, "addon_id"),
        quantity: getNumber(a, "quantity"),
      })) as { addon_id: string; quantity: number }[])
    : [];
  const paymentMethod = getString(body, "payment_method");

  if (!tourId || !tourDate || !paymentMethod) {
    return NextResponse.json({ ok: false, error: "Missing required fields." }, { status: 400 });
  }

  if (
    paymentMethod !== PAYMENT_METHODS.STRIPE &&
    paymentMethod !== PAYMENT_METHODS.BANK_TRANSFER
  ) {
    return NextResponse.json({ ok: false, error: "Invalid payment method." }, { status: 400 });
  }

  const result = await createBooking({
    userId: user.id,
    tourId,
    tourDate,
    numPeople,
    addons,
    paymentMethod,
  });

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    booking: result.booking,
    paymentIntentClientSecret: result.paymentIntentClientSecret ?? null,
  });
}

function getString(obj: unknown, key: string): string {
  const value = (obj as Record<string, unknown> | null)?.[key];
  return typeof value === "string" ? value : "";
}

function getNumber(obj: unknown, key: string): number {
  const value = (obj as Record<string, unknown> | null)?.[key];
  const num = typeof value === "number" ? value : Number(value);
  return Number.isFinite(num) ? num : 0;
}
