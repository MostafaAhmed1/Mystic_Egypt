import "server-only";
import { prisma } from "@/core/lib/prisma";
import type { Currency } from "@/core/constants/currencies";
import type { BookingStatus } from "@/core/constants/booking";
import bcrypt from "bcryptjs";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TourListItem {
  id: string;
  title: string;
  slug: string;
  base_price: number;
  currency: Currency;
  status: string;
  booking_count: number;
  created_at: Date;
}

export interface TourDetail {
  id: string;
  title: string;
  slug: string;
  description: string;
  inclusions: string | null;
  exclusions: string | null;
  base_price: number;
  currency: Currency;
  status: string;
  created_by: string;
  created_at: Date;
  itinerary: { id: string; day_number: number; title: string; description: string }[];
  images: { id: string; image_url: string; is_primary: boolean }[];
  route: { id: string; order: number; label: string; lat: number; lng: number; is_stop: boolean }[];
}

export interface CreateTourParams {
  title: string;
  slug: string;
  description: string;
  inclusions?: string;
  exclusions?: string;
  base_price: number;
  currency?: Currency;
  status?: string;
  itinerary: { day_number: number; title: string; description: string }[];
  images: { image_url: string; is_primary: boolean }[];
  route: { order: number; label: string; lat: number; lng: number; is_stop: boolean }[];
}

export interface UpdateTourParams extends Partial<Omit<CreateTourParams, "itinerary" | "images" | "route">> {
  itinerary?: { day_number: number; title: string; description: string }[];
  images?: { image_url: string; is_primary: boolean }[];
  route?: { order: number; label: string; lat: number; lng: number; is_stop: boolean }[];
}

export interface BookingListItem {
  id: string;
  user_name: string;
  user_email: string;
  tour_title: string;
  tour_date: Date;
  num_people: number;
  total_amount: number;
  currency: Currency;
  status: BookingStatus;
  payment_method: string;
  receipt_image_url: string | null;
  created_at: Date;
}

export interface BookingDetail extends BookingListItem {
  tour_id: string;
  addons: { name: string; quantity: number; price_at_time: number }[];
  invoice_number: string | null;
}

export interface DashboardStats {
  total_revenue: number;
  total_bookings: number;
  pending_review: number;
  active_tours: number;
}

export interface RevenueChartPoint {
  date: string;
  revenue: number;
  bookings: number;
}

export interface BookingStatusCount {
  status: string;
  count: number;
}

export interface TopTour {
  tour_id: string;
  tour_title: string;
  booking_count: number;
  revenue: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  is_2fa_verified: boolean;
  created_at: Date;
}

