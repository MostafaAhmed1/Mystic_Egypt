import "server-only";
import { prisma } from "@/core/lib/prisma";
import type { Currency } from "@/core/constants/currencies";
import {
  sendMetaServerEvent,
  splitMetaName,
  type MetaServerUserData,
} from "@/core/lib/meta-conversions";
import { SITE_URL } from "@/core/utils/seo";
import {
  PAYMENT_METHODS,
  type PaymentMethod,
} from "@/features/booking/constants";
import type { AddonDto, BookingDto } from "./types";

// Booking business logic lives here (never inside app/ routes).

export async function listAddons(): Promise<AddonDto[]> {
  const rows = await prisma.addon.findMany({ orderBy: { name: "asc" } });
  return rows.map((addon) => ({
    id: addon.id,
    name: addon.name,
    description: addon.description,
    price: addon.price,
    currency: toCurrency(addon.currency),
  }));
}

export async function getBookableTourBySlug(slug: string): Promise<{
  id: string;
  title: string;
  slug: string;
  base_price: number;
  group_prices: { min_people: number; max_people: number; price_per_person: number }[] | null;
  currency: Currency;
} | null> {
  const tour = await prisma.tour.findUnique({ where: { slug } });
  if (!tour || tour.status !== "open") {
    return null;
  }
  let groupPrices: { min_people: number; max_people: number; price_per_person: number }[] | null = null;
  if (tour.group_prices && Array.isArray(tour.group_prices)) {
    const raw = tour.group_prices as Record<string, unknown>[];
    groupPrices = raw
      .filter(
        (t) =>
          typeof t.min_people === "number" &&
          typeof t.max_people === "number" &&
          typeof t.price_per_person === "number",
      )
      .map((t) => ({
        min_people: t.min_people as number,
        max_people: t.max_people as number,
        price_per_person: t.price_per_person as number,
      }));
  }
  return {
    id: tour.id,
    title: tour.title,
    slug: tour.slug,
    base_price: tour.base_price,
    group_prices: groupPrices,
    currency: toCurrency(tour.currency),
  };
}

interface CreateBookingParams {
  userId: string;
  tourId: string;
  tourDate: string; // yyyy-mm-dd
  numPeople: number;
  addons: { addon_id: string; quantity: number }[];
  paymentMethod: PaymentMethod;
  /** GA4 client id from the visitor's `_ga` cookie, carried to the Stripe
   * PaymentIntent metadata so the server-side purchase event can be
   * attributed to the same browsing session. */
  gaClientId?: string;
  /** True when the visitor accepted the Meta/cookies consent gate. */
  metaConsent?: boolean;
  /** Meta browser id (`_fbp`) and click id (`_fbc`) from the visitor. */
  fbp?: string;
  fbc?: string;
}

