"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { toggleWishlistAction } from "@/features/wishlist/actions";

export function WishlistRemoveButton({ tourId }: { tourId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleRemove() {
    if (busy) {
      return;
    }
    setBusy(true);
    try {
      await toggleWishlistAction(tourId);
      toast.success("Removed from your favourites.");
      router.refresh();
    } catch {
      toast.error("Could not update your favourites.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleRemove}
      disabled={busy}
      aria-label="Remove from favourites"
      className="inline-flex size-9 items-center justify-center rounded-lg border text-muted-foreground transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50 dark:hover:bg-rose-500/10"
    >
      <Heart className="size-4 fill-current" aria-hidden />
    </button>
  );
}
