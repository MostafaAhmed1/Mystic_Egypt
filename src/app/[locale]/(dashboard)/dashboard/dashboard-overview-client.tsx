"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowRight,
  FileText,
} from "lucide-react";
import { BookingStatusBadge } from "@/features/dashboard/components/status";
import { formatCurrency, formatDate } from "@/core/utils";
import type { DashboardBookingDto, DashboardSummaryDto } from "@/features/dashboard/service";
import { useLocale } from "@/shared/hooks/use-locale";

interface DashboardOverviewClientProps {
  userName: string;
  summary: DashboardSummaryDto;
  recentBookings: DashboardBookingDto[];
}

export function DashboardOverviewClient({
  userName,
  summary,
  recentBookings,
}: DashboardOverviewClientProps) {
  const { t } = useTranslation("common");
  const { href } = useLocale();

  const stats = [
    { label: t("dashboard.totalBookings"), value: summary.total_bookings, icon: CalendarDays, color: "text-gold" },
    { label: t("dashboard.confirmed"), value: summary.confirmed, icon: CheckCircle2, color: "text-emerald-600" },
    { label: t("dashboard.inProgress"), value: summary.pending, icon: Clock, color: "text-amber-600" },
    { label: t("dashboard.cancelled"), value: summary.cancelled, icon: XCircle, color: "text-terracotta" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="font-heading text-2xl font-bold tracking-wider text-obsidian">
          {t("dashboard.hello")} {userName.split(" ")[0]}
        </h1>
        <p className="mt-1 text-sm text-obsidian/50">
          {t("dashboard.manageBookings")}
        </p>
      </motion.div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="flex items-center gap-3 rounded-2xl border border-gold/10 bg-white p-4 shadow-[0_2px_20px_rgba(0,0,0,0.03)]"
            >
              <div className={`flex size-10 items-center justify-center rounded-xl bg-sand/50`}>
                <Icon className={`size-5 ${stat.color}`} aria-hidden />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-bold text-obsidian">{stat.value}</p>
                <p className="mt-1 truncate text-xs text-obsidian/40">
                  {stat.label}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="rounded-2xl border border-gold/10 bg-white shadow-[0_2px_20px_rgba(0,0,0,0.03)]"
      >
        <div className="flex items-center justify-between border-b border-gold/10 px-5 py-3">
          <h2 className="font-heading text-base font-bold tracking-wider text-obsidian">{t("dashboard.recentBookings")}</h2>
          <Link
            href={href("/dashboard/bookings")}
            className="inline-flex items-center gap-1 text-sm font-medium text-gold hover:text-gold-light transition-colors"
          >
            {t("dashboard.viewAll")}
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>

        {recentBookings.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-5 py-12 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-sand/50">
              <FileText className="size-6 text-obsidian/30" aria-hidden />
            </div>
            <p className="text-sm text-obsidian/40">
              {t("dashboard.noBookingsYet", "You have no bookings yet.")}
            </p>
            <Link
              href={href("/tours")}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-gold px-5 text-sm font-semibold text-obsidian shadow-[0_4px_20px_rgba(212,175,55,0.3)] transition-all duration-300 hover:bg-gold-light hover:shadow-[0_4px_30px_rgba(212,175,55,0.5)]"
            >
              {t("tours.viewAll")}
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-gold/10">
            {recentBookings.map((b) => (
              <li key={b.id}>
                <Link
                  href={href(`/dashboard/bookings/${b.id}`)}
                  className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-sand/20"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-obsidian">
                      {b.tour_title}
                    </p>
                    <p className="mt-0.5 text-xs text-obsidian/40">
                      {formatDate(b.tour_date)} · {b.num_people}{" "}
                      {b.num_people === 1 ? t("booking.person", "person") : t("common.people")}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="hidden text-sm font-bold text-obsidian sm:inline">
                      {formatCurrency(b.total_amount, b.currency)}
                    </span>
                    <BookingStatusBadge status={b.status} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </motion.section>
    </div>
  );
}
