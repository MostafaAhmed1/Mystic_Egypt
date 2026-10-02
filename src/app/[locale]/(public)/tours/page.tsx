import type { Metadata } from "next";
import { listPublicTours } from "@/features/tour/service";
import { ToursListClient } from "@/app/[locale]/(public)/tours/tours-list-client";
import { buildPageMetadata } from "@/core/utils/seo";
import { getServerT } from "@/core/lib/i18n-server";
import type { Locale } from "@/core/i18n-config";
import type { TourSummary } from "@/features/tour/types";

type ToursPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; maxPrice?: string }>;
};

export async function generateMetadata({
  params,
  searchParams,
}: ToursPageProps): Promise<Metadata> {
  const { locale } = await params;
  const { q, maxPrice } = await searchParams;
  const hasQueryParams = Boolean(q?.trim() || maxPrice?.trim());
  const t = getServerT(locale as Locale);

  const metadata = buildPageMetadata({
    pathname: "/tours",
    locale: locale as Locale,
    title: t("seo.tours.title"),
    description: t("seo.tours.description"),
  });

  return {
    ...metadata,
    ...(hasQueryParams ? { robots: { index: false, follow: true } } : {}),
  };
}

function normalizePrice(value: string | undefined): number | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

export default async function ToursPage({ params, searchParams }: ToursPageProps) {
  await params; // ensure params are resolved
  const { q, maxPrice } = await searchParams;
  const query = q?.trim().toLowerCase() ?? "";
  const budget = normalizePrice(maxPrice);

  let tours: TourSummary[] = [];
  try {
    tours = await listPublicTours();
  } catch {
    // DB not available during Docker build
  }

  const filtered = tours.filter((tour) => {
    const matchesQuery =
      !query ||
      tour.title.toLowerCase().includes(query) ||
      tour.description.toLowerCase().includes(query);
    const matchesBudget = budget === null || tour.base_price <= budget;
    return matchesQuery && matchesBudget;
  });

  return <ToursListClient tours={filtered} />;
}
