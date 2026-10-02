"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { ArrowRight, Tag } from "lucide-react";
import { extractLocale } from "@/core/utils/locale";
import type { HomepageOffer } from "@/features/homepage/types";
import { ScrollReveal } from "@/shared/components/ScrollReveal";
import { useLocale } from "@/shared/hooks/use-locale";

function offerHref(linkUrl: string | null, localize: (path: string) => string): string {
  if (!linkUrl) return "#";
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(linkUrl)) return linkUrl;
  if (extractLocale(linkUrl)) return linkUrl;
  return localize(linkUrl);
}

export function OffersHeroBar({ offers }: { offers: HomepageOffer[] }) {
  const { t } = useTranslation("common");
  const { href } = useLocale();

  if (offers.length === 0) return null;

  return (
    <div className="absolute inset-x-0 bottom-0 z-20 border-t border-gold/25 bg-obsidian/75 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-2.5 px-4 py-3 sm:px-6">
        <a
          href="#offers"
          className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-gold transition-colors duration-300 hover:text-gold-dark"
        >
          <Tag className="size-3.5" aria-hidden />
          {t("offers.heroLabel", "Hot offers")}
        </a>
        {offers.map((offer) => (
          <Link
            key={offer.id}
            href={offerHref(offer.linkUrl, href)}
            className="group inline-flex min-w-0 items-center gap-2 rounded-full border border-sandstone/20 bg-white/5 px-3 py-1.5 text-xs text-sandstone transition-colors duration-300 hover:border-gold/50 hover:text-gold"
          >
            {offer.badge && (
              <span className="shrink-0 rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold tracking-wider text-obsidian">
                {offer.badge}
              </span>
            )}
            <span className="truncate">{offer.title}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function OffersSection({ offers }: { offers: HomepageOffer[] }) {
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
          {offers.map((offer, index) => (
            <ScrollReveal key={offer.id} delay={index * 0.08}>
              <Link
                href={offerHref(offer.linkUrl, href)}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gold/10 bg-white shadow-[0_16px_40px_rgba(26,26,24,0.10)] transition-all duration-500 hover:border-gold/30 hover:shadow-[0_8px_40px_rgba(212,175,55,0.16)]"
              >
                <div className="relative h-44 shrink-0 bg-obsidian">
                  {offer.imageUrl ? (
                    <Image
                      src={offer.imageUrl}
                      alt={offer.title}
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
                  {offer.badge && (
                    <span className="absolute top-3 start-3 rounded-full bg-gold px-3 py-1 text-[11px] font-bold tracking-wider text-obsidian shadow-[0_4px_16px_rgba(212,175,55,0.4)]">
                      {offer.badge}
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-heading text-lg font-semibold tracking-wide text-obsidian transition-colors duration-300 group-hover:text-gold-dark">
                    {offer.title}
                  </h3>
                  {offer.description && (
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-obsidian/55">
                      {offer.description}
                    </p>
                  )}
                  <span className="mt-auto inline-flex items-center gap-2 pt-4 text-sm font-semibold text-gold transition-colors duration-300 group-hover:text-gold-dark">
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
