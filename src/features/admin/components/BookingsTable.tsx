"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  approveBookingAction,
  rejectBookingAction,
  completeBookingAction,
} from "@/features/admin/actions";
import { CURRENCY_SYMBOLS, type Currency } from "@/core/constants/currencies";
import { useLocale } from "@/shared/hooks/use-locale";

interface BookingItem {
  id: string;
  user_name: string;
  user_email: string;
  tour_title: string;
  tour_date: string;
  num_people: number;
  total_amount: number;
  currency: string;
  status: string;
  payment_method: string;
  receipt_image_url: string | null;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING_RECEIPT_REVIEW: "bg-yellow-50 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400",
  CONFIRMED: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  COMPLETED: "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400",
  CANCELLED: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400",
  PENDING_PAYMENT: "bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400",
};

const KANBAN_COLUMNS = [
  { status: "PENDING_RECEIPT_REVIEW", label: "Pending Review" },
  { status: "CONFIRMED", label: "Confirmed" },
  { status: "COMPLETED", label: "Completed" },
  { status: "CANCELLED", label: "Cancelled" },
];

function BookingActions({ booking }: { booking: BookingItem }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function handleAction(action: "approve" | "reject" | "complete") {
    setLoading(action);
    try {
      let result;
      if (action === "approve") result = await approveBookingAction(booking.id);
      else if (action === "reject") result = await rejectBookingAction(booking.id);
      else result = await completeBookingAction(booking.id);

      if (result.ok) {
        toast.success(`Booking ${action === "approve" ? "approved" : action === "reject" ? "rejected" : "completed"}.`);
        router.refresh();
      } else {
        toast.error(result.error ?? "Action failed.");
      }
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setLoading(null);
    }
  }

  const actions: { action: "approve" | "reject" | "complete"; label: string; show: boolean }[] = [
    { action: "approve", label: "Approve", show: booking.status === "PENDING_RECEIPT_REVIEW" },
    { action: "reject", label: "Reject", show: booking.status === "PENDING_RECEIPT_REVIEW" || booking.status === "CONFIRMED" },
    { action: "complete", label: "Complete", show: booking.status === "CONFIRMED" },
  ];

  return (
    <div className="flex items-center gap-1">
      {actions
        .filter((a) => a.show)
        .map((a) => (
          <button
            key={a.action}
            onClick={() => handleAction(a.action)}
            disabled={loading !== null}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
              a.action === "approve"
                ? "bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-500/10 dark:text-green-400"
                : a.action === "reject"
                  ? "bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400"
                  : "bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400"
            }`}
          >
            {loading === a.action ? "..." : a.label}
          </button>
        ))}
    </div>
  );
}

export function BookingsTable({ bookings }: { bookings: BookingItem[] }) {
  const router = useRouter();
  const { href } = useLocale();

  return (
    <div className="rounded-2xl border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-start text-muted-foreground">
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Tour</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 text-end font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Payment</th>
              <th className="px-4 py-3 text-end font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  No bookings found.
                </td>
              </tr>
            ) : (
              bookings.map((b) => (
                <tr key={b.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium">{b.user_name}</p>
                      <p className="text-xs text-muted-foreground">{b.user_email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{b.tour_title}</p>
                    <p className="text-xs text-muted-foreground">{b.num_people} people</p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {new Date(b.tour_date).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-end tabular-nums">
                    {CURRENCY_SYMBOLS[b.currency as Currency] ?? "$"}
                    {b.total_amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        STATUS_COLORS[b.status] ?? "bg-gray-50 text-gray-700"
                      }`}
                    >
                      {b.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {b.payment_method === "bank_transfer" ? (
                      <span className="text-muted-foreground">Bank Transfer</span>
                    ) : (
                      <span className="text-muted-foreground">Stripe</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <BookingActions booking={b} />
                      <button
                        onClick={() => router.push(href(`/admin/bookings/${b.id}`))}
                        className="rounded-lg bg-muted px-2.5 py-1 text-xs font-medium hover:bg-muted/80"
                      >
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function BookingsKanban({ bookings }: { bookings: BookingItem[] }) {
  const router = useRouter();
  const { href } = useLocale();

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {KANBAN_COLUMNS.map((col) => {
        const items = bookings.filter((b) => b.status === col.status);
        return (
          <div key={col.status} className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">{col.label}</h3>
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {items.length}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {items.length === 0 ? (
                <p className="rounded-xl border border-dashed p-4 text-center text-xs text-muted-foreground">
                  No bookings
                </p>
              ) : (
                items.map((b) => (
                  <div
                    key={b.id}
                    className="cursor-pointer rounded-xl border bg-card p-3 transition-colors hover:bg-muted/50"
                    onClick={() => router.push(href(`/admin/bookings/${b.id}`))}
                  >
                    <p className="text-sm font-medium">{b.user_name}</p>
                    <p className="text-xs text-muted-foreground">{b.tour_title}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="tabular-nums text-xs font-medium">
                        {CURRENCY_SYMBOLS[b.currency as Currency] ?? "$"}
                        {b.total_amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(b.tour_date).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                        })}
                      </span>
                    </div>
                    <div className="mt-2">
                      <BookingActions booking={b} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
