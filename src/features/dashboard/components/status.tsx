import type { BookingStatus } from "@/core/constants/booking";

const STATUS_META: Record<
  BookingStatus,
  { label: string; className: string }
> = {
  PENDING_PAYMENT: {
    label: "Pending payment",
    className: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30",
  },
  PENDING_RECEIPT_REVIEW: {
    label: "Awaiting review",
    className: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30",
  },
  CONFIRMED: {
    label: "Confirmed",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30",
  },
  COMPLETED: {
    label: "Completed",
    className: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/10 dark:text-violet-400 dark:border-violet-500/30",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/30",
  },
};

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const meta = STATUS_META[status] ?? STATUS_META.PENDING_PAYMENT;
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${meta.className}`}
    >
      {meta.label}
    </span>
  );
}

export function paymentMethodLabel(method: string): string {
  if (method === "stripe") return "Card (Stripe)";
  if (method === "bank_transfer") return "Bank transfer";
  return method;
}