export async function createBooking(params: CreateBookingParams): Promise<{
  ok: boolean;
  error?: string;
  booking?: BookingDto;
  paymentIntentClientSecret?: string | null;
}> {
  // --- Validate basic input ---
  const tour = await prisma.tour.findUnique({ where: { id: params.tourId } });
  if (!tour || tour.status !== "open") {
    return { ok: false, error: "This tour is no longer available." };
  }

  if (!Number.isInteger(params.numPeople) || params.numPeople < 1) {
    return { ok: false, error: "Please enter a valid number of people." };
  }

  const parsedDate = parseDate(params.tourDate);
  if (!parsedDate) {
    return { ok: false, error: "Please choose a valid tour date." };
  }
  const today = startOfDay(new Date());
  if (parsedDate < today) {
    return { ok: false, error: "The tour date cannot be in the past." };
  }

  if (
    params.paymentMethod !== PAYMENT_METHODS.STRIPE &&
    params.paymentMethod !== PAYMENT_METHODS.BANK_TRANSFER
  ) {
    return { ok: false, error: "Please choose a payment method." };
  }

  // --- Resolve and validate add-ons ---
  const addonIds = params.addons.map((a) => a.addon_id);
  const addonRows = addonIds.length
    ? await prisma.addon.findMany({ where: { id: { in: addonIds } } })
    : [];
  const addonById = new Map(addonRows.map((a) => [a.id, a]));
  const lineItems: { addonId: string; name: string; quantity: number; priceAtTime: number }[] = [];
  let addonTotal = 0;

  for (const item of params.addons) {
    const addon = addonById.get(item.addon_id);
    if (!addon) {
      return { ok: false, error: "One of the selected add-ons is no longer available." };
    }
    if (!Number.isInteger(item.quantity) || item.quantity < 1) {
      return { ok: false, error: "Please enter a valid add-on quantity." };
    }
    lineItems.push({
      addonId: addon.id,
      name: addon.name,
      quantity: item.quantity,
      priceAtTime: addon.price,
    });
    addonTotal += addon.price * item.quantity;
  }

  const tourGroupPrices = tour.group_prices && Array.isArray(tour.group_prices)
    ? (tour.group_prices as { min_people: number; max_people: number; price_per_person: number }[])
    : null;
  const tourTotal = calculateTourTotal(tour.base_price, tourGroupPrices, params.numPeople);
  const totalAmount = round2(tourTotal + addonTotal);
  const currency = toCurrency(tour.currency);

  // --- Create the booking (PENDING_PAYMENT) ---
  const booking = await prisma.booking.create({
    data: {
      user_id: params.userId,
      tour_id: tour.id,
      tour_date: parsedDate,
      num_people: params.numPeople,
      total_amount: totalAmount,
      currency,
      payment_method: params.paymentMethod,
      addons: {
        create: lineItems.map((li) => ({
          addon_id: li.addonId,
          quantity: li.quantity,
          price_at_time: li.priceAtTime,
        })),
      },
    },
    include: { addons: true, tour: { select: { title: true } } },
  });

  // --- Stripe: create a PaymentIntent that carries the booking id as metadata ---
  let clientSecret: string | null = null;
  if (params.paymentMethod === PAYMENT_METHODS.STRIPE) {
    try {
      const { stripe } = await import("@/core/lib/stripe");
      const intent = await stripe().paymentIntents.create({
        amount: Math.round(totalAmount * 100),
        currency: currency.toLowerCase(),
        metadata: {
          booking_id: booking.id,
          ...(params.gaClientId ? { ga_client_id: params.gaClientId } : {}),
          // Consent flag + browser/click ids let the Stripe webhook decide
          // whether to send the Meta Purchase event — same as GA4.
          ...(params.metaConsent ? { meta_consent: "1" } : {}),
          ...(params.fbp ? { fbp: params.fbp } : {}),
          ...(params.fbc ? { fbc: params.fbc } : {}),
        },
        automatic_payment_methods: { enabled: true },
      });
      clientSecret = intent.client_secret;
    } catch {
      return {
        ok: false,
        error:
          "Stripe could not be reached. Please try again or choose bank transfer.",
        booking: toBookingDto(booking, currency, booking.tour.title),
      };
    }
  }

  // Meta InitiateCheckout is fired from the client on the tour page "Book Now"
  // / "View tour" CTA clicks (shared event_id via the CAPI proxy) — NOT here,
  // to avoid double-counting. Consent + fbp/fbc are only carried into the
  // PaymentIntent metadata for the server-side Purchase event below.

  await sendBookingConfirmationEmail(params.userId, booking, currency, params.paymentMethod);

  return {
    ok: true,
    booking: toBookingDto(booking, currency, booking.tour.title),
    paymentIntentClientSecret: clientSecret,
  };
}

