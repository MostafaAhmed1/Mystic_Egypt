"use client";

import { useTranslation } from "react-i18next";
import { LayoutGrid, Table2 } from "lucide-react";
import { BookingsTable, BookingsKanban } from "@/features/admin/components/BookingsTable";

interface AdminBookingsClientProps {
  bookings: {
    id: string;
    tour_title: string;
    user_name: string;
    user_email: string;
    total_amount: number;
    currency: string;
    status: string;
    payment_method: string;
    tour_date: string;
    num_people: number;
    receipt_image_url: string | null;
    created_at: string;
  }[];
  total: number;
  page: number;
  limit: number;
  view: string;
  filterQs: string;
  search: string;
  status: string;
  paymentMethod: string;
  dateFrom: string;
  dateTo: string;
}

export function AdminBookingsClient({
  bookings,
  total,
  page,
  limit,
  view,
  filterQs,
  search,
  status,
  paymentMethod,
  dateFrom,
  dateTo,
}: AdminBookingsClientProps) {
  const { t } = useTranslation("common");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("admin.orders")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("admin.totalBookingsCount", { count: total })}
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-xl border bg-card p-1">
          <a
            href={`?${filterQs}&view=table`}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              view === "table" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Table2 className="size-3.5" />
            {t("admin.tableView")}
          </a>
          <a
            href={`?${filterQs}&view=kanban`}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              view === "kanban" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LayoutGrid className="size-3.5" />
            {t("admin.kanbanView")}
          </a>
        </div>
      </div>

      {/* Filters */}
      <form className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          name="search"
          defaultValue={search}
          placeholder={t("admin.searchCustomerOrTour")}
          className="h-10 w-full max-w-xs rounded-xl border bg-card px-4 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
        <select
          name="status"
          defaultValue={status}
          className="h-10 rounded-xl border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">{t("admin.allStatuses")}</option>
          <option value="PENDING_RECEIPT_REVIEW">{t("admin.pendingReview")}</option>
          <option value="CONFIRMED">{t("admin.confirmed")}</option>
          <option value="COMPLETED">{t("admin.completed")}</option>
          <option value="CANCELLED">{t("booking.cancelled")}</option>
        </select>
        <select
          name="payment_method"
          defaultValue={paymentMethod}
          className="h-10 rounded-xl border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">{t("admin.allPaymentMethods")}</option>
          <option value="stripe">Stripe</option>
          <option value="bank_transfer">{t("admin.bankTransfer")}</option>
        </select>
        <input
          type="date"
          name="date_from"
          defaultValue={dateFrom}
          className="h-10 rounded-xl border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          title={t("admin.fromDate")}
        />
        <input
          type="date"
          name="date_to"
          defaultValue={dateTo}
          className="h-10 rounded-xl border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          title={t("admin.toDate")}
        />
        <button
          type="submit"
          className="h-10 rounded-xl border bg-card px-4 text-sm font-medium hover:bg-muted"
        >
          {t("tours.filter")}
        </button>
        {(search || status || paymentMethod || dateFrom || dateTo) && (
          <a
            href="?view=table"
            className="h-10 rounded-xl px-4 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            {t("common.clear")}
          </a>
        )}
      </form>

      {/* View */}
      {view === "kanban" ? (
        <BookingsKanban bookings={bookings} />
      ) : (
        <BookingsTable bookings={bookings} />
      )}

      {/* Pagination */}
      {total > limit && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {t("admin.showingRange", {
              from: (page - 1) * limit + 1,
              to: Math.min(page * limit, total),
              total,
            })}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <a
                href={`?${filterQs}&page=${page - 1}&view=${view}`}
                className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted"
              >
                {t("common.back")}
              </a>
            )}
            {page * limit < total && (
              <a
                href={`?${filterQs}&page=${page + 1}&view=${view}`}
                className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted"
              >
                {t("common.next")}
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
