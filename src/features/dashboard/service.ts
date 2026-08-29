import "server-only";
import { prisma } from "@/core/lib/prisma";
import type { Currency } from "@/core/constants/currencies";
import type { BookingStatus } from "@/core/constants/booking";
import type { PaymentMethod } from "@/features/booking/constants";

// Client dashboard data access layer. Read-only queries that power the
// bookings / invoices / profile tabs of the authenticated client dashboard.

export interface DashboardAddonDto {
  name: string;
  quantity: number;
  price_at_time: number;
}

export interface DashboardBookingDto {
  id: string;
  tour_id: string;
  tour_title: string;
  tour_slug: string;
  tour_image: string | null;
  tour_date: Date;
  num_people: number;
  total_amount: number;
  currency: Currency;
  status: BookingStatus;
  payment_method: PaymentMethod;
  receipt_image_url: string | null;
  created_at: Date;
  addons: DashboardAddonDto[];
  invoice_number: string | null;
}

export interface DashboardSummaryDto {
  total_bookings: number;
  confirmed: number;
  pending: number;
  cancelled: number;
}

/** All bookings belonging to a user, newest first (dashboard bookings tab). */
export async function listUserBookings(
  userId: string,
): Promise<DashboardBookingDto[]> {
  const rows = await prisma.booking.findMany({
    where: { user_id: userId },
    orderBy: { created_at: "desc" },
    include: {
      tour: {
        select: {
          title: true,
          slug: true,
          images: { select: { image_url: true } },
        },
      },
      addons: {
        include: { addon: { select: { name: true } } },
      },
      invoice: { select: { invoice_number: true } },
    },
  });

  return rows.map((b) => {
    const primaryImage =
      b.tour.images.find((img) => img.image_url)?.image_url ??
      b.tour.images[0]?.image_url ??
      null;
    return {
      id: b.id,
      tour_id: b.tour_id,
      tour_title: b.tour.title,
      tour_slug: b.tour.slug,
      tour_image: primaryImage,
      tour_date: b.tour_date,
      num_people: b.num_people,
      total_amount: b.total_amount,
      currency: normalizeCurrency(b.currency),
      status: b.status as BookingStatus,
      payment_method: b.payment_method as PaymentMethod,
      receipt_image_url: b.receipt_image_url,
      created_at: b.created_at,
      addons: b.addons.map((a) => ({
        name: a.addon.name,
        quantity: a.quantity,
        price_at_time: a.price_at_time,
      })),
      invoice_number: b.invoice?.invoice_number ?? null,
    };
  });
}

/** A single booking owned by the user (ownership-checked), or null. */
export async function getUserBookingById(
  bookingId: string,
  userId: string,
): Promise<DashboardBookingDto | null> {
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, user_id: userId },
    include: {
      tour: {
        select: {
          title: true,
          slug: true,
          images: { select: { image_url: true } },
        },
      },
      addons: {
        include: { addon: { select: { name: true } } },
      },
      invoice: { select: { invoice_number: true } },
    },
  });
  if (!booking) {
    return null;
  }
  const primaryImage =
    booking.tour.images.find((img) => img.image_url)?.image_url ??
    booking.tour.images[0]?.image_url ??
    null;
  return {
    id: booking.id,
    tour_id: booking.tour_id,
    tour_title: booking.tour.title,
    tour_slug: booking.tour.slug,
    tour_image: primaryImage,
    tour_date: booking.tour_date,
    num_people: booking.num_people,
    total_amount: booking.total_amount,
    currency: normalizeCurrency(booking.currency),
    status: booking.status as BookingStatus,
    payment_method: booking.payment_method as PaymentMethod,
    receipt_image_url: booking.receipt_image_url,
    created_at: booking.created_at,
    addons: booking.addons.map((a) => ({
      name: a.addon.name,
      quantity: a.quantity,
      price_at_time: a.price_at_time,
    })),
    invoice_number: booking.invoice?.invoice_number ?? null,
  };
}

/** Light aggregates shown as stat cards on the dashboard overview. */
export async function getDashboardSummary(
  userId: string,
): Promise<DashboardSummaryDto> {
  const rows = await prisma.booking.findMany({
    where: { user_id: userId },
    select: { id: true, status: true },
  });
  const summary: DashboardSummaryDto = {
    total_bookings: rows.length,
    confirmed: 0,
    pending: 0,
    cancelled: 0,
  };
  for (const row of rows) {
    if (row.status === "CONFIRMED" || row.status === "COMPLETED") {
      summary.confirmed += 1;
    } else if (row.status === "CANCELLED") {
      summary.cancelled += 1;
    } else {
      summary.pending += 1;
    }
  }
  return summary;
}

export interface ProfileDto {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  email_verified: boolean;
  notifications_enabled: boolean;
  created_at: Date;
}

/** Profile data for the dashboard profile tab. */
export async function getUserProfile(
  userId: string,
): Promise<ProfileDto | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      email_verified: true,
      notifications_enabled: true,
      created_at: true,
    },
  });
  if (!user) {
    return null;
  }
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    email_verified: user.email_verified,
    notifications_enabled: user.notifications_enabled,
    created_at: user.created_at,
  };
}

function normalizeCurrency(value: string): Currency {
  if (value === "USD" || value === "GBP" || value === "EUR") {
    return value;
  }
  return "USD";
}
