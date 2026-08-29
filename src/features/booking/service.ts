import "server-only";
import { prisma } from "@/core/lib/prisma";
import type { Currency } from "@/core/constants/currencies";
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
  currency: Currency;
} | null> {
  const tour = await prisma.tour.findUnique({ where: { slug } });
  if (!tour || tour.status !== "open") {
    return null;
  }
  return {
    id: tour.id,
    title: tour.title,
    slug: tour.slug,
    base_price: tour.base_price,
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

  const tourTotal = tour.base_price * params.numPeople;
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
        metadata: { booking_id: booking.id },
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

  return { ok: updated.count > 0 };
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

// --- Helpers ---

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
