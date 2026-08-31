"use client";

import { useTranslation } from "react-i18next";
import { TourCard } from "@/features/tour/components/TourCard";
import { TourSearchBar } from "@/features/tour/components/TourSearchBar";
import type { TourSummary } from "@/features/tour/types";

export function ToursListClient({ tours }: { tours: TourSummary[] }) {
  const { t } = useTranslation("common");

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          {t("nav.tours")}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {t("tours.featuredSubtitle")}
        </p>
      </div>

      <div className="mb-8">
        <TourSearchBar />
      </div>

      {tours.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-12 text-center text-muted-foreground">
          {t("tours.noToursFound")}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tours.map((tour) => (
            <TourCard key={tour.id} tour={tour} />
          ))}
        </div>
      )}
    </div>
  );
}
