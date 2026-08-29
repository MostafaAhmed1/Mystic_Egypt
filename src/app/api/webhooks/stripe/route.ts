import { NextResponse } from "next/server";
import { confirmBookingFromStripe } from "@/features/booking/service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || secret.includes("placeholder")) {
    return NextResponse.json(
      { error: "Stripe webhook is not configured." },
      { status: 400 },
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  const rawBody = await request.text();

  let event: { type: string; data: { object: { id: string } } };
  try {
    const { stripe } = await import("@/core/lib/stripe");
    event = stripe().webhooks.constructEvent(
      rawBody,
      signature,
      secret,
    ) as unknown as { type: string; data: { object: { id: string } } };
  } catch {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntentId = event.data.object.id;
    await confirmBookingFromStripe(paymentIntentId);
  }

  return NextResponse.json({ received: true });
}
