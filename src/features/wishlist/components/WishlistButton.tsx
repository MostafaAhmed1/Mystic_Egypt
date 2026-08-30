"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { API_ENDPOINTS } from "@/core/api/endpoints";
import { toggleWishlistAction } from "@/features/wishlist/actions";

// Client-side wishlist toggle for statically-generated tour pages. Because
// these pages are SSG, the saved state is fetched on the client via
// GET /api/wishlist and mutations go through the server action.
export function WishlistButton({ tourId }: { tourId: string }) {
  const router = useRouter();
  const { t } = useTranslation("common");
  const [saved, setSaved] = useState(false);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(API_ENDPOINTS.WISHLIST.LIST)
      .then((res) => (res.ok ? res.json() : Promise.resolve(null)))
      .then((data: { ok?: boolean; ids?: string[] } | null) => {
        if (cancelled || !data?.ok || !data.ids) {
          return;
        }
        setSaved(data.ids.includes(tourId));
      })
      .finally(() => {
        if (!cancelled) {
          setReady(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [tourId]);

  async function handleToggle() {
    if (busy) {
      return;
    }
    setBusy(true);
    try {
      const result = await toggleWishlistAction(tourId);
      setSaved(result.inWishlist);
      toast.success(
        result.inWishlist
          ? t("wishlist.added", "Added to your favourites.")
          : t("wishlist.removed", "Removed from your favourites."),
      );
      router.refresh();
    } catch {
      toast.error(t("wishlist.signInRequired", "Please sign in to save tours to your favourites."));
    } finally {
      setBusy(false);
    }
  }

  if (!ready) {
    return (
      <span
        className="inline-flex h-11 w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border px-4 text-sm font-medium text-muted-foreground"
        aria-hidden
      >
        <Heart className="size-4" />
        {t("common.loading")}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={busy}
      className={
        saved
          ? "inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 text-sm font-medium text-rose-600 hover:bg-rose-100 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-400"
          : "inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border bg-card px-4 text-sm font-medium text-foreground hover:bg-muted"
      }
    >
      <Heart className={`size-4 ${saved ? "fill-current" : ""}`} aria-hidden />
      {saved ? t("tours.savedToFavourites") : t("wishlist.save", "Save to favourites")}
    </button>
  );
}
