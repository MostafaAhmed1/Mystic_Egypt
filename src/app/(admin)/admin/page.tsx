import {
  getDashboardStats,
  getRevenueChart,
  getBookingsByStatus,
  getTopSellingTours,
  getRecentBookings,
} from "@/features/admin/service";
import { AdminOverviewClient } from "@/app/(admin)/admin/admin-overview-client";

export const metadata = {
  title: "Admin Overview",
};

export default async function AdminOverviewPage() {
  const [stats, revenue, bookingsByStatus, topTours, recentBookings] =
    await Promise.all([
      getDashboardStats(),
      getRevenueChart("daily"),
      getBookingsByStatus(),
      getTopSellingTours(),
      getRecentBookings(10),
    ]);

  return (
    <AdminOverviewClient
      stats={stats}
      revenue={revenue}
      bookingsByStatus={bookingsByStatus}
      topTours={topTours}
      recentBookings={recentBookings.map((b) => ({
        ...b,
        tour_date: b.tour_date instanceof Date ? b.tour_date : new Date(b.tour_date),
        created_at: b.created_at instanceof Date ? b.created_at : new Date(b.created_at),
      }))}
    />
  );
}
