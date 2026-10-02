"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import {
  Landmark,
  ShieldCheck,
  Wallet,
  CarFront,
  CheckCircle,
  Headset,
  MapPin,
  BadgeCheck,
  ChevronDown,
} from "lucide-react";
import { TourSearchBar } from "@/features/tour/components/TourSearchBar";
import type { TourSummary } from "@/features/tour/types";
import { TourCard } from "@/features/tour/components/TourCard";
import { useLocale } from "@/shared/hooks/use-locale";
import { ScrollReveal } from "@/shared/components/ScrollReveal";
import { ContactFormSection } from "@/shared/components/contact-form-section";
import { TestimonialsSection } from "@/shared/components/testimonials-section";
import { ProcessSection } from "@/shared/components/process-section";
import { ServicesSection } from "@/features/homepage/components/services-section";
import { CategoriesSection } from "@/features/homepage/components/categories-section";
import { OffersHeroBar, OffersSection } from "@/features/homepage/components/offers";
import type {
  HomepageCategory,
  HomepageOffer,
  HomepageService,
} from "@/features/homepage/types";

export function HomePageClient({
  tours,
  categories,
  services,
  offers,
}: {
  tours: TourSummary[];
  categories: HomepageCategory[];
  services: HomepageService[];
  offers: HomepageOffer[];
}) {
  const { t } = useTranslation();
  const { href } = useLocale();

  return (
    <main id="main-content">
      {/* Hero — Cinematic Full-Screen */}
      <section className="relative h-screen min-h-[700px] overflow-hidden">
        {/* Background image with Ken Burns */}
        <div className="absolute inset-0">
          <Image
            src="/uploads/stock/hero-pyramids.webp"
            alt={t("hero.imageAlt")}
            fill
            loading="eager"
            fetchPriority="high"
            sizes="100vw"
            className="animate-ken-burns object-cover object-center"
          />
          {/* Cinematic overlay - deeper gradients */}
          <div className="absolute inset-0 bg-gradient-to-b from-obsidian/70 via-obsidian/40 to-obsidian/80" />
          <div className="absolute inset-0 bg-gradient-to-r from-obsidian/30 via-transparent to-obsidian/30" />
          {/* Subtle grain texture */}
          <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
               style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E')" }} />
        </div>

        {/* Content */}
        <div className="relative z-10 mx-auto flex h-full w-full max-w-7xl flex-col items-center justify-center px-4 text-center sm:px-6">
          <span
            className="animate-fade-in-up mb-6 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold backdrop-blur-sm"
            style={{ animationDelay: "0s" }}
          >
            <Landmark className="size-3.5" aria-hidden />
            {t("hero.badge")}
          </span>

          <h1
            className="animate-fade-in-up font-heading max-w-5xl text-4xl font-bold leading-tight tracking-wider text-white sm:text-5xl md:text-6xl lg:text-7xl text-shadow-cinematic"
            style={{ animationDelay: "0.15s" }}
          >
            {t("hero.title")}
          </h1>

          <p
            className="animate-fade-in-up mt-6 max-w-2xl text-base leading-relaxed text-sandstone/80 sm:text-lg md:text-xl"
            style={{ animationDelay: "0.3s" }}
          >
            {t("hero.subtitle")}
          </p>

          <div
            className="animate-fade-in-up mt-10 w-full sm:flex sm:justify-center"
            style={{ animationDelay: "0.45s" }}
          >
            <TourSearchBar />
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          className={`animate-fade-in-delayed absolute left-1/2 z-10 -translate-x-1/2 ${
            offers.length > 0 ? "bottom-24" : "bottom-8"
          }`}
        >
          <div className="animate-bob flex flex-col items-center gap-2 text-sandstone/40">
            <span className="text-xs uppercase tracking-widest">{t("hero.scroll")}</span>
            <ChevronDown className="size-5" />
          </div>
        </div>

        {/* Bottom gradient fade to sandstone */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-sandstone to-transparent" />

        {/* Hot offers promo bar (pinned to hero bottom edge) */}
        <OffersHeroBar offers={offers} />
      </section>

      <ServicesSection services={services} />
      <CategoriesSection categories={categories} />
      <OffersSection offers={offers} />

      {/* Featured tours */}
      {tours.length > 0 && (
        <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6">
          <ScrollReveal className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-heading text-2xl font-bold tracking-wider text-obsidian sm:text-3xl">
                {t("tours.featured")}
              </h2>
              <p className="mt-2 text-obsidian/50">
                {t("tours.featuredSubtitle")}
              </p>
            </div>
            <Link
              href={href("/tours")}
              className="group inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-gold transition-colors duration-300 hover:text-gold-dark"
            >
              {t("tours.viewAll")}
              <span className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden>
                →
              </span>
            </Link>
          </ScrollReveal>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {tours.map((tour, i) => (
              <ScrollReveal key={tour.id} delay={i * 0.1}>
                <TourCard tour={tour} />
              </ScrollReveal>
            ))}
          </div>
        </section>
      )}

      {/* Why us */}
      <section id="why-us" className="bg-sandstone-dark/50">
        <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6">
          <ScrollReveal className="mb-16 text-center">
            <h2 className="font-heading text-2xl font-bold tracking-wider text-obsidian sm:text-3xl">
              {t("whyUs.title")}
            </h2>
            <p className="mt-3 max-w-2xl mx-auto text-obsidian/50">
              {t("whyUs.subtitle")}
            </p>
          </ScrollReveal>
          <div className="grid gap-8 sm:grid-cols-3">
            <ScrollReveal delay={0}>
              <WhyUsCard
                icon={<ShieldCheck className="size-6" aria-hidden />}
                title={t("whyUs.ukEntity.title")}
                description={t("whyUs.ukEntity.description")}
                stat="100%"
                statLabel={t("whyUs.ukEntity.statLabel")}
              />
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <WhyUsCard
                icon={<CarFront className="size-6" aria-hidden />}
                title={t("whyUs.transfers.title")}
                description={t("whyUs.transfers.description")}
                stat="24/7"
                statLabel={t("whyUs.transfers.statLabel")}
              />
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <WhyUsCard
                icon={<Wallet className="size-6" aria-hidden />}
                title={t("whyUs.prices.title")}
                description={t("whyUs.prices.description")}
                stat="0%"
                statLabel={t("whyUs.prices.statLabel")}
              />
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Process */}
      <ProcessSection />

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Contact Form */}
      <ContactFormSection />

      {/* Trust badges */}
      <section className="border-t border-gold/10 bg-obsidian">
        <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6">
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            <TrustBadge icon={<BadgeCheck className="size-5" aria-hidden />} label={t("trust.securePayment")} />
            <TrustBadge icon={<Headset className="size-5" aria-hidden />} label={t("trust.support247")} />
            <TrustBadge icon={<MapPin className="size-5" aria-hidden />} label={t("trust.licensedGuides")} />
            <TrustBadge icon={<CheckCircle className="size-5" aria-hidden />} label={t("trust.noHiddenFees")} />
          </div>
        </div>
      </section>
    </main>
  );
}

function WhyUsCard({
  icon,
  title,
  description,
  stat,
  statLabel,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  stat: string;
  statLabel: string;
}) {
  return (
    <div className="group rounded-2xl border border-gold/10 bg-white p-8 text-center transition-all duration-500 hover:border-gold/30 hover:shadow-[0_8px_40px_rgba(212,175,55,0.12)]">
      <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-gold/10 text-gold transition-all duration-500 group-hover:bg-gold group-hover:text-obsidian group-hover:gold-glow">
        {icon}
      </div>
      <div className="mb-3">
        <span className="font-heading text-3xl font-bold text-gold">{stat}</span>
        <p className="text-xs text-obsidian/40 mt-1">{statLabel}</p>
      </div>
      <h3 className="font-heading mb-3 text-lg font-semibold tracking-wider text-obsidian">
        {title}
      </h3>
      <p className="text-sm leading-relaxed text-obsidian/50">{description}</p>
    </div>
  );
}

function TrustBadge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-2.5 text-sm font-medium text-sandstone/50 transition-colors duration-300 hover:text-gold">
      <span className="text-gold/60">{icon}</span>
      {label}
    </span>
  );
}
