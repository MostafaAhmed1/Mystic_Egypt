import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  CircleDollarSign,
  CreditCard,
  FileText,
  Users,
} from "lucide-react";
import { requireUser } from "@/core/lib/session";
import { getUserBookingById } from "@/features/dashboard/service";
import {
  BookingStatusBadge,
  paymentMethodLabel,
} from "@/features/dashboard/components/status";
import { getOrCreateInvoiceForOwnedBooking } from "@/features/invoice/service";
import { InvoicePDF } from "@/features/invoice/components/InvoicePDF";
import { formatCurrency, formatDate, formatDateTime } from "@/core/utils";

export const metadata = {
  title: "Booking details",
};

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const user = await requireUser();
  const { locale, id } = await params;
  const booking = await getUserBookingById(id, user.id);
  if (!booking) {
    notFound();
  }

  // Confirmed bookings always have a downloadable invoice.
  const invoice =
    booking.status === "CONFIRMED" || booking.status === "COMPLETED"
      ? await getOrCreateInvoiceForOwnedBooking(id, user.id)
      : null;

  const addonTotal = booking.addons.reduce(
    (sum, a) => sum + a.price_at_time * a.quantity,
    0,
  );
  const tourSubtotal = booking.total_amount - addonTotal;

  return (
    <div className="flex flex-col gap-5">
      <Link
        href={`/${locale}/dashboard/bookings`}
        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to bookings
      </Link>

      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-heading text-2xl font-semibold">
            {booking.tour_title}
          </h1>
          <BookingStatusBadge status={booking.status} />
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Reference #{booking.id.slice(0, 8)}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-2xl border bg-card p-4">
          <div className="flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <CalendarDays className="size-5" aria-hidden />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Tour date</p>
            <p className="text-sm font-medium">{formatDate(booking.tour_date)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border bg-card p-4">
          <div className="flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <Users className="size-5" aria-hidden />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Travellers</p>
            <p className="text-sm font-medium">
              {booking.num_people} {booking.num_people === 1 ? "person" : "people"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border bg-card p-4">
          <div className="flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <CreditCard className="size-5" aria-hidden />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Payment method</p>
            <p className="text-sm font-medium">
              {paymentMethodLabel(booking.payment_method)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border bg-card p-4">
          <div className="flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <CircleDollarSign className="size-5" aria-hidden />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-sm font-semibold">
              {formatCurrency(booking.total_amount, booking.currency)}
            </p>
          </div>
        </div>
      </div>

      <section className="rounded-2xl border bg-card p-5">
        <h2 className="font-heading mb-3 text-base font-semibold">Price breakdown</h2>
        <ul className="divide-y">
          <li className="flex items-center justify-between py-2.5 text-sm">
            <span>
              {booking.tour_title} · {booking.num_people}{" "}
              {booking.num_people === 1 ? "person" : "people"}
            </span>
            <span className="font-medium">
              {formatCurrency(tourSubtotal, booking.currency)}
            </span>
          </li>
          {booking.addons.map((a) => (
            <li
              key={`${a.name}-${a.quantity}`}
              className="flex items-center justify-between py-2.5 text-sm"
            >
              <span className="text-muted-foreground">
                {a.name} · {a.quantity}
              </span>
              <span className="font-medium">
                {formatCurrency(a.price_at_time * a.quantity, booking.currency)}
              </span>
            </li>
          ))}
          <li className="flex items-center justify-between py-3 text-base font-semibold">
            <span>Total</span>
            <span>{formatCurrency(booking.total_amount, booking.currency)}</span>
          </li>
        </ul>
      </section>

      {invoice ? (
        <section className="flex flex-col gap-3 rounded-2xl border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <FileText className="size-5" aria-hidden />
            </div>
            <div>
              <p className="text-sm font-medium">Invoice {invoice.invoice_number}</p>
              <p className="text-xs text-muted-foreground">
                Issued {formatDate(invoice.issued_at)}
              </p>
            </div>
          </div>
          <InvoicePDF invoice={invoice} />
        </section>
      ) : (
        <p className="rounded-2xl border bg-muted/40 px-5 py-4 text-sm text-muted-foreground">
          Your invoice will be available once this booking is confirmed.
        </p>
      )}

      <p className="text-xs text-muted-foreground">
        Booked on {formatDateTime(booking.created_at)}
        {booking.receipt_image_url ? " · Receipt received" : ""}
      </p>

      <Link
        href={`/tours/${booking.tour_slug}`}
        className="inline-flex h-10 w-fit items-center justify-center gap-2 rounded-xl border px-5 text-sm font-medium text-foreground hover:bg-muted"
      >
        View tour details
      </Link>
    </div>
  );
}