/** Called by the Stripe webhook when a PaymentIntent succeeds. Idempotent. */
export async function confirmBookingFromStripe(
  paymentIntentId: string,
): Promise<{ ok: boolean }> {
  const { stripe } = await import("@/core/lib/stripe");
  const intent = await stripe().paymentIntents.retrieve(paymentIntentId);
  const bookingId = intent.metadata?.booking_id;
  if (!bookingId) {
    return { ok: false };
  }

  const updated = await prisma.booking.updateMany({
    where: { id: bookingId, status: "PENDING_PAYMENT" },
    data: { status: "CONFIRMED" },
  });

  if (updated.count > 0) {
    const { ensureInvoiceForBooking } = await import("@/features/invoice/service");
    let invoiceOk = true;
    try {
      invoiceOk = (await ensureInvoiceForBooking(bookingId)) !== null;
    } catch {
      // A failed invoice creation must not break the payment confirmation.
      invoiceOk = false;
    }
    if (!invoiceOk) {
      console.error(
        `[invoice] could not create invoice for confirmed booking ${bookingId}`,
      );
    }
  }

  // Attempt GA4 purchase delivery on every successful payment intent (the
  // claim below is idempotent, so only the first delivery ever sends the
  // event). GA4 failures must never break or roll back the booking
  // confirmation, so this is fully guarded.
  try {
    await deliverGa4Purchase(bookingId, intent.metadata?.ga_client_id);
  } catch (err) {
    console.error(
      `[analytics] unexpected GA4 purchase delivery error for booking ${bookingId}:`,
      err instanceof Error ? err.message : err,
    );
  }

  // Attempt Meta CAPI purchase delivery. The event_id equals the booking id,
  // so Meta deduplicates webhook retries; consent is taken from the
  // PaymentIntent metadata captured at checkout.
  try {
    await deliverMetaPurchase(bookingId, intent.metadata);
  } catch (err) {
    console.error(
      `[meta-capi] unexpected Meta purchase delivery error for booking ${bookingId}:`,
      err instanceof Error ? err.message : err,
    );
  }

  return { ok: updated.count > 0 };
}

/* ---------------------------------------------------------------------------
 * GA4 purchase delivery (Measurement Protocol)
 *
 * State machine on the booking:
 *   NOT_SENT  → event has not been sent yet
 *   SENDING   → a delivery attempt is in flight (claimed)
 *   SENT      → GA4 confirmed the event (response validated)
 *
 * Concurrency: the claim is a single atomic UPDATE ... WHERE statement, so
 * two concurrent/retried webhook deliveries can never both claim the same
 * booking. Only one request transitions NOT_SENT → SENDING; the others match
 * zero rows and skip.
 *
 * GA4 failure (bad status, timeout, missing secret): the booking is returned
 * to NOT_SENT and the failure is logged. There is no guaranteed automated
 * retry in the current application (no queue/cron exists); a future delivery
 * mechanism (admin action, manual tool) can re-claim NOT_SENT bookings.
 *
 * Crash safety: a SENDING claim older than five minutes is treated as stale
 * (the process died mid-delivery) and may be re-claimed by a later attempt.
 * ------------------------------------------------------------------------ */

const GA_STALE_SENDING_MS = 5 * 60 * 1000;

