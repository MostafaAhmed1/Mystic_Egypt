"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { ArrowRight, Clock, Tag } from "lucide-react";
import { formatCurrency } from "@/core/utils";
import type { TourSummary } from "@/features/tour/types";
import { ScrollReveal } from "@/shared/components/ScrollReveal";
import { useLocale } from "@/shared/hooks/use-locale";

/**
 * Hot-offers promo bar pinned to the TOP of the hero section.
 * Infinite CSS marquee (pauses on hover) of bookable offer tours.
 */
export function OffersHeroBar({ offers }: { offers: TourSummary[] }) {
  const { t } = useTranslation("common");

  if (offers.length === 0) return null;

  return (
    <aside
      aria-label={t("offers.heroLabel", "Hot offers")}
      className="absolute inset-x-0 top-0 z-20 border-b border-gold/40 bg-obsidian"
    >
      {/* Looping gold shimmer hairline */}
      <div className="animate-shimmer h-0.5 w-full" aria-hidden />

      <div className="flex items-stretch">
        <a
          href="#offers"
          className="group flex shrink-0 items-center gap-2 border-e border-gold/25 px-3 py-2 sm:px-4"
        >
          <span
            className="animate-pulse rounded-full bg-gold p-1.5 text-obsidian shadow-[0_0_12px_rgba(212,175,55,0.6)]"
            aria-hidden
          >
            <Tag className="size-3.5" />
          </span>
          <span className="text-[11px] font-bold uppercase tracking-widest text-gold transition-colors group-hover:text-gold-dark">
            {t("offers.heroLabel", "Hot offers")}
          </span>
        </a>

        {/* Infinite marquee (pauses on hover) */}
        <div className="services-marquee min-w-0 flex-1 py-2">
          <div className="services-marquee__track">
            <OfferChipGroup offers={offers} />
            <OfferChipGroup offers={offers} aria-hidden />
          </div>
        </div>
      </div>
    </aside>
  );
}

function OfferChipGroup({
  offers,
  ...rest
}: {
  offers: TourSummary[];
  "aria-hidden"?: boolean;
}) {
  const { href } = useLocale();

  return (
    <div className="services-marquee__group items-center" {...rest}>
      {offers.map((tour) => (
        <Link
          key={tour.id}
          href={href(`/tours/${tour.slug}`)}
          className="group flex shrink-0 items-center gap-2.5 rounded-full border border-gold/30 bg-white/5 py-1 pe-3 ps-1 transition-all duration-300 hover:border-gold hover:bg-gold/15 hover:shadow-[0_0_16px_rgba(212,175,55,0.35)]"
        >
          {tour.primary_image ? (
            <Image
              src={tour.primary_image}
              alt=""
              width={40}
              height={40}
              className="size-8 rounded-full object-cover"
            />
          ) : (
            <span className="flex size-8 items-center justify-center rounded-full bg-gold/20 text-gold">
              <Tag className="size-4" aria-hidden />
            </span>
          )}
          <span className="max-w-[140px] truncate text-xs font-medium text-sandstone transition-colors group-hover:text-gold sm:max-w-[240px] sm:text-sm">
            {tour.title}
          </span>
          <span className="shrink-0 text-xs font-bold text-gold">
            {formatCurrency(tour.base_price, tour.currency)}
          </span>
        </Link>
      ))}
    </div>
  );
}

/** Homepage offers section — bookable tours flagged `isOffer` by the admin. */
export function OffersSection({ offers }: { offers: TourSummary[] }) {
  const { t } = useTranslation("common");
  const { href } = useLocale();

  if (offers.length === 0) return null;

  return (
    <section id="offers" className="bg-sandstone-dark/50" aria-labelledby="offers-title">
      <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6">
        <ScrollReveal className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-gold-dark">
              {t("offers.eyebrow", "Limited-time deals")}
            </p>
            <h2 id="offers-title" className="font-heading text-3xl font-bold tracking-wider text-obsidian sm:text-4xl">
              {t("offers.title", "Hot offers")}
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-obsidian/55">
            {t("offers.subtitle", "Handpicked savings on Egypt's most loved experiences.")}
          </p>
        </ScrollReveal>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {offers.map((tour, index) => (
            <ScrollReveal key={tour.id} delay={index * 0.08}>
              <Link
                href={href(`/tours/${tour.slug}`)}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gold/10 bg-white shadow-[0_16px_40px_rgba(26,26,24,0.10)] transition-all duration-500 hover:border-gold/30 hover:shadow-[0_8px_40px_rgba(212,175,55,0.16)]"
              >
                <div className="relative h-44 shrink-0 bg-obsidian">
                  {tour.primary_image ? (
                    <Image
                      src={tour.primary_image}
                      alt={tour.title}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center bg-gradient-to-br from-obsidian via-obsidian/90 to-gold/20">
                      <Tag className="size-10 text-gold/70" aria-hidden />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-obsidian/40 to-transparent" />
                  <span className="animate-pulse absolute top-3 start-3 rounded-full bg-gold px-3 py-1 text-[11px] font-bold tracking-wider text-obsidian shadow-[0_4px_16px_rgba(212,175,55,0.4)]">
                    {t("offers.badge", "OFFER")}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-heading text-lg font-semibold tracking-wide text-obsidian transition-colors duration-300 group-hover:text-gold-dark">
                    {tour.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-obsidian/55">
                    {tour.description}
                  </p>
                  <div className="mt-auto flex items-center justify-between pt-4">
                    <span className="inline-flex items-center gap-1.5 text-xs text-obsidian/50">
                      <Clock className="size-3.5" aria-hidden />
                      {tour.duration ?? "—"}
                    </span>
                    <span className="font-heading text-lg font-bold text-gold">
                      {formatCurrency(tour.base_price, tour.currency)}
                    </span>
                  </div>
                  <span className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-gold transition-colors duration-300 group-hover:text-gold-dark">
                    {t("offers.cta", "View offer")}
                    <ArrowRight
                      className="size-4 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
                      aria-hidden
                    />
                  </span>
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
