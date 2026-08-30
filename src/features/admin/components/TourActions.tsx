"use client";

import { ToggleLeft, ToggleRight } from "lucide-react";
import { toggleTourStatusAction } from "@/features/admin/actions";

interface ToggleTourStatusButtonProps {
  tourId: string;
  currentStatus: string;
}

export function ToggleTourStatusButton({ tourId, currentStatus }: ToggleTourStatusButtonProps) {
  async function handleToggle() {
    await toggleTourStatusAction(tourId);
  }

  return (
    <form action={handleToggle}>
      <button
        type="submit"
        className="inline-flex items-center justify-center size-8 rounded-lg hover:bg-muted"
        title={currentStatus === "open" ? "Close bookings" : "Open bookings"}
      >
        {currentStatus === "open" ? (
          <ToggleRight className="size-4 text-green-600" />
        ) : (
          <ToggleLeft className="size-4 text-red-600" />
        )}
      </button>
    </form>
  );
}
