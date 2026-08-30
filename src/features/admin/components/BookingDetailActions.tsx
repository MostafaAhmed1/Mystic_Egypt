"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  approveBookingAction,
  rejectBookingAction,
  completeBookingAction,
} from "@/features/admin/actions";

interface Props {
  bookingId: string;
  status: string;
}

export function BookingActions({ bookingId, status }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function handleAction(action: "approve" | "reject" | "complete") {
    setLoading(action);
    try {
      let result;
      if (action === "approve") result = await approveBookingAction(bookingId);
      else if (action === "reject") result = await rejectBookingAction(bookingId);
      else result = await completeBookingAction(bookingId);

      if (result.ok) {
        toast.success(
          `Booking ${action === "approve" ? "approved" : action === "reject" ? "rejected" : "completed"}.`
        );
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
    { action: "approve", label: "Approve & Confirm", show: status === "PENDING_RECEIPT_REVIEW" },
    { action: "reject", label: "Reject", show: status === "PENDING_RECEIPT_REVIEW" || status === "CONFIRMED" },
    { action: "complete", label: "Mark Completed", show: status === "CONFIRMED" },
  ];

  const visible = actions.filter((a) => a.show);
  if (visible.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      {visible.map((a) => (
        <button
          key={a.action}
          onClick={() => handleAction(a.action)}
          disabled={loading !== null}
          className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${
            a.action === "approve"
              ? "bg-green-600 text-white hover:bg-green-700"
              : a.action === "reject"
                ? "bg-red-600 text-white hover:bg-red-700"
                : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {loading === a.action ? "..." : a.label}
        </button>
      ))}
    </div>
  );
}
