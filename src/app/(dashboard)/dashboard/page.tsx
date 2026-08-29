import Link from "next/link";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowRight,
  FileText,
} from "lucide-react";
import { requireUser } from "@/core/lib/session";
import {
  getDashboardSummary,
  listUserBookings,
} from "@/features/dashboard/service";
import { BookingStatusBadge } from "@/features/dashboard/components/status";
import { formatCurrency, formatDate } from "@/core/utils";

export const metadata = {
  title: "Dashboard",
};

export default async function DashboardOverviewPage() {
  const user = await requireUser();
  const [summary, bookings] = await Promise.all([
    getDashboardSummary(user.id),
    listUserBookings(user.id),
  ]);
  const recent = bookings.slice(0, 4);

  const stats = [
    { label: "Total bookings", value: summary.total_bookings, icon: CalendarDays },
    { label: "Confirmed", value: summary.confirmed, icon: CheckCircle2 },
    { label: "In progress", value: summary.pending, icon: Clock },
    { label: "Cancelled", value: summary.cancelled, icon: XCircle },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">
          Hello, {user.name.split(" ")[0]}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your bookings, invoices, favourites and profile.
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
          <h2 className="font-heading text-base font-semibold">Recent bookings</h2>
          <Link
            href="/dashboard/bookings"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            View all
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-5 py-12 text-center">
            <FileText className="size-10 text-muted-foreground" aria-hidden />
            <p className="text-sm text-muted-foreground">
              You have no bookings yet.
            </p>
            <Link
              href="/tours"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Browse tours
            </Link>
          </div>
        ) : (
          <ul className="divide-y">
            {recent.map((b) => (
              <li key={b.id}>
                <Link
                  href={`/dashboard/bookings/${b.id}`}
                  className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-muted/40"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {b.tour_title}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatDate(b.tour_date)} · {b.num_people}{" "}
                      {b.num_people === 1 ? "person" : "people"}
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
