"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Check, X, CalendarCheck, Map as MapIcon } from "lucide-react";
import { formatCurrency } from "@/core/utils";
import { TourGallery } from "@/features/tour/components/TourGallery";
import { ItineraryAccordion } from "@/features/tour/components/ItineraryAccordion";
import { TourMapClient } from "@/features/tour/components/TourMapClient";
import { CustomizeTourDialog } from "@/features/tour/components/CustomizeTourDialog";
import { WishlistButton } from "@/features/wishlist/components/WishlistButton";
import { useLocale } from "@/shared/hooks/use-locale";
import type { TourDetail } from "@/features/tour/types";

function splitList(value: string | null): string[] {
  if (!value) return [];
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function TourContent({ tour }: { tour: TourDetail }) {
  const { t } = useTranslation("common");
  const { href } = useLocale();

  const inclusions = splitList(tour.inclusions);
  const exclusions = splitList(tour.exclusions);
  const days = tour.itinerary.length;

  const tourSchema =
    tour.itinerary.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "TouristTrip",
          name: tour.title,
          description: tour.description,
          "touristType": "International and local travellers",
          itinerary: tour.itinerary.map((day) => ({
            "@type": "TouristAttraction",
            name: day.title,
            description: day.description,
          })),
          offers: {
            "@type": "Offer",
            price: tour.base_price,
            priceCurrency: tour.currency,
            availability: "https://schema.org/InStock",
          },
        }
      : null;

  return (
    <>
      {tourSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(tourSchema) }}
        />
      )}

      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <nav className="mb-6 text-sm text-muted-foreground" aria-label="Breadcrumb">
          <Link href={href("/")} className="hover:text-foreground">
            {t("nav.home", "Home")}
          </Link>
          <span className="mx-2" aria-hidden>
            /
          </span>
          <Link href={href("/tours")} className="hover:text-foreground">
            {t("nav.tours")}
          </Link>
          <span className="mx-2" aria-hidden>
            /
          </span>
          <span className="text-foreground">{tour.title}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
          <div>
            <TourGallery images={tour.images} title={tour.title} />
          </div>

          <div className="flex flex-col gap-6">
            <div>
              <h1 className="font-heading text-3xl font-semibold tracking-tight">
                {tour.title}
              </h1>
              <p className="mt-3 text-muted-foreground">{tour.description}</p>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="font-heading text-3xl font-semibold">
                {formatCurrency(tour.base_price, tour.currency)}
              </span>
              <span className="text-sm text-muted-foreground">{t("tours.perPerson")}</span>
            </div>

            {days > 0 && (
              <p className="inline-flex w-fit items-center gap-2 rounded-full border bg-muted/40 px-3 py-1.5 text-sm text-muted-foreground">
                <MapIcon className="size-4" aria-hidden />
                {days === 1 ? t("tours.oneDay", "1 day") : t("tours.daysCount", "{{count}} days", { count: days })}
              </p>
            )}

            <div className="flex flex-col gap-3">
              <Link
                href={href(`/tours/${tour.slug}/book`)}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                <CalendarCheck className="size-4" aria-hidden />
                {t("tours.bookNow")}
              </Link>
              <CustomizeTourDialog tourId={tour.id} tourTitle={tour.title} />
              <WishlistButton tourId={tour.id} />
            </div>
          </div>
        </div>

        {/* Itinerary */}
        {tour.itinerary.length > 0 && (
          <section className="mt-12">
            <h2 className="font-heading mb-4 text-2xl font-semibold tracking-tight">
              {t("tours.dayByDayItinerary")}
            </h2>
            <div className="rounded-2xl border p-4 sm:p-6">
              <ItineraryAccordion itinerary={tour.itinerary} />
            </div>
          </section>
        )}

        {/* What's included / excluded */}
        {(inclusions.length > 0 || exclusions.length > 0) && (
          <section className="mt-12 grid gap-6 md:grid-cols-2">
            {inclusions.length > 0 && (
              <div className="rounded-2xl border bg-card p-6">
                <h2 className="font-heading mb-4 flex items-center gap-2 text-lg font-semibold">
                  <Check className="size-5 text-emerald-600" aria-hidden />
                  {t("tours.whatsIncluded")}
                </h2>
                <ul className="space-y-2 text-sm">
                  {inclusions.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-hidden />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {exclusions.length > 0 && (
              <div className="rounded-2xl border bg-card p-6">
                <h2 className="font-heading mb-4 flex items-center gap-2 text-lg font-semibold">
                  <X className="size-5 text-rose-600" aria-hidden />
                  {t("tours.whatsNotIncluded")}
                </h2>
                <ul className="space-y-2 text-sm">
                  {exclusions.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <X className="mt-0.5 size-4 shrink-0 text-rose-600" aria-hidden />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        {/* Route map */}
        {tour.route.length > 0 && (
          <section className="mt-12">
            <h2 className="font-heading mb-4 text-2xl font-semibold tracking-tight">
              {t("tours.journeyMap")}
            </h2>
            <TourMapClient route={tour.route} />
          </section>
        )}

        {/* Bottom CTA */}
        <div className="mt-12 rounded-2xl border bg-muted/40 p-6 text-center sm:p-10">
          <h2 className="font-heading text-xl font-semibold sm:text-2xl">
            {t("tours.readyToExplore")} {tour.title}?
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
            {t("tours.transparentPricing")}
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href={href(`/tours/${tour.slug}/book`)}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <CalendarCheck className="size-4" aria-hidden />
              {t("tours.bookNow")}
            </Link>
            <CustomizeTourDialog tourId={tour.id} tourTitle={tour.title} />
          </div>
        </div>
      </div>
    </>
  );
}