export interface CreateAdminParams {
  name: string;
  email: string;
  password: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toCurrency(v: string): Currency {
  return v === "USD" || v === "GBP" || v === "EUR" ? v : "USD";
}

function toBookingStatus(v: string): BookingStatus {
  const valid = [
    "PENDING_PAYMENT",
    "PENDING_RECEIPT_REVIEW",
    "CONFIRMED",
    "COMPLETED",
    "CANCELLED",
  ] as const;
  return valid.includes(v as (typeof valid)[number]) ? (v as BookingStatus) : "PENDING_PAYMENT";
}

const TOUR_LIST_SELECT = {
  id: true,
  title: true,
  slug: true,
  base_price: true,
  currency: true,
  status: true,
  created_at: true,
  _count: { select: { bookings: true } },
} as const;

const BOOKING_LIST_SELECT = {
  id: true,
  num_people: true,
  total_amount: true,
  currency: true,
  status: true,
  payment_method: true,
  receipt_image_url: true,
  tour_date: true,
  created_at: true,
  user: { select: { name: true, email: true } },
  tour: { select: { title: true } },
} as const;

// ---------------------------------------------------------------------------
// Tour Management
// ---------------------------------------------------------------------------

export async function listTours(params: {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}): Promise<{ items: TourListItem[]; total: number; page: number; limit: number }> {
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(100, Math.max(1, params.limit ?? 20));
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (params.search) {
    where.OR = [
      { title: { contains: params.search } },
      { slug: { contains: params.search } },
    ];
  }
  if (params.status) {
    where.status = params.status;
  }

  const [rows, total] = await Promise.all([
    prisma.tour.findMany({
      where,
      select: TOUR_LIST_SELECT,
      orderBy: { created_at: "desc" },
      skip,
      take: limit,
    }),
    prisma.tour.count({ where }),
  ]);

  return {
    items: rows.map((r) => ({
      id: r.id,
      title: r.title,
      slug: r.slug,
      base_price: r.base_price,
      currency: toCurrency(r.currency),
      status: r.status,
      booking_count: r._count.bookings,
      created_at: r.created_at,
    })),
    total,
    page,
    limit,
  };
}

export async function getTourById(id: string): Promise<TourDetail | null> {
  const tour = await prisma.tour.findUnique({
    where: { id },
    include: {
      itinerary: { orderBy: { day_number: "asc" } },
      images: { orderBy: { is_primary: "desc" } },
      route: { orderBy: { order: "asc" } },
    },
  });
  if (!tour) return null;
  return {
    id: tour.id,
    title: tour.title,
    slug: tour.slug,
    description: tour.description,
    inclusions: tour.inclusions,
    exclusions: tour.exclusions,
    base_price: tour.base_price,
    currency: toCurrency(tour.currency),
    status: tour.status,
    created_by: tour.created_by,
    created_at: tour.created_at,
    itinerary: tour.itinerary.map((i) => ({
      id: i.id,
      day_number: i.day_number,
      title: i.title,
      description: i.description,
    })),
    images: tour.images.map((img) => ({
      id: img.id,
      image_url: img.image_url,
      is_primary: img.is_primary,
    })),
    route: tour.route.map((r) => ({
      id: r.id,
      order: r.order,
      label: r.label,
      lat: r.lat,
      lng: r.lng,
      is_stop: r.is_stop,
    })),
  };
}

export async function createTour(
  params: CreateTourParams,
  adminId: string,
): Promise<TourDetail> {
  const tour = await prisma.tour.create({
    data: {
      title: params.title,
      slug: params.slug,
      description: params.description,
      inclusions: params.inclusions ?? null,
      exclusions: params.exclusions ?? null,
      base_price: params.base_price,
      currency: params.currency ?? "USD",
      status: params.status ?? "open",
      created_by: adminId,
      itinerary: {
        create: params.itinerary.map((i) => ({
          day_number: i.day_number,
          title: i.title,
          description: i.description,
        })),
      },
      images: {
        create: params.images.map((img) => ({
          image_url: img.image_url,
          is_primary: img.is_primary,
        })),
      },
      route: {
        create: params.route.map((r) => ({
          order: r.order,
          label: r.label,
          lat: r.lat,
          lng: r.lng,
          is_stop: r.is_stop,
        })),
      },
    },
    include: {
      itinerary: { orderBy: { day_number: "asc" } },
      images: { orderBy: { is_primary: "desc" } },
      route: { orderBy: { order: "asc" } },
    },
  });

  return {
    id: tour.id,
    title: tour.title,
    slug: tour.slug,
    description: tour.description,
    inclusions: tour.inclusions,
    exclusions: tour.exclusions,
    base_price: tour.base_price,
    currency: toCurrency(tour.currency),
    status: tour.status,
    created_by: tour.created_by,
    created_at: tour.created_at,
    itinerary: tour.itinerary.map((i) => ({
      id: i.id,
      day_number: i.day_number,
      title: i.title,
      description: i.description,
    })),
    images: tour.images.map((img) => ({
      id: img.id,
      image_url: img.image_url,
      is_primary: img.is_primary,
    })),
    route: tour.route.map((r) => ({
      id: r.id,
      order: r.order,
      label: r.label,
      lat: r.lat,
      lng: r.lng,
      is_stop: r.is_stop,
    })),
  };
}

export async function updateTour(
  id: string,
  params: UpdateTourParams,
): Promise<TourDetail> {
  const data: Record<string, unknown> = {};
  if (params.title !== undefined) data.title = params.title;
  if (params.slug !== undefined) data.slug = params.slug;
  if (params.description !== undefined) data.description = params.description;
  if (params.inclusions !== undefined) data.inclusions = params.inclusions ?? null;
  if (params.exclusions !== undefined) data.exclusions = params.exclusions ?? null;
  if (params.base_price !== undefined) data.base_price = params.base_price;
  if (params.currency !== undefined) data.currency = params.currency;
  if (params.status !== undefined) data.status = params.status;

  // Replace nested relations if provided
  if (params.itinerary) {
    await prisma.tourItinerary.deleteMany({ where: { tour_id: id } });
    await prisma.tourItinerary.createMany({
      data: params.itinerary.map((i) => ({
        tour_id: id,
        day_number: i.day_number,
        title: i.title,
        description: i.description,
      })),
    });
  }
  if (params.images) {
    await prisma.tourImage.deleteMany({ where: { tour_id: id } });
    await prisma.tourImage.createMany({
      data: params.images.map((img) => ({
        tour_id: id,
        image_url: img.image_url,
        is_primary: img.is_primary,
      })),
    });
  }
  if (params.route) {
    await prisma.tourPoint.deleteMany({ where: { tour_id: id } });
    await prisma.tourPoint.createMany({
      data: params.route.map((r) => ({
        tour_id: id,
        order: r.order,
        label: r.label,
        lat: r.lat,
        lng: r.lng,
        is_stop: r.is_stop,
      })),
    });
  }

  const updated = await prisma.tour.update({
    where: { id },
    data,
    include: {
      itinerary: { orderBy: { day_number: "asc" } },
      images: { orderBy: { is_primary: "desc" } },
      route: { orderBy: { order: "asc" } },
    },
  });

  return {
    id: updated.id,
    title: updated.title,
    slug: updated.slug,
    description: updated.description,
    inclusions: updated.inclusions,
    exclusions: updated.exclusions,
    base_price: updated.base_price,
    currency: toCurrency(updated.currency),
    status: updated.status,
    created_by: updated.created_by,
    created_at: updated.created_at,
    itinerary: updated.itinerary.map((i) => ({
      id: i.id,
      day_number: i.day_number,
      title: i.title,
      description: i.description,
    })),
    images: updated.images.map((img) => ({
      id: img.id,
      image_url: img.image_url,
      is_primary: img.is_primary,
    })),
    route: updated.route.map((r) => ({
      id: r.id,
      order: r.order,
      label: r.label,
      lat: r.lat,
      lng: r.lng,
      is_stop: r.is_stop,
    })),
  };
}

export async function deleteTour(id: string): Promise<void> {
  await prisma.tour.delete({ where: { id } });
}

export async function toggleTourStatus(id: string): Promise<string> {
  const tour = await prisma.tour.findUnique({ where: { id }, select: { status: true } });
  if (!tour) throw new Error("Tour not found.");
  const newStatus = tour.status === "open" ? "closed" : "open";
  await prisma.tour.update({ where: { id }, data: { status: newStatus } });
  return newStatus;
}

// ---------------------------------------------------------------------------
// Booking Management
// ---------------------------------------------------------------------------

export async function listBookings(params: {
  status?: string;
  payment_method?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{ items: BookingListItem[]; total: number; page: number; limit: number }> {
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(100, Math.max(1, params.limit ?? 20));
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (params.status) {
    where.status = params.status;
  }
  if (params.payment_method) {
    where.payment_method = params.payment_method;
  }
  if (params.search) {
    where.OR = [
      { user: { name: { contains: params.search } } },
      { user: { email: { contains: params.search } } },
      { tour: { title: { contains: params.search } } },
    ];
  }

  const [rows, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      select: BOOKING_LIST_SELECT,
      orderBy: { created_at: "desc" },
      skip,
      take: limit,
    }),
    prisma.booking.count({ where }),
  ]);