async function deliverGa4Purchase(
  bookingId: string,
  clientId?: string,
): Promise<void> {
  const claimTime = new Date();

  const claimed = await prisma.booking.updateMany({
    where: {
      id: bookingId,
      OR: [
        { ga_purchase_status: "NOT_SENT" },
        {
          ga_purchase_status: "SENDING",
          ga_purchase_sent_at: {
            lt: new Date(claimTime.getTime() - GA_STALE_SENDING_MS),
          },
        },
      ],
    },
    data: { ga_purchase_status: "SENDING", ga_purchase_sent_at: claimTime },
  });

  if (claimed.count === 0) {
    // Already claimed, in flight, or delivered. Skip.
    return;
  }

  let booking;
  try {
    booking = await prisma.booking.findUniqueOrThrow({
      where: { id: bookingId },
      include: {
        tour: { select: { title: true, base_price: true } },
        addons: { include: { addon: { select: { id: true, name: true } } } },
      },
    });
  } catch (err) {
    console.error(
      `[analytics] could not load booking ${bookingId} for GA4 purchase:`,
      err instanceof Error ? err.message : err,
    );
    await resetGaPurchaseStatus(bookingId);
    return;
  }

  const { sendServerEvent } = await import("@/core/lib/analytics");

  const delivered = await sendServerEvent(
    "purchase",
    {
      transaction_id: booking.id,
      value: booking.total_amount,
      currency: booking.currency,
      items: [
        {
          item_id: booking.tour_id,
          item_name: booking.tour.title,
          price: booking.tour.base_price,
          quantity: booking.num_people,
        },
        ...booking.addons.map((a) => ({
          item_id: a.addon.id,
          item_name: a.addon.name,
          price: a.price_at_time,
          quantity: a.quantity,
        })),
      ],
    },
    clientId,
  );

  if (delivered) {
    await prisma.booking.update({
      where: { id: bookingId },
      data: { ga_purchase_status: "SENT", ga_purchase_sent_at: new Date() },
    });
    return;
  }

  await resetGaPurchaseStatus(bookingId);
  console.error(
    `[analytics] GA4 purchase for booking ${bookingId} was NOT delivered. ` +
      "Booking left in NOT_SENT for a future delivery attempt (Stripe webhook " +
      "retries are NOT guaranteed); current application has no automated retry.",
  );
}

async function resetGaPurchaseStatus(bookingId: string): Promise<void> {
  try {
    await prisma.booking.update({
      where: { id: bookingId },
      data: { ga_purchase_status: "NOT_SENT" },
    });
  } catch {
    // Best effort — never throw from analytics bookkeeping.
  }
}

/** Marks a bank-transfer booking as awaiting manual receipt review. */
export async function markBookingReceiptSubmitted(
  bookingId: string,
  userId: string,
  receiptUrl: string,
): Promise<{ ok: boolean; error?: string }> {
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, user_id: userId },
  });
  if (!booking) {
    return { ok: false, error: "Booking not found." };
  }
  if (booking.payment_method !== PAYMENT_METHODS.BANK_TRANSFER) {
    return { ok: false, error: "This booking does not use bank transfer payment." };
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: { receipt_image_url: receiptUrl, status: "PENDING_RECEIPT_REVIEW" },
  });

  return { ok: true };
}

/* ---------------------------------------------------------------------------
 * Meta CAPI delivery
 *
 * Consent model: Meta events only fire when `meta_consent: true` reached the
 * Booking/PaymentIntent (set from the browser cookie-consent gate). The
 * `event_id` always mirrors the browser event so Meta deduplicates.
 * ------------------------------------------------------------------------ */

async function deliverMetaPurchase(
  bookingId: string,
  metadata?: Record<string, string>,
): Promise<void> {
  if (metadata?.meta_consent !== "1") {
    // Visitor never accepted marketing cookies — respect the gate.
    return;
  }

  let booking;
  try {
    booking = await prisma.booking.findUniqueOrThrow({
      where: { id: bookingId },
      include: {
        tour: { select: { title: true, slug: true } },
        addons: { include: { addon: { select: { id: true } } } },
      },
    });
  } catch (err) {
    console.error(
      `[meta-capi] could not load booking ${bookingId} for Purchase:`,
      err instanceof Error ? err.message : err,
    );
    return;
  }

  const userData = await getMetaUserData(booking.user_id);

  const delivered = await sendMetaServerEvent({
    eventName: "Purchase",
    eventId: bookingId,
    userData,
    customData: {
      currency: booking.currency,
      value: booking.total_amount,
      content_type: "product",
      content_ids: [booking.tour_id, ...booking.addons.map((a) => a.addon.id)],
      content_name: booking.tour.title,
      num_items: booking.num_people,
    },
    eventSourceUrl: `${SITE_URL}/tours/${booking.tour.slug}`,
    fbp: metadata?.fbp,
    fbc: metadata?.fbc,
  });
  if (!delivered) {
    console.error(
      `[meta-capi] Purchase for booking ${bookingId} was NOT delivered.`,
    );
  }
}

