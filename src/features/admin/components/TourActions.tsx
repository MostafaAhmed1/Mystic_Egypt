"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, ToggleLeft, ToggleRight } from "lucide-react";
import { toggleTourStatusAction } from "@/features/admin/actions";
import { cn } from "@/core/utils";

interface ToggleTourStatusButtonProps {
  tourId: string;
  currentStatus: string;
}

export function ToggleTourStatusButton({ tourId, currentStatus }: ToggleTourStatusButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isOpen = currentStatus === "open";

  function handleToggle() {
    startTransition(async () => {
      const result = await toggleTourStatusAction(tourId);
      if (!result.ok) {
        toast.error(result.error ?? "Failed to update booking status.");
        return;
      }
      toast.success(
        result.status === "closed"
          ? "Bookings closed for this tour."
          : "Bookings reopened for this tour.",
      );
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      aria-label={isOpen ? "Close bookings" : "Open bookings"}
      title={isOpen ? "Close bookings" : "Open bookings"}
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-lg hover:bg-muted disabled:opacity-50",
        isPending && "cursor-wait",
      )}
    >
      {isPending ? (
        <Loader2 className="size-4 animate-spin" aria-hidden />
      ) : isOpen ? (
        <ToggleRight className="size-4 text-green-600" aria-hidden />
      ) : (
        <ToggleLeft className="size-4 text-red-600" aria-hidden />
      )}
    </button>
  );
}
