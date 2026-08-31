"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
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
    { label: t("dashboard.totalBookings"), value: summary.total_bookings, icon: CalendarDays },
    { label: t("dashboard.confirmed"), value: summary.confirmed, icon: CheckCircle2 },
    { label: t("dashboard.inProgress"), value: summary.pending, icon: Clock },
    { label: t("dashboard.cancelled"), value: summary.cancelled, icon: XCircle },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">
          {t("dashboard.hello")} {userName.split(" ")[0]}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("dashboard.manageBookings")}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="flex items-center gap-3 rounded-2xl border bg-card p-4"
            >
              <div className="flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <Icon className="size-5" aria-hidden />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-semibold leading-none">{stat.value}</p>
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <section className="rounded-2xl border bg-card">
        <div className="flex items-center justify-between border-b px-5 py-3">
          <h2 className="font-heading text-base font-semibold">{t("dashboard.recentBookings")}</h2>
          <Link
            href={href("/dashboard/bookings")}
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            {t("dashboard.viewAll")}
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>

        {recentBookings.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-5 py-12 text-center">
            <FileText className="size-10 text-muted-foreground" aria-hidden />
            <p className="text-sm text-muted-foreground">
              {t("dashboard.noBookingsYet", "You have no bookings yet.")}
            </p>
            <Link
              href={href("/tours")}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              {t("tours.viewAll")}
            </Link>
          </div>
        ) : (
          <ul className="divide-y">
            {recentBookings.map((b) => (
              <li key={b.id}>
                <Link
                  href={href(`/dashboard/bookings/${b.id}`)}
                  className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-muted/40"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {b.tour_title}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatDate(b.tour_date)} · {b.num_people}{" "}
                      {b.num_people === 1 ? t("booking.person", "person") : t("common.people")}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="hidden text-sm font-semibold sm:inline">
                      {formatCurrency(b.total_amount, b.currency)}
                    </span>
                    <BookingStatusBadge status={b.status} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
