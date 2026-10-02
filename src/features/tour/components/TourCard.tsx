"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { ArrowRight, Clock } from "lucide-react";
import { TourImage } from "@/features/tour/components/TourImage";
import { formatCurrency } from "@/core/utils";
import { useLocale } from "@/shared/hooks/use-locale";
import { sendMetaEvent } from "@/core/lib/meta-pixel";
import type { TourSummary } from "@/features/tour/types";

interface TourCardProps {
  tour: TourSummary;
}

/**
 * Card images are always lazy: measured LCP on the listing pages is the hero
 * text, never a card image, so none of them should compete for bandwidth.
 */
export function TourCard({ tour }: TourCardProps) {
  const { t } = useTranslation("common");
  const { href } = useLocale();

  const handleViewTour = (): void => {
    sendMetaEvent("InitiateCheckout", {
      content_type: "product",
      content_ids: [tour.id],
      content_name: tour.title,
      content_category: "Booking",
      currency: tour.currency,
      value: tour.base_price,
    });
  };

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-gold/10 bg-white shadow-[0_2px_20px_rgba(0,0,0,0.04)] transition-all duration-500 hover:border-gold/30 hover:shadow-[0_8px_40px_rgba(212,175,55,0.12)]">
      {/* Image container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <TourImage
          src={tour.primary_image}
          alt={tour.title}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          fallbackLabel={tour.title}
        />

        {/* Cinematic overlay - always visible, stronger on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian/70 via-obsidian/20 to-transparent transition-all duration-500" />
        <div className="absolute inset-0 bg-gradient-to-r from-obsidian/20 via-transparent to-obsidian/20 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        {/* Gold accent line at top */}
        <div className="absolute top-0 left-0 h-1 w-0 bg-gradient-to-r from-gold to-gold-light transition-all duration-500 group-hover:w-full" />

        {/* Price badge on image */}
        <div className="absolute bottom-4 left-4 rounded-xl bg-obsidian/80 px-4 py-2 backdrop-blur-sm">
          <span className="text-xs text-sandstone/60">{t("tours.from")}</span>
          <span className="ml-1.5 font-heading text-lg font-bold text-gold">
            {formatCurrency(tour.base_price, tour.currency)}
          </span>
        </div>

        {/* View tour overlay on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-500 group-hover:opacity-100">
          <span className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-obsidian shadow-lg transition-transform duration-300 group-hover:scale-100 scale-90">
            {t("favourites.viewTour")}
            <ArrowRight className="size-4" aria-hidden />
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-3 px-5 py-5">
        <h3 className="font-heading text-lg leading-snug font-semibold tracking-wide text-obsidian transition-colors duration-300 group-hover:text-gold">
          <Link
            href={href(`/tours/${tour.slug}`)}
            onClick={handleViewTour}
            className="after:absolute after:inset-0"
          >
            {tour.title}
          </Link>
        </h3>

        <p className="line-clamp-2 text-sm leading-relaxed text-obsidian/50">{tour.description}</p>

        {/* Tour meta */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-obsidian/50">
          {tour.duration && (
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-3.5 text-gold" aria-hidden />
              {tour.duration}
            </span>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between pt-3 border-t border-gold/10">
          <Link
            href={href(`/tours/${tour.slug}`)}
            onClick={handleViewTour}
            className="group/link inline-flex items-center gap-2 text-sm font-semibold text-gold transition-all duration-300"
          >
            {t("favourites.viewTour")}
            <ArrowRight className="size-4 transition-transform duration-300 group-hover/link:translate-x-1" aria-hidden />
          </Link>
        </div>
      </div>
    </article>
  );
}
