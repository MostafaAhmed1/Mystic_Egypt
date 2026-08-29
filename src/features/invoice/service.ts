import "server-only";
import { prisma } from "@/core/lib/prisma";
import type { Currency } from "@/core/constants/currencies";
import { BOOKING_STATUSES } from "@/core/constants/booking";

// Invoice business logic. A unique Invoice row is created once a booking is
// CONFIRMED. PDF rendering happens browser-side in @react-pdf/renderer, so the
// row carries the identity (invoice_number, issued_at) plus the booking snapshot
// needed to build the PDF without extra lookups.

export interface InvoiceLineItem {
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface InvoiceDto {
  id: string;
  booking_id: string;
  invoice_number: string;
  issued_at: Date;
  booking: {
    id: string;
    tour_title: string;
    tour_date: Date;
    num_people: number;
    base_price: number;
    currency: Currency;
    payment_method: string;
    created_at: Date;
    addons: InvoiceLineItem[];
  };
  tourSubtotal: number;
  addonsTotal: number;
  grandTotal: number;
}

/**
 * Creates the Invoice row for a booking if it does not already exist.
 * Only meaningful for CONFIRMED bookings. Idempotent (returns the existing
 * invoice on re-entry). Called from the confirmation paths (Stripe webhook in
 * M4; admin receipt approval in M6).
 */
export async function ensureInvoiceForBooking(
  bookingId: string,
): Promise<InvoiceDto | null> {
  const existing = await prisma.invoice.findUnique({
    where: { booking_id: bookingId },
  });
  if (existing) {
    return loadInvoiceDto(existing.booking_id);
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      tour: { select: { title: true, base_price: true, currency: true } },
      addons: { include: { addon: { select: { name: true } } } },
    },
  });
  if (!booking || booking.status !== BOOKING_STATUSES.CONFIRMED) {
    return null;
  }

  try {
    await prisma.invoice.create({
      data: {
        booking_id: bookingId,
        invoice_number: generateInvoiceNumber(),
      },
    });
  } catch {
    // Unique constraint collision or a concurrent create; fall back to lookup.
    const again = await prisma.invoice.findUnique({
      where: { booking_id: bookingId },
    });
    if (again) {
      return loadInvoiceDto(bookingId);
    }
    throw new Error("Could not create invoice for booking.");
  }

  return loadInvoiceDto(bookingId);
}

/** Single invoice for a booking the user owns (ownership-checked). */
export async function getInvoiceByBooking(
  bookingId: string,
  userId: string,
): Promise<InvoiceDto | null> {
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, user_id: userId },
    select: { id: true },
  });
  if (!booking) {
    return null;
  }
  const invoice = await prisma.invoice.findUnique({
    where: { booking_id: bookingId },
  });
  if (!invoice) {
    return null;
  }
  return loadInvoiceDto(bookingId);
}

/**
 * Ensures (and returns) the invoice for a booking owned by the user, but only
 * once the booking is CONFIRMED. Idempotent. Used by the dashboard booking
 * detail page so any confirmed booking always has a downloadable invoice.
 */
export async function getOrCreateInvoiceForOwnedBooking(
  bookingId: string,
  userId: string,
): Promise<InvoiceDto | null> {
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, user_id: userId },
    select: { id: true, status: true },
  });
  if (!booking) {
    return null;
  }
  if (booking.status !== BOOKING_STATUSES.CONFIRMED) {
    return null;
  }
  return ensureInvoiceForBooking(bookingId);
}

/** All invoices for the user's confirmed bookings (dashboard invoice tab). */
export async function listUserInvoices(
  userId: string,
): Promise<InvoiceDto[]> {
  const rows = await prisma.invoice.findMany({
    where: { booking: { user_id: userId } },
    orderBy: { issued_at: "desc" },
  });
  const invoices: InvoiceDto[] = [];
  for (const row of rows) {
    const dto = await loadInvoiceDto(row.booking_id);
    if (dto) {
      invoices.push(dto);
    }
  }
  return invoices;
}

// --- Helpers ---

async function loadInvoiceDto(
  bookingId: string,
): Promise<InvoiceDto | null> {
  const invoice = await prisma.invoice.findUnique({
    where: { booking_id: bookingId },
  });
  if (!invoice) {
    return null;
  }
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      tour: { select: { title: true, base_price: true, currency: true } },
      addons: { include: { addon: { select: { name: true } } } },
    },
  });
  if (!booking) {
    return null;
  }

  const currency = normalizeCurrency(booking.tour.currency);
  const addons: InvoiceLineItem[] = booking.addons.map((a) => {
    const total = round2(a.price_at_time * a.quantity);
    return {
      name: a.addon.name,
      quantity: a.quantity,
      price: a.price_at_time,
      total,
    };
  });
  const tourSubtotal = round2(booking.tour.base_price * booking.num_people);
  const addonsTotal = round2(
    addons.reduce((sum, a) => sum + a.total, 0),
  );
  const grandTotal = round2(tourSubtotal + addonsTotal);

  return {
    id: invoice.id,
    booking_id: booking.id,
    invoice_number: invoice.invoice_number,
    issued_at: invoice.issued_at,
    booking: {
      id: booking.id,
      tour_title: booking.tour.title,
      tour_date: booking.tour_date,
      num_people: booking.num_people,
      base_price: booking.tour.base_price,
      currency,
      payment_method: booking.payment_method,
      created_at: booking.created_at,
      addons,
    },
    tourSubtotal,
    addonsTotal,
    grandTotal,
  };
}

function generateInvoiceNumber(): string {
  const now = new Date();
  const yyyymmdd = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("");
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `ME-${yyyymmdd}-${random}`;
}

function normalizeCurrency(value: string): Currency {
  if (value === "USD" || value === "GBP" || value === "EUR") {
    return value;
  }
  return "USD";
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
