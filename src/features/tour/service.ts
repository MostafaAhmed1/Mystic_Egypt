import "server-only";
import { cache } from "react";
import { prisma } from "@/core/lib/prisma";
import { CURRENCIES } from "@/core/constants/currencies";
import type { Currency } from "@/core/constants/currencies";
import type { TourDetail, TourSummary, GroupPriceTier } from "@/features/tour/types";

// Tours are created via the admin panel (M6) and are only public when "open".
const PUBLIC_TOUR_STATUS = "open";

// Generic tour vocabulary (never a place name) — excluded when deriving a
// tour's destination keywords from its slug. See `destinationTokens`.
const RELATED_STOPWORDS = new Set([
  "trip",
  "trips",
  "tour",
  "tours",
  "program",
  "programs",
  "excursion",
  "excursions",
  "day",
  "days",
  "city",
  "classic",
  "cruise",
  "adventure",
]);

// How many candidate tours to consider before ranking (keeps the query bounded).
const RELATED_CANDIDATE_LIMIT = 12;

type TourWithPrimaryImage = {
  id: string;
  title: string;
  slug: string;
  description: string;
  base_price: number;
  group_prices: unknown;
  currency: string;
  status: string;
  duration: string | null;
  images: { image_url: string }[];
};

function mapCurrency(value: string): Currency {
  if (value === CURRENCIES.GBP || value === CURRENCIES.EUR || value === CURRENCIES.USD) {
    return value;
  }
  return CURRENCIES.USD;
}

function toTourSummary(tour: TourWithPrimaryImage): TourSummary {
  return {
    id: tour.id,
    title: tour.title,
    slug: tour.slug,
    description: tour.description,
    base_price: tour.base_price,
    group_prices: parseGroupPrices(tour.group_prices),
    currency: mapCurrency(tour.currency),
    status: tour.status,
    duration: tour.duration,
    primary_image: tour.images[0]?.image_url ?? null,
  };
}

function parseGroupPrices(raw: unknown): GroupPriceTier[] | null {
  if (!raw || !Array.isArray(raw)) return null;
  const tiers = raw as Record<string, unknown>[];
  return tiers
    .filter(
      (t) =>
        typeof t.min_people === "number" &&
        typeof t.max_people === "number" &&
        typeof t.price_per_person === "number",
    )
    .map((t) => ({
      min_people: t.min_people as number,
      max_people: t.max_people as number,
      price_per_person: t.price_per_person as number,
    }));
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

  return tours.map(toTourSummary);
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
      group_prices: parseGroupPrices(tour.group_prices),
      currency: mapCurrency(tour.currency),
      status: tour.status,
      duration: tour.duration,
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

/**
 * Destination keywords for a tour, derived from its slug (the only
 * destination signal present on every tour — route stops are sparse).
 * E.g. "hurghada-luxor-cairo-excursions-program" → ["hurghada","luxor","cairo"].
 */
function destinationTokens(slug: string): string[] {
  return slug
    .toLowerCase()
    .split("-")
    .filter((token) => token.length > 3 && !RELATED_STOPWORDS.has(token));
}

/**
 * Related tours for a tour detail page: same-destination tours first
 * (destination = a shared slug keyword), ordered newest-first, then topped up
 * with the newest remaining tours so the section is never short.
 *
 * Performance: at most two bounded queries (limit ≤ 12 then ≤ limit), each
 * reusing the primary-image include already used by `listPublicTours`; the
 * result is cached per request.
 */
export const listRelatedTours = cache(
  async (slug: string, limit = 3): Promise<TourSummary[]> => {
    const tokens = destinationTokens(slug);

    const candidates = tokens.length
      ? await prisma.tour.findMany({
          where: {
            status: PUBLIC_TOUR_STATUS,
            slug: { not: slug },
            OR: tokens.map((token) => ({ slug: { contains: token } })),
          },
          include: { images: { where: { is_primary: true }, take: 1 } },
          orderBy: { created_at: "desc" },
          take: RELATED_CANDIDATE_LIMIT,
        })
      : [];

    const matches = candidates.slice(0, limit);

    const pickedSlugs = [slug, ...candidates.map((tour) => tour.slug)];
    const fillers =
      matches.length < limit
        ? await prisma.tour.findMany({
            where: {
              status: PUBLIC_TOUR_STATUS,
              slug: { notIn: pickedSlugs },
            },
            include: { images: { where: { is_primary: true }, take: 1 } },
            orderBy: { created_at: "desc" },
            take: limit - matches.length,
          })
        : [];

    return [...matches, ...fillers].map(toTourSummary);
  },
);

