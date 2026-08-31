import type { Metadata } from "next";
import { listPublicTours } from "@/features/tour/service";
import { ToursListClient } from "@/app/[locale]/(public)/tours/tours-list-client";
import { buildAlternates } from "@/core/utils/seo";
import type { Locale } from "@/core/i18n-config";

type ToursPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; maxPrice?: string }>;
};

export async function generateMetadata({ params }: ToursPageProps): Promise<Metadata> {
  const { locale } = await params;
  const alternates = buildAlternates("/tours", locale as Locale);

  return {
    title: "Tours",
    description:
      "Browse authentic Egyptian tours — from the Pyramids of Giza to the White Desert — with transparent local pricing.",
    openGraph: {
      title: "Tours | Mystic Egypt",
      description:
        "Browse authentic Egyptian tours — from the Pyramids of Giza to the White Desert — with transparent local pricing.",
      url: `https://mysticegypt.net/${locale}/tours`,
      siteName: "Mystic Egypt",
      locale: "en_US",
      type: "website",
    },
    ...alternates,
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

  const tours = await listPublicTours();
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
