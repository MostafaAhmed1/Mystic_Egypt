import Link from "next/link";
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { listTours, toggleTourStatus } from "@/features/admin/service";
import { CURRENCY_SYMBOLS, type Currency } from "@/core/constants/currencies";

export const metadata = {
  title: "Tours Management",
};

export default async function AdminToursPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const search = params.search ?? "";
  const status = params.status ?? "";
  const page = parseInt(params.page ?? "1", 10);

  const result = await listTours({ search, status, page, limit: 20 });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tours</h1>
          <p className="text-sm text-muted-foreground">
            Manage tour inventory, pricing, and availability.
          </p>
        </div>
        <Link
          href="/admin/tours/new"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="size-4" aria-hidden />
          Add Tour
        </Link>
      </div>

      {/* Filters */}
      <form className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          name="search"
          defaultValue={search}
          placeholder="Search tours..."
          className="h-10 w-full max-w-xs rounded-xl border bg-card px-4 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
        <select
          name="status"
          defaultValue={status}
          className="h-10 rounded-xl border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All statuses</option>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
        </select>
        <button
          type="submit"
          className="h-10 rounded-xl border bg-card px-4 text-sm font-medium hover:bg-muted"
        >
          Filter
        </button>
      </form>

      {/* Table */}
      <div className="rounded-2xl border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="px-4 py-3 font-medium">Tour</th>
                <th className="px-4 py-3 text-right font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Bookings</th>
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {result.items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    No tours found.
                  </td>
                </tr>
              ) : (
                result.items.map((tour) => (
                  <tr key={tour.id} className="border-b last:border-0">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">{tour.title}</p>
                        <p className="text-xs text-muted-foreground">/{tour.slug}</p>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">
                      {CURRENCY_SYMBOLS[tour.currency as Currency] ?? "$"}
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
                          title="Edit"
                        >
                          <Pencil className="size-4" />
                        </Link>
                        <form
                          action={async () => {
                            "use server";
                            await toggleTourStatus(tour.id);
                          }}
                        >
                          <button
                            type="submit"
                            className="inline-flex items-center justify-center size-8 rounded-lg hover:bg-muted"
                            title={tour.status === "open" ? "Close bookings" : "Open bookings"}
                          >
                            {tour.status === "open" ? (
                              <ToggleRight className="size-4 text-green-600" />
                            ) : (
                              <ToggleLeft className="size-4 text-red-600" />
                            )}
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {result.total > result.limit && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <p className="text-xs text-muted-foreground">
              Showing {(result.page - 1) * result.limit + 1}–
              {Math.min(result.page * result.limit, result.total)} of {result.total}
            </p>
            <div className="flex gap-2">
              {result.page > 1 && (
                <Link
                  href={`?page=${result.page - 1}${search ? `&search=${search}` : ""}${status ? `&status=${status}` : ""}`}
                  className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted"
                >
                  Previous
                </Link>
              )}
              {result.page * result.limit < result.total && (
                <Link
                  href={`?page=${result.page + 1}${search ? `&search=${search}` : ""}${status ? `&status=${status}` : ""}`}
                  className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted"
                >
                  Next
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