  return {
    items: rows.map((r) => ({
      id: r.id,
      user_name: r.user.name,
      user_email: r.user.email,
      tour_title: r.tour.title,
      tour_date: r.tour_date,
      num_people: r.num_people,
      total_amount: r.total_amount,
      currency: toCurrency(r.currency),
      status: toBookingStatus(r.status),
      payment_method: r.payment_method,
      receipt_image_url: r.receipt_image_url,
      created_at: r.created_at,
    })),
    total,
    page,
    limit,
  };
}

export async function getBookingById(id: string): Promise<BookingDetail | null> {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true } },
      tour: { select: { id: true, title: true } },
      addons: {
        include: { addon: { select: { name: true } } },
      },
      invoice: { select: { invoice_number: true } },
    },
  });
  if (!booking) return null;
  return {
    id: booking.id,
    user_name: booking.user.name,
    user_email: booking.user.email,
    tour_id: booking.tour.id,
    tour_title: booking.tour.title,
    tour_date: booking.tour_date,
    num_people: booking.num_people,
    total_amount: booking.total_amount,
    currency: toCurrency(booking.currency),
    status: toBookingStatus(booking.status),
    payment_method: booking.payment_method,
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

const VALID_TRANSITIONS: Record<string, string[]> = {
  PENDING_RECEIPT_REVIEW: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["COMPLETED", "CANCELLED"],
};

export async function updateBookingStatus(
  id: string,
  newStatus: string,
): Promise<void> {
  const booking = await prisma.booking.findUnique({
    where: { id },
    select: { status: true },
  });
  if (!booking) throw new Error("Booking not found.");

  const allowed = VALID_TRANSITIONS[booking.status];
  if (!allowed || !allowed.includes(newStatus)) {
    throw new Error(
      `Cannot transition from ${booking.status} to ${newStatus}.`,
    );
  }

  await prisma.booking.update({
    where: { id },
    data: { status: newStatus as BookingStatus },
  });

  // If transitioning to CONFIRMED, ensure invoice exists
  if (newStatus === "CONFIRMED") {
    const existing = await prisma.invoice.findUnique({ where: { booking_id: id } });
    if (!existing) {
      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
      const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
      const invoiceNumber = `ME-${dateStr}-${rand}`;
      await prisma.invoice.create({
        data: { booking_id: id, invoice_number: invoiceNumber },
      });
    }
  }
}

// ---------------------------------------------------------------------------
// Dashboard Analytics
// ---------------------------------------------------------------------------

export async function getDashboardStats(): Promise<DashboardStats> {
  const [totalRevenue, totalBookings, pendingReview, activeTours] = await Promise.all([
    prisma.booking.aggregate({
      _sum: { total_amount: true },
      where: { status: "CONFIRMED" },
    }),
    prisma.booking.count(),
    prisma.booking.count({ where: { status: "PENDING_RECEIPT_REVIEW" } }),
    prisma.tour.count({ where: { status: "open" } }),
  ]);

  return {
    total_revenue: totalRevenue._sum.total_amount ?? 0,
    total_bookings: totalBookings,
    pending_review: pendingReview,
    active_tours: activeTours,
  };
}

export async function getRevenueChart(
  period: "daily" | "weekly" | "monthly",
): Promise<RevenueChartPoint[]> {
  const now = new Date();
  let startDate: Date;

  if (period === "daily") {
    startDate = new Date(now);
    startDate.setDate(startDate.getDate() - 30);
  } else if (period === "weekly") {
    startDate = new Date(now);
    startDate.setDate(startDate.getDate() - 12 * 7);
  } else {
    startDate = new Date(now);
    startDate.setMonth(startDate.getMonth() - 12);
  }

  const bookings = await prisma.booking.findMany({
    where: {
      status: "CONFIRMED",
      created_at: { gte: startDate },
    },
    select: { total_amount: true, created_at: true },
    orderBy: { created_at: "asc" },
  });

  // Group by period
  const grouped: Record<string, { revenue: number; bookings: number }> = {};
  for (const b of bookings) {
    let key: string;
    if (period === "daily") {
      key = b.created_at.toISOString().slice(0, 10);
    } else if (period === "weekly") {
      const d = new Date(b.created_at);
      const dayOfWeek = d.getDay();
      const monday = new Date(d);
      monday.setDate(monday.getDate() - ((dayOfWeek + 6) % 7));
      key = monday.toISOString().slice(0, 10);
    } else {
      key = b.created_at.toISOString().slice(0, 7);
    }
    if (!grouped[key]) grouped[key] = { revenue: 0, bookings: 0 };
    grouped[key].revenue += b.total_amount;
    grouped[key].bookings += 1;
  }

  return Object.entries(grouped).map(([date, v]) => ({
    date,
    revenue: v.revenue,
    bookings: v.bookings,
  }));
}

export async function getBookingsByStatus(): Promise<BookingStatusCount[]> {
  const counts = await prisma.booking.groupBy({
    by: ["status"],
    _count: { id: true },
  });
  return counts.map((c) => ({
    status: c.status,
    count: c._count.id,
  }));
}

export async function getTopSellingTours(limit = 5): Promise<TopTour[]> {
  const results = await prisma.booking.groupBy({
    by: ["tour_id"],
    _count: { id: true },
    _sum: { total_amount: true },
    where: { status: { in: ["CONFIRMED", "COMPLETED"] } },
    orderBy: { _count: { id: "desc" } },
    take: limit,
  });

  const tourIds = results.map((r) => r.tour_id);
  const tours = await prisma.tour.findMany({
    where: { id: { in: tourIds } },
    select: { id: true, title: true },
  });
  const tourMap = new Map(tours.map((t) => [t.id, t.title]));

  return results.map((r) => ({
    tour_id: r.tour_id,
    tour_title: tourMap.get(r.tour_id) ?? "Unknown",
    booking_count: r._count.id,
    revenue: r._sum.total_amount ?? 0,
  }));
}

export async function getRecentBookings(limit = 10): Promise<BookingListItem[]> {
  const rows = await prisma.booking.findMany({
    select: BOOKING_LIST_SELECT,
    orderBy: { created_at: "desc" },
    take: limit,
  });
  return rows.map((r) => ({
    id: r.id,
    user_name: r.user.name,
    user_email: r.user.email,
    tour_title: r.tour.title,
    tour_date: r.tour_date,
    num_people: r.num_people,
    total_amount: r.total_amount,
    currency: toCurrency(r.currency),
    status: toBookingStatus(r.status),
    payment_method: r.payment_method,
    receipt_image_url: r.receipt_image_url,
    created_at: r.created_at,
  }));
}

// ---------------------------------------------------------------------------
// Admin Management
// ---------------------------------------------------------------------------

export async function listAdmins(): Promise<AdminUser[]> {
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: {
      id: true,
      name: true,
      email: true,
      is_2fa_verified: true,
      created_at: true,
    },
    orderBy: { created_at: "asc" },
  });
  return admins.map((a) => ({
    id: a.id,
    name: a.name,
    email: a.email,
    is_2fa_verified: a.is_2fa_verified,
    created_at: a.created_at,
  }));
}

export async function createAdmin(
  params: CreateAdminParams,
): Promise<AdminUser> {
  const existing = await prisma.user.findUnique({ where: { email: params.email } });
  if (existing) {
    throw new Error("A user with this email already exists.");
  }

  const passwordHash = await bcrypt.hash(params.password, 10);
  const admin = await prisma.user.create({
    data: {
      name: params.name,
      email: params.email,
      password_hash: passwordHash,
      role: "ADMIN",
      email_verified: true,
    },
    select: {
      id: true,
      name: true,
      email: true,
      is_2fa_verified: true,
      created_at: true,
    },
  });

  return {
    id: admin.id,
    name: admin.name,
    email: admin.email,
    is_2fa_verified: admin.is_2fa_verified,
    created_at: admin.created_at,
  };
}
