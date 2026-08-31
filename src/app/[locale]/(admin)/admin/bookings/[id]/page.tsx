import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getBookingById } from "@/features/admin/service";
import { CURRENCY_SYMBOLS, type Currency } from "@/core/constants/currencies";
import { BookingActions } from "@/features/admin/components/BookingDetailActions";

export const metadata = {
  title: "Booking Detail",
};

const STATUS_COLORS: Record<string, string> = {
  PENDING_RECEIPT_REVIEW: "bg-yellow-50 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400",
  CONFIRMED: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  COMPLETED: "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400",
  CANCELLED: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400",
  PENDING_PAYMENT: "bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400",
};

export default async function AdminBookingDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const booking = await getBookingById(id);
  if (!booking) notFound();

  const sym = CURRENCY_SYMBOLS[booking.currency as Currency] ?? "$";

  return (
    <div className="mx-auto max-w-3xl flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/${locale}/admin/bookings`}
          className="inline-flex items-center justify-center size-9 rounded-xl hover:bg-muted"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Booking Detail</h1>
          <p className="text-sm text-muted-foreground">{booking.id}</p>
        </div>
      </div>

      {/* Status + Actions */}
      <div className="rounded-2xl border bg-card p-6">
        <div className="flex items-center justify-between">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
              STATUS_COLORS[booking.status] ?? "bg-gray-50 text-gray-700"
            }`}
          >
            {booking.status.replace(/_/g, " ")}
          </span>
          <BookingActions bookingId={booking.id} status={booking.status} />
        </div>
      </div>

      {/* Customer Info */}
      <div className="rounded-2xl border bg-card p-6">
        <h2 className="mb-4 text-sm font-medium text-muted-foreground">Customer</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Name</p>
            <p className="font-medium">{booking.user_name}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium">{booking.user_email}</p>
          </div>
        </div>
      </div>

      {/* Tour Info */}
      <div className="rounded-2xl border bg-card p-6">
        <h2 className="mb-4 text-sm font-medium text-muted-foreground">Tour</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Tour</p>
            <p className="font-medium">{booking.tour_title}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Tour Date</p>
            <p className="font-medium">
              {new Date(booking.tour_date).toLocaleDateString("en-GB", {
                weekday: "long",
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">People</p>
            <p className="font-medium">{booking.num_people}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Amount</p>
            <p className="font-medium">
              {sym}
              {booking.total_amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      {/* Payment Info */}
      <div className="rounded-2xl border bg-card p-6">
        <h2 className="mb-4 text-sm font-medium text-muted-foreground">Payment</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Method</p>
            <p className="font-medium capitalize">{booking.payment_method.replace(/_/g, " ")}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Invoice</p>
            <p className="font-medium">{booking.invoice_number ?? "None"}</p>
          </div>
          {booking.receipt_image_url && (
            <div className="sm:col-span-2">
              <p className="text-sm text-muted-foreground">Receipt</p>
              <a
                href={booking.receipt_image_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-primary underline underline-offset-2 hover:text-primary/80"
              >
                View receipt
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Addons */}
      {booking.addons.length > 0 && (
        <div className="rounded-2xl border bg-card p-6">
          <h2 className="mb-4 text-sm font-medium text-muted-foreground">Add-ons</h2>
          <div className="flex flex-col gap-2">
            {booking.addons.map((a, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-2.5 text-sm">
                <span>
                  {a.name} × {a.quantity}
                </span>
                <span className="tabular-nums font-medium">
                  {sym}
                  {a.price_at_time.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timestamp */}
      <div className="text-xs text-muted-foreground">
        Created:{" "}
        {new Date(booking.created_at).toLocaleString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </div>
    </div>
  );
}
