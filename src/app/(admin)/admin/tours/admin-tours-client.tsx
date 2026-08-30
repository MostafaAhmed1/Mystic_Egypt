"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Plus, Pencil } from "lucide-react";
import { CURRENCY_SYMBOLS, type Currency } from "@/core/constants/currencies";
import { ToggleTourStatusButton } from "@/features/admin/components/TourActions";

interface TourListItem {
  id: string;
  title: string;
  slug: string;
  base_price: number;
  currency: Currency;
  status: string;
  booking_count: number;
  created_at: Date | string;
}

interface AdminToursClientProps {
  tours: TourListItem[];
  total: number;
  page: number;
  limit: number;
  search: string;
  status: string;
}

export function AdminToursClient({
  tours,
  total,
  page,
  limit,
  search,
  status,
}: AdminToursClientProps) {
  const { t } = useTranslation("common");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("admin.tours")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("admin.manageTours")}
          </p>
        </div>
        <Link
          href="/admin/tours/new"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="size-4" aria-hidden />
          {t("admin.addTour")}
        </Link>
      </div>

      {/* Filters */}
      <form className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          name="search"
          defaultValue={search}
          placeholder={t("tours.searchTours")}
          className="h-10 w-full max-w-xs rounded-xl border bg-card px-4 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
        <select
          name="status"
          defaultValue={status}
          className="h-10 rounded-xl border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">{t("admin.allStatuses")}</option>
          <option value="open">{t("admin.open", "Open")}</option>
          <option value="closed">{t("admin.closed", "Closed")}</option>
        </select>
        <button
          type="submit"
          className="h-10 rounded-xl border bg-card px-4 text-sm font-medium hover:bg-muted"
        >
          {t("tours.filter")}
        </button>
      </form>

      {/* Table */}
      <div className="rounded-2xl border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="px-4 py-3 font-medium">{t("admin.tour")}</th>
                <th className="px-4 py-3 text-right font-medium">{t("tours.from")}</th>
                <th className="px-4 py-3 font-medium">{t("admin.status")}</th>
                <th className="px-4 py-3 text-right font-medium">{t("admin.bookingsCount")}</th>
                <th className="px-4 py-3 font-medium">{t("admin.updated")}</th>
                <th className="px-4 py-3 text-right font-medium">{t("admin.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {tours.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    {t("tours.noToursFound")}
                  </td>
                </tr>
              ) : (
                tours.map((tour) => (
                  <tr key={tour.id} className="border-b last:border-0">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">{tour.title}</p>
                        <p className="text-xs text-muted-foreground">/{tour.slug}</p>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">
                      {CURRENCY_SYMBOLS[tour.currency] ?? "$"}
                      {tour.base_price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          tour.status === "open"
                            ? "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400"
                            : "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400"
                        }`}
                      >
                        {tour.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">
                      {tour.booking_count}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {new Date(tour.created_at).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/tours/${tour.id}/edit`}
                          className="inline-flex items-center justify-center size-8 rounded-lg hover:bg-muted"
                          title={t("admin.edit")}
                        >
                          <Pencil className="size-4" />
                        </Link>
                        <ToggleTourStatusButton
                          tourId={tour.id}
                          currentStatus={tour.status}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > limit && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <p className="text-xs text-muted-foreground">
              {t("admin.showingRange", {
                from: (page - 1) * limit + 1,
                to: Math.min(page * limit, total),
                total,
              })}
            </p>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={`?page=${page - 1}${search ? `&search=${search}` : ""}${status ? `&status=${status}` : ""}`}
                  className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted"
                >
                  {t("common.back")}
                </Link>
              )}
              {page * limit < total && (
                <Link
                  href={`?page=${page + 1}${search ? `&search=${search}` : ""}${status ? `&status=${status}` : ""}`}
                  className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted"
                >
                  {t("common.next")}
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
