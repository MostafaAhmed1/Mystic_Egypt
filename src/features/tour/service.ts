import "server-only";
import { cache } from "react";
import { prisma } from "@/core/lib/prisma";
import { CURRENCIES } from "@/core/constants/currencies";
import type { Currency } from "@/core/constants/currencies";
import type { TourDetail, TourSummary } from "@/features/tour/types";

// Tours are created via the admin panel (M6) and are only public when "open".
const PUBLIC_TOUR_STATUS = "open";

function mapCurrency(value: string): Currency {
  if (value === CURRENCIES.GBP || value === CURRENCIES.EUR || value === CURRENCIES.USD) {
    return value;
  }
  return CURRENCIES.USD;
}

/**
 * All public (open) tours for the listing page and homepage featured section.
 * Results are cached per-request and statically generated at build time.
 */
export const listPublicTours = cache(async (): Promise<TourSummary[]> => {
  const tours = await prisma.tour.findMany({
    where: { status: PUBLIC_TOUR_STATUS },
    include: {
      images: {
        where: { is_primary: true },
        take: 1,
      },
    },
    orderBy: { created_at: "asc" },
  });

  return tours.map((tour) => ({
    id: tour.id,
    title: tour.title,
    slug: tour.slug,
    description: tour.description,
    base_price: tour.base_price,
    currency: mapCurrency(tour.currency),
    status: tour.status,
    primary_image: tour.images[0]?.image_url ?? null,
  }));
});

/** All public tour slugs, used by generateStaticParams for SSG. */
export const listPublicTourSlugs = cache(async (): Promise<string[]> => {
  const tours = await prisma.tour.findMany({
    where: { status: PUBLIC_TOUR_STATUS },
    select: { slug: true },
  });
  return tours.map((tour) => tour.slug);
});

/** A single public tour by slug, or null when not found / not open. */
export const getPublicTourBySlug = cache(
  async (slug: string): Promise<TourDetail | null> => {
    const tour = await prisma.tour.findUnique({
      where: { slug },
      include: {
        images: { orderBy: { is_primary: "desc" } },
        itinerary: { orderBy: { day_number: "asc" } },
        route: { orderBy: { order: "asc" } },
      },
    });

    if (!tour || tour.status !== PUBLIC_TOUR_STATUS) {
      return null;
    }

    return {
      id: tour.id,
      title: tour.title,
      slug: tour.slug,
      description: tour.description,
      base_price: tour.base_price,
      currency: mapCurrency(tour.currency),
      status: tour.status,
      inclusions: tour.inclusions,
      exclusions: tour.exclusions,
      images: tour.images.map((img) => ({
        id: img.id,
        image_url: img.image_url,
        is_primary: img.is_primary,
      })),
      itinerary: tour.itinerary.map((day) => ({
        id: day.id,
        day_number: day.day_number,
        title: day.title,
        description: day.description,
      })),
      route: tour.route.map((point) => ({
        id: point.id,
        order: point.order,
        label: point.label,
        lat: point.lat,
        lng: point.lng,
        is_stop: point.is_stop,
      })),
    };
  },
);
