"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Loader2, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";
import { deleteTourAction, toggleTourStatusAction } from "@/features/admin/actions";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
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

interface DeleteTourButtonProps {
  tourId: string;
  tourTitle: string;
}

export function DeleteTourButton({ tourId, tourTitle }: DeleteTourButtonProps) {
  const { t } = useTranslation("common");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteTourAction(tourId);
      if (!result.ok) {
        toast.error(
          result.reason === "bookings"
            ? t("admin.deleteTourBlocked", "This tour has bookings. Disable it instead of deleting it.")
            : result.error ?? t("admin.deleteTourFailed", "Could not delete the tour."),
        );
        return;
      }
      setOpen(false);
      toast.success(t("admin.deleteTourSuccess", "Tour deleted."));
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            title={t("admin.deleteTour", "Delete tour")}
            aria-label={t("admin.deleteTour", "Delete tour")}
          />
        }
      >
        <Trash2 className="size-4 text-destructive" aria-hidden />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("admin.deleteTourTitle", "Delete tour permanently?")}</DialogTitle>
          <DialogDescription>
            {t(
              "admin.deleteTourConfirm",
              {
                name: tourTitle,
                defaultValue:
                  "“{{name}}” and all of its itinerary, images and dates will be deleted. This cannot be undone. Tours with bookings cannot be deleted.",
              },
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
            {t("common.cancel", "Cancel")}
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
            {isPending && <Loader2 className="size-4 animate-spin" aria-hidden />}
            {t("admin.deleteTourConfirmButton", "Delete permanently")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
