"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Check, X, CalendarCheck, Map as MapIcon } from "lucide-react";
import { formatCurrency } from "@/core/utils";
import { TourGallery } from "@/features/tour/components/TourGallery";
import { ItineraryAccordion } from "@/features/tour/components/ItineraryAccordion";
import { TourMapClient } from "@/features/tour/components/TourMapClient";
import { CustomizeTourDialog } from "@/features/tour/components/CustomizeTourDialog";
import { RelatedTours } from "@/features/tour/components/RelatedTours";
import { WishlistButton } from "@/features/wishlist/components/WishlistButton";
import { useLocale } from "@/shared/hooks/use-locale";
import { trackEvent } from "@/core/lib/analytics";
import { sendMetaEvent } from "@/core/lib/meta-pixel";
import type { TourDetail, TourSummary } from "@/features/tour/types";

function splitList(value: string | null): string[] {
  if (!value) return [];
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

interface TourContentProps {
  tour: TourDetail;
  /** Server-fetched related tours, rendered as internal links after the CTA. */
  relatedTours: TourSummary[];
  /** Localized heading for the related-tours section (translated server-side). */
  relatedHeading: string;
}

export function TourContent({ tour, relatedTours, relatedHeading }: TourContentProps) {
  const { t } = useTranslation("common");
  const { href } = useLocale();

  useEffect(() => {
    trackEvent("view_item", {
      item_id: tour.id,
      item_name: tour.title,
      currency: tour.currency,
      price: tour.base_price,
    });
    sendMetaEvent("ViewContent", {
      content_type: "product",
      content_ids: [tour.id],
      content_name: tour.title,
      currency: tour.currency,
      value: tour.base_price,
    });
  }, [tour.id, tour.title, tour.currency, tour.base_price]);

  const handleBookNow = (): void => {
    sendMetaEvent("InitiateCheckout", {
      content_type: "product",
      content_ids: [tour.id],
      content_name: tour.title,
      content_category: "Booking",
      currency: tour.currency,
      value: tour.base_price,
    });
  };

  const inclusions = splitList(tour.inclusions);
  const exclusions = splitList(tour.exclusions);
  const days = tour.itinerary.length;

  return (

      <div className="mx-auto w-full max-w-6xl px-4 pb-8 sm:px-6 sm:pb-12">
        <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
          {/* Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <TourGallery images={tour.images} title={tour.title} />
          </motion.div>

          {/* Info sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-col gap-6"
          >
            {/* Title & description */}
            <div>
              <h1 className="font-heading text-3xl font-bold tracking-wider text-obsidian sm:text-4xl">
                {tour.title}
              </h1>
              <p className="mt-4 leading-relaxed text-obsidian/50">{tour.description}</p>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="font-heading text-4xl font-bold text-gold">
                {formatCurrency(tour.base_price, tour.currency)}
              </span>
              <span className="text-sm text-obsidian/40">{t("tours.perPerson")}</span>
            </div>

            {/* Group pricing table */}
            {tour.group_prices && tour.group_prices.length > 0 && (
              <div className="rounded-xl border border-gold/10 bg-gold/[0.03] p-4">
                <h3 className="mb-3 text-sm font-semibold text-obsidian/70">
                  {t("tours.groupPricing", "Group Pricing")}
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gold/10 text-left text-obsidian/40">
                        <th className="pb-2 pr-4 font-medium">{t("tours.groupSize", "Group Size")}</th>
                        <th className="pb-2 font-medium">{t("tours.pricePerPerson", "Price/Person")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tour.group_prices.map((tier, i) => (
                        <tr key={i} className="border-b border-gold/5 last:border-0">
                          <td className="py-2 pr-4 text-obsidian/60">
                            {tier.min_people === tier.max_people
                              ? tier.min_people
                              : `${tier.min_people}–${tier.max_people}`} {t("tours.people", "people")}
                          </td>
                          <td className="py-2 font-medium text-gold">
                            {formatCurrency(tier.price_per_person, tour.currency)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Duration badge */}
            {(tour.duration || days > 0) && (
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-gold/20 bg-gold/5 px-4 py-2 text-sm text-obsidian/60">
                <MapIcon className="size-4 text-gold" aria-hidden />
                <span className="font-medium">
                  {tour.duration ??
                    (days === 1 ? t("tours.oneDay", "1 day") : t("tours.daysCount", "{{count}} days", { count: days }))}
                </span>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col gap-3">
              <Link
                href={href(`/tours/${tour.slug}/book`)}
                onClick={handleBookNow}
                className="group inline-flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-gold px-6 text-base font-semibold text-obsidian shadow-[0_4px_20px_rgba(212,175,55,0.3)] transition-all duration-300 hover:bg-gold-light hover:shadow-[0_4px_30px_rgba(212,175,55,0.5)]"
              >
                <CalendarCheck className="size-5" aria-hidden />
                {t("tours.bookNow")}
              </Link>
              <CustomizeTourDialog tourId={tour.id} tourTitle={tour.title} />
              <WishlistButton tourId={tour.id} />
            </div>
          </motion.div>
        </div>

        {/* Itinerary */}
        {tour.itinerary.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="mt-16"
          >
            <h2 className="font-heading mb-6 text-2xl font-bold tracking-wider text-obsidian">
              {t("tours.dayByDayItinerary")}
            </h2>
            <div className="rounded-2xl border border-gold/10 bg-white p-4 shadow-[0_2px_20px_rgba(0,0,0,0.03)] sm:p-6">
              <ItineraryAccordion itinerary={tour.itinerary} />
            </div>
          </motion.section>
        )}

        {/* What's included / excluded */}
        {(inclusions.length > 0 || exclusions.length > 0) && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="mt-16 grid gap-6 md:grid-cols-2"
          >
            {inclusions.length > 0 && (
              <div className="rounded-2xl border border-gold/10 bg-white p-6 shadow-[0_2px_20px_rgba(0,0,0,0.03)]">
                <h2 className="font-heading mb-5 flex items-center gap-3 text-lg font-semibold tracking-wider text-obsidian">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-50">
                    <Check className="size-4 text-emerald-600" aria-hidden />
                  </span>
                  {t("tours.whatsIncluded")}
                </h2>
                <ul className="space-y-3">
                  {inclusions.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-obsidian/60">
                      <Check className="mt-0.5 size-4 shrink-0 text-emerald-500" aria-hidden />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {exclusions.length > 0 && (
              <div className="rounded-2xl border border-gold/10 bg-white p-6 shadow-[0_2px_20px_rgba(0,0,0,0.03)]">
                <h2 className="font-heading mb-5 flex items-center gap-3 text-lg font-semibold tracking-wider text-obsidian">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-terracotta/10">
                    <X className="size-4 text-terracotta" aria-hidden />
                  </span>
                  {t("tours.whatsNotIncluded")}
                </h2>
                <ul className="space-y-3">
                  {exclusions.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-obsidian/60">
                      <X className="mt-0.5 size-4 shrink-0 text-terracotta" aria-hidden />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.section>
        )}

        {/* Route map */}
        {tour.route.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="mt-16"
          >
            <h2 className="font-heading mb-6 text-2xl font-bold tracking-wider text-obsidian">
              {t("tours.journeyMap")}
            </h2>
            <TourMapClient route={tour.route} />
          </motion.section>
        )}

        {/* Bottom CTA — Cinematic dark section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mt-16 overflow-hidden rounded-2xl bg-obsidian p-8 text-center sm:p-12"
        >
          <h2 className="font-heading text-2xl font-bold tracking-wider text-white sm:text-3xl">
            {t("tours.readyToExplore")} {tour.title}?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-sandstone/50">
            {t("tours.transparentPricing")}
          </p>
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href={href(`/tours/${tour.slug}/book`)}
              onClick={handleBookNow}
              className="inline-flex h-14 items-center justify-center gap-3 rounded-xl bg-gold px-8 text-base font-semibold text-obsidian shadow-[0_4px_20px_rgba(212,175,55,0.3)] transition-all duration-300 hover:bg-gold-light hover:shadow-[0_4px_30px_rgba(212,175,55,0.5)]"
            >
              <CalendarCheck className="size-5" aria-hidden />
              {t("tours.bookNow")}
            </Link>
            <CustomizeTourDialog tourId={tour.id} tourTitle={tour.title} />
          </div>
        </motion.div>

        {relatedTours.length > 0 && (
          <RelatedTours tours={relatedTours} heading={relatedHeading} />
        )}
      </div>
  );
}
