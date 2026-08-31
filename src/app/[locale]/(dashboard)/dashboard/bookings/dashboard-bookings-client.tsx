"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { CalendarDays, FileText } from "lucide-react";
import { BookingStatusBadge, paymentMethodLabel } from "@/features/dashboard/components/status";
import { formatCurrency, formatDate } from "@/core/utils";
import type { DashboardBookingDto } from "@/features/dashboard/service";
import { useLocale } from "@/shared/hooks/use-locale";

export function DashboardBookingsClient({ bookings }: { bookings: DashboardBookingDto[] }) {
  const { t } = useTranslation("common");
  const { href } = useLocale();

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-heading text-2xl font-semibold">{t("dashboard.bookings")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("dashboard.trackBookings", "Track the status of your tour bookings.")}
        </p>
      </div>

      {bookings.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border bg-card px-5 py-16 text-center">
          <CalendarDays className="size-10 text-muted-foreground" aria-hidden />
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
        <ul className="flex flex-col gap-3">
          {bookings.map((b) => (
            <li key={b.id}>
              <Link
                href={href(`/dashboard/bookings/${b.id}`)}
                className="flex items-center justify-between gap-4 rounded-2xl border bg-card p-4 hover:bg-muted/40"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold">{b.tour_title}</p>
                    <BookingStatusBadge status={b.status} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDate(b.tour_date)} · {b.num_people}{" "}
                    {b.num_people === 1 ? t("booking.person", "person") : t("common.people")} ·{" "}
                    {paymentMethodLabel(b.payment_method)}
                  </p>
                  {b.invoice_number && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <FileText className="size-3" aria-hidden />
                      {t("booking.invoice")} {b.invoice_number}
                    </p>
                  )}
                </div>
                <span className="shrink-0 text-sm font-semibold">
                  {formatCurrency(b.total_amount, b.currency)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
