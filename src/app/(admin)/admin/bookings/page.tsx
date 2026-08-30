import { LayoutGrid, Table2 } from "lucide-react";
import { listBookings } from "@/features/admin/service";
import { BookingsTable, BookingsKanban } from "@/features/admin/components/BookingsTable";

export const metadata = {
  title: "Orders Management",
};

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    payment_method?: string;
    search?: string;
    date_from?: string;
    date_to?: string;
    page?: string;
    view?: string;
  }>;
}) {
  const params = await searchParams;
  const result = await listBookings({
    status: params.status,
    payment_method: params.payment_method,
    search: params.search,
    date_from: params.date_from,
    date_to: params.date_to,
    page: parseInt(params.page ?? "1", 10),
    limit: 50,
  });

  const view = params.view ?? "table";

  // Build filter query string for pagination links
  const filterQs = new URLSearchParams();
  if (params.status) filterQs.set("status", params.status);
  if (params.payment_method) filterQs.set("payment_method", params.payment_method);
  if (params.search) filterQs.set("search", params.search);
  if (params.date_from) filterQs.set("date_from", params.date_from);
  if (params.date_to) filterQs.set("date_to", params.date_to);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
          <p className="text-sm text-muted-foreground">
            {result.total} total bookings — review payments and manage status.
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-xl border bg-card p-1">
          <a
            href={`?${filterQs.toString()}&view=table`}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              view === "table" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Table2 className="size-3.5" />
            Table
          </a>
          <a
            href={`?${filterQs.toString()}&view=kanban`}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              view === "kanban" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LayoutGrid className="size-3.5" />
            Kanban
          </a>
        </div>
      </div>

      {/* Filters */}
      <form className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          name="search"
          defaultValue={params.search ?? ""}
          placeholder="Search customer or tour..."
          className="h-10 w-full max-w-xs rounded-xl border bg-card px-4 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
        <select
          name="status"
          defaultValue={params.status ?? ""}
          className="h-10 rounded-xl border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All statuses</option>
          <option value="PENDING_RECEIPT_REVIEW">Pending Review</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <select
          name="payment_method"
          defaultValue={params.payment_method ?? ""}
          className="h-10 rounded-xl border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All payment methods</option>
          <option value="stripe">Stripe</option>
          <option value="bank_transfer">Bank Transfer</option>
        </select>
        <input
          type="date"
          name="date_from"
          defaultValue={params.date_from ?? ""}
          className="h-10 rounded-xl border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          title="From date"
        />
        <input
          type="date"
          name="date_to"
          defaultValue={params.date_to ?? ""}
          className="h-10 rounded-xl border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          title="To date"
        />
        <button
          type="submit"
          className="h-10 rounded-xl border bg-card px-4 text-sm font-medium hover:bg-muted"
        >
          Filter
        </button>
        {(params.search || params.status || params.payment_method || params.date_from || params.date_to) && (
          <a
            href="?view=table"
            className="h-10 rounded-xl px-4 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Clear
          </a>
        )}
      </form>

      {/* View */}
      {view === "kanban" ? (
        <BookingsKanban
          bookings={result.items.map((b) => ({
            ...b,
            tour_date: b.tour_date instanceof Date ? b.tour_date.toISOString() : String(b.tour_date),
            created_at: b.created_at instanceof Date ? b.created_at.toISOString() : String(b.created_at),
          }))}
        />
      ) : (
        <BookingsTable
          bookings={result.items.map((b) => ({
            ...b,
            tour_date: b.tour_date instanceof Date ? b.tour_date.toISOString() : String(b.tour_date),
            created_at: b.created_at instanceof Date ? b.created_at.toISOString() : String(b.created_at),
          }))}
        />
      )}

      {/* Pagination */}
      {result.total > result.limit && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Showing {(result.page - 1) * result.limit + 1}–
            {Math.min(result.page * result.limit, result.total)} of {result.total}
          </p>
          <div className="flex gap-2">
            {result.page > 1 && (
              <a
                href={`?${filterQs.toString()}&page=${result.page - 1}&view=${view}`}
                className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted"
              >
                Previous
              </a>
            )}
            {result.page * result.limit < result.total && (
              <a
                href={`?${filterQs.toString()}&page=${result.page + 1}&view=${view}`}
                className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted"
              >
                Next
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
