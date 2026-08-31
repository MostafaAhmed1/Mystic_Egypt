"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { TourImage } from "@/features/tour/components/TourImage";
import { formatCurrency } from "@/core/utils";
import { useLocale } from "@/shared/hooks/use-locale";
import type { TourSummary } from "@/features/tour/types";

export function TourCard({ tour }: { tour: TourSummary }) {
  const { t } = useTranslation("common");
  const { href } = useLocale();
  return (
    <Card className="group/card overflow-hidden">
      <div className="relative aspect-[4/3] w-full">
        <TourImage
          src={tour.primary_image}
          alt={tour.title}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          fill
          className="object-cover group-hover/card:scale-[1.02] transition-transform duration-300"
          fallbackLabel={tour.title}
        />
      </div>
      <CardContent className="flex flex-col gap-3 px-4 py-4">
        <h3 className="font-heading text-lg leading-snug font-medium">
          <Link href={href(`/tours/${tour.slug}`)} className="hover:underline">
            {tour.title}
          </Link>
        </h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">{tour.description}</p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <span className="text-sm text-muted-foreground">
            {t("tours.from")}{" "}
            <span className="font-semibold text-foreground">
              {formatCurrency(tour.base_price, tour.currency)}
            </span>
          </span>
          <Link
            href={href(`/tours/${tour.slug}`)}
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            {t("favourites.viewTour")}
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
