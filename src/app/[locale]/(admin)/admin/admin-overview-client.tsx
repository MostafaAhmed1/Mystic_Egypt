"use client";

import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
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
      color: "text-gold",
    },
    {
      label: t("admin.totalBookings"),
      value: stats.total_bookings.toString(),
      icon: CalendarDays,
      description: t("admin.allStatuses"),
      color: "text-lapis",
    },
    {
      label: t("admin.pendingReview"),
      value: stats.pending_review.toString(),
      icon: Clock,
      description: t("admin.awaitingReceipt"),
      color: "text-amber-600",
    },
    {
      label: t("admin.activeTours"),
      value: stats.active_tours.toString(),
      icon: Map,
      description: t("admin.openForBooking"),
      color: "text-emerald-600",
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="font-heading text-2xl font-bold tracking-wider text-obsidian">
          {t("admin.adminOverview")}
        </h1>
        <p className="text-sm text-obsidian/50">
          {t("admin.platformStats")}
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="rounded-2xl border border-gold/10 bg-white p-5 shadow-[0_2px_20px_rgba(0,0,0,0.03)]"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-obsidian/50">
                  {stat.label}
                </p>
                <Icon className={`size-4 ${stat.color}`} aria-hidden />
              </div>
              <p className="mt-2 text-3xl font-bold text-obsidian">{stat.value}</p>
              <p className="mt-1 text-xs text-obsidian/40">
                {stat.description}
              </p>
            </motion.div>
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
