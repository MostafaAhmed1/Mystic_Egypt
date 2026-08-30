"use client";

import { useTranslation } from "react-i18next";
import {
  DollarSign,
  CalendarDays,
  Clock,
  Map,
} from "lucide-react";
import { RevenueChart } from "@/features/admin/components/RevenueChart";
import { BookingsByStatusChart } from "@/features/admin/components/BookingsByStatusChart";
import { TopToursTable } from "@/features/admin/components/TopToursTable";
import { RecentBookingsTable } from "@/features/admin/components/RecentBookingsTable";

interface AdminOverviewClientProps {
  stats: {
    total_revenue: number;
    total_bookings: number;
    pending_review: number;
    active_tours: number;
  };
  revenue: { date: string; revenue: number; bookings: number }[];
  bookingsByStatus: { status: string; count: number }[];
  topTours: { tour_id: string; tour_title: string; booking_count: number; revenue: number }[];
  recentBookings: { id: string; user_name: string; user_email: string; tour_title: string; tour_date: Date; num_people: number; total_amount: number; currency: string; status: string; payment_method: string; created_at: Date }[];
}

export function AdminOverviewClient({
  stats,
  revenue,
  bookingsByStatus,
  topTours,
  recentBookings,
}: AdminOverviewClientProps) {
  const { t } = useTranslation("common");

  const statCards = [
    {
      label: t("admin.totalRevenue"),
      value: `$${stats.total_revenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      description: t("admin.confirmedBookingsOnly"),
    },
    {
      label: t("admin.totalBookings"),
      value: stats.total_bookings.toString(),
      icon: CalendarDays,
      description: t("admin.allStatuses"),
    },
    {
      label: t("admin.pendingReview"),
      value: stats.pending_review.toString(),
      icon: Clock,
      description: t("admin.awaitingReceipt"),
    },
    {
      label: t("admin.activeTours"),
      value: stats.active_tours.toString(),
      icon: Map,
      description: t("admin.openForBooking"),
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("admin.adminOverview")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("admin.platformStats")}
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
