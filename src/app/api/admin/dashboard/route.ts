import { NextResponse } from "next/server";
import { requireAdmin } from "@/core/lib/session";
import {
  getDashboardStats,
  getRevenueChart,
  getBookingsByStatus,
  getTopSellingTours,
  getRecentBookings,
} from "@/features/admin/service";

export async function GET(request: Request) {
  const user = await requireAdmin();
  if (user.role !== "ADMIN") {
    return NextResponse.json({ ok: false, error: "Forbidden." }, { status: 403 });
  }

  const url = new URL(request.url);
  const section = url.searchParams.get("section");

  if (section === "revenue") {
    const period = (url.searchParams.get("period") ?? "daily") as "daily" | "weekly" | "monthly";
    const data = await getRevenueChart(period);
    return NextResponse.json({ ok: true, data });
  }

  if (section === "bookings-by-status") {
    const data = await getBookingsByStatus();
    return NextResponse.json({ ok: true, data });
  }

  if (section === "top-tours") {
    const limit = parseInt(url.searchParams.get("limit") ?? "5", 10);
    const data = await getTopSellingTours(limit);
    return NextResponse.json({ ok: true, data });
  }

  if (section === "recent-bookings") {
    const limit = parseInt(url.searchParams.get("limit") ?? "10", 10);
    const data = await getRecentBookings(limit);
    return NextResponse.json({ ok: true, data });
  }

  // Default: full dashboard
  const [stats, revenue, bookingsByStatus, topTours, recentBookings] =
    await Promise.all([
      getDashboardStats(),
      getRevenueChart("daily"),
      getBookingsByStatus(),
      getTopSellingTours(),
      getRecentBookings(10),
    ]);

  return NextResponse.json({
    ok: true,
    stats,
    revenue,
    bookings_by_status: bookingsByStatus,
    top_tours: topTours,
    recent_bookings: recentBookings,
  });
}
