"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Heart, ArrowRight } from "lucide-react";
import { TourImage } from "@/features/tour/components/TourImage";
import { WishlistRemoveButton } from "@/features/wishlist/components/WishlistRemoveButton";
import { formatCurrency } from "@/core/utils";
import type { Currency } from "@/core/constants/currencies";
import { useLocale } from "@/shared/hooks/use-locale";

interface WishlistTour {
  id: string;
  title: string;
  slug: string;
  image: string | null;
  base_price: number;
  currency: Currency;
}

export function DashboardWishlistClient({ tours }: { tours: WishlistTour[] }) {
  const { t } = useTranslation("common");
  const { href } = useLocale();

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-heading text-2xl font-semibold">{t("favourites.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("favourites.subtitle")}
        </p>
      </div>

      {tours.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border bg-card px-5 py-16 text-center">
          <Heart className="size-10 text-muted-foreground" aria-hidden />
          <p className="text-sm text-muted-foreground">
            {t("dashboard.noFavouritesYet", "You have no saved tours yet. Tap the heart on any tour to save it here.")}
          </p>
          <Link
            href={href("/tours")}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            {t("tours.viewAll")}
          </Link>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          {tours.map((tour) => (
            <li
              key={tour.id}
              className="flex gap-4 rounded-2xl border bg-card p-3"
            >
              <div className="relative h-24 w-28 shrink-0 overflow-hidden rounded-xl">
                <TourImage
                  src={tour.image}
                  alt={tour.title}
                  fill
                  sizes="112px"
                  className="object-cover"
                  fallbackLabel={tour.title}
                />
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <h2 className="line-clamp-1 font-medium">{tour.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("tours.from")}{" "}
                  <span className="font-semibold text-foreground">
                    {formatCurrency(tour.base_price, tour.currency)}
                  </span>
                </p>
                <div className="mt-auto flex items-center justify-between">
                  <Link
                    href={`/tours/${tour.slug}`}
                    className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                  >
                    {t("favourites.viewTour")}
                    <ArrowRight className="size-4" aria-hidden />
                  </Link>
                  <WishlistRemoveButton tourId={tour.id} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
