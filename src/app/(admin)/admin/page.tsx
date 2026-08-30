import {
  DollarSign,
  CalendarDays,
  Clock,
  Map,
} from "lucide-react";
import {
  getDashboardStats,
  getRevenueChart,
  getBookingsByStatus,
  getTopSellingTours,
  getRecentBookings,
} from "@/features/admin/service";
import { RevenueChart } from "@/features/admin/components/RevenueChart";
import { BookingsByStatusChart } from "@/features/admin/components/BookingsByStatusChart";
import { TopToursTable } from "@/features/admin/components/TopToursTable";
import { RecentBookingsTable } from "@/features/admin/components/RecentBookingsTable";
import { CURRENCY_SYMBOLS, type Currency } from "@/core/constants/currencies";

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

  const statCards = [
    {
      label: "Total Revenue",
      value: `$${stats.total_revenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      description: "Confirmed bookings only",
    },
    {
      label: "Total Bookings",
      value: stats.total_bookings.toString(),
      icon: CalendarDays,
      description: "All statuses",
    },
    {
      label: "Pending Review",
      value: stats.pending_review.toString(),
      icon: Clock,
      description: "Awaiting receipt approval",
    },
    {
      label: "Active Tours",
      value: stats.active_tours.toString(),
      icon: Map,
      description: "Open for booking",
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Admin Overview
        </h1>
        <p className="text-sm text-muted-foreground">
          Platform-wide statistics and recent activity.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-2xl border bg-card p-5"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </p>
                <Icon className="size-4 text-muted-foreground" aria-hidden />
              </div>
              <p className="mt-2 text-3xl font-semibold">{stat.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {stat.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueChart data={revenue} />
        </div>
        <div>
          <BookingsByStatusChart data={bookingsByStatus} />
        </div>
      </div>

      {/* Tables Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <TopToursTable tours={topTours} />
        <RecentBookingsTable bookings={recentBookings} />
      </div>
    </div>
  );
}