async function getMetaUserData(
  userId: string,
): Promise<MetaServerUserData | undefined> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true, phone: true },
  });
  if (!user) return undefined;
  const out: MetaServerUserData = {};
  if (user.email) out.em = user.email;
  if (user.phone) out.ph = user.phone;
  if (user.name) {
    const { fn, ln } = splitMetaName(user.name);
    if (fn) out.fn = fn;
    if (ln) out.ln = ln;
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

// --- Helpers ---

function calculateTourTotal(
  basePrice: number,
  groupPrices: { min_people: number; max_people: number; price_per_person: number }[] | null,
  numPeople: number,
): number {
  if (!groupPrices || groupPrices.length === 0) {
    return basePrice * numPeople;
  }
  // Find matching tier
  const tier = groupPrices.find(
    (t) => numPeople >= t.min_people && numPeople <= t.max_people,
  );
  if (tier) {
    return tier.price_per_person * numPeople;
  }
  // No matching tier — fall back to base price
  return basePrice * numPeople;
}

function toBookingDto(
  booking: {
    id: string;
    user_id: string;
    tour_id: string;
    tour_date: Date;
    num_people: number;
    total_amount: number;
    currency: Currency;
    status: string;
    payment_method: string;
    receipt_image_url: string | null;
    created_at: Date;
    addons: unknown[];
  },
  currency: Currency,
  tourTitle: string,
): BookingDto {
  return {
    id: booking.id,
    tour_id: booking.tour_id,
    tour_title: tourTitle,
    tour_date: booking.tour_date,
    num_people: booking.num_people,
    total_amount: booking.total_amount,
    currency,
    status: booking.status as BookingDto["status"],
    payment_method: booking.payment_method as PaymentMethod,
    receipt_image_url: booking.receipt_image_url,
    addons: (booking.addons as BookingAddonDb[]).map((a) => ({
      addon_id: a.addon_id,
      name: a.name,
      quantity: a.quantity,
      price_at_time: a.price_at_time,
    })),
    created_at: booking.created_at,
  };
}

interface BookingAddonDb {
  addon_id: string;
  name: string;
  quantity: number;
  price_at_time: number;
}

async function sendBookingConfirmationEmail(
  userId: string,
  booking: { user_id: string; tour: { title: string }; tour_date: Date; num_people: number; total_amount: number },
  currency: Currency,
  paymentMethod: PaymentMethod,
) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return;
  }
  const { sendEmail } = await import("@/core/lib/resend");
  const { bookingConfirmationEmailHtml } = await import("./emails");
  const { formatCurrency } = await import("@/core/utils");
  const { formatDate } = await import("@/core/utils");

  const statusLabel =
    paymentMethod === PAYMENT_METHODS.BANK_TRANSFER
      ? "Pending receipt review"
      : "Pending payment";

  await sendEmail({
    to: user.email,
    subject: `Booking received — ${booking.tour.title}`,
    html: bookingConfirmationEmailHtml({
      name: user.name,
      tourTitle: booking.tour.title,
      tourDate: formatDate(booking.tour_date),
      numPeople: booking.num_people,
      totalAmount: formatCurrency(booking.total_amount, currency),
      statusLabel,
    }),
  });
}

function parseDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return null;
  }
  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  if (
    date.getFullYear() !== Number(year) ||
    date.getMonth() !== Number(month) - 1 ||
    date.getDate() !== Number(day)
  ) {
    return null;
  }
  return date;
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function toCurrency(value: string): Currency {
  if (value === "USD" || value === "GBP" || value === "EUR") {
    return value;
  }
  return "USD";
}
