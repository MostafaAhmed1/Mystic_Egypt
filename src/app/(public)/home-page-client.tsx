"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import {
  Landmark,
  ShieldCheck,
  Wallet,
  CarFront,
} from "lucide-react";
import { TourSearchBar } from "@/features/tour/components/TourSearchBar";
import type { TourSummary } from "@/features/tour/types";
import { TourCard } from "@/features/tour/components/TourCard";

export function HomePageClient({ tours }: { tours: TourSummary[] }) {
  const { t } = useTranslation();

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b bg-gradient-to-br from-amber-50 via-orange-50 to-stone-100">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-4 py-20 text-center sm:px-6 sm:py-28">
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            <Landmark className="size-3.5" aria-hidden />
            {t("hero.badge")}
          </span>
          <h1 className="font-heading max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
            {t("hero.title")}
          </h1>
          <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
            {t("hero.subtitle")}
          </p>
          <div className="mt-8 w-full sm:flex sm:justify-center">
            <TourSearchBar />
          </div>
        </div>
      </section>

      {/* Featured tours */}
      {tours.length > 0 && (
        <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
                {t("tours.featured")}
              </h2>
              <p className="mt-1 text-muted-foreground">
                {t("tours.featuredSubtitle")}
              </p>
            </div>
            <Link
              href="/tours"
              className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              {t("tours.viewAll")}
              <span aria-hidden>→</span>
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tours.map((tour) => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>
        </section>
      )}

      {/* Why us */}
      <section id="why-us" className="border-t bg-muted/40">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="font-heading mb-8 text-center text-2xl font-semibold tracking-tight sm:text-3xl">
            {t("whyUs.title")}
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            <WhyUsCard
              icon={<ShieldCheck className="size-6" aria-hidden />}
              title={t("whyUs.ukEntity.title")}
              description={t("whyUs.ukEntity.description")}
            />
            <WhyUsCard
              icon={<CarFront className="size-6" aria-hidden />}
              title={t("whyUs.transfers.title")}
              description={t("whyUs.transfers.description")}
            />
            <WhyUsCard
              icon={<Wallet className="size-6" aria-hidden />}
              title={t("whyUs.prices.title")}
              description={t("whyUs.prices.description")}
            />
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
          <TrustBadge label={t("trust.securePayment")} />
          <TrustBadge label={t("trust.support247")} />
          <TrustBadge label={t("trust.licensedGuides")} />
          <TrustBadge label={t("trust.noHiddenFees")} />
        </div>
      </section>
    </>
  );
}

function WhyUsCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border bg-card p-6 text-center">
      <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="font-heading mb-2 font-medium">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function TrustBadge({ label }: { label: string }) {
  return <span className="inline-flex items-center gap-1.5">{label}</span>;
}
