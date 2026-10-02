import type { Currency } from "@/core/constants/currencies";

export interface GroupPriceTier {
  min_people: number;
  max_people: number;
  price_per_person: number;
}

/** A single point on a tour's route, used by the Leaflet map. */
export interface TourPointDto {
  id: string;
  order: number;
  label: string;
  lat: number;
  lng: number;
  is_stop: boolean;
}

/** One day of the tour itinerary. */
export interface ItineraryDto {
  id: string;
  day_number: number;
  title: string;
  description: string;
}

/** A tour image; only the primary image is used on cards, all in the gallery. */
export interface TourImageDto {
  id: string;
  image_url: string;
  is_primary: boolean;
}

/** Public-facing representation of a tour (never exposes admin/DB internals). */
export interface TourSummary {
  id: string;
  title: string;
  slug: string;
  description: string;
  base_price: number;
  group_prices: GroupPriceTier[] | null;
  currency: Currency;
  status: string;
  /** Human-readable trip duration, e.g. "1 Day", "8 Days". */
  duration: string | null;
  /** Primary image URL, or null when none has been uploaded yet. */
  primary_image: string | null;
}

/** Full tour detail (single tour page), including itineraries and route. */
export interface TourDetail {
  id: string;
  title: string;
  slug: string;
  description: string;
  base_price: number;
  group_prices: GroupPriceTier[] | null;
  currency: Currency;
  status: string;
  /** Featured in the homepage hot-offers bar/section (admin toggle). */
  isOffer: boolean;
  /** Human-readable trip duration, e.g. "1 Day", "8 Days". */
  duration: string | null;
  /** Newline-delimited "what's included" items, or null when unset. */
  inclusions: string | null;
  /** Newline-delimited "what's not included" items, or null when unset. */
  exclusions: string | null;
  images: TourImageDto[];
  itinerary: ItineraryDto[];
  route: TourPointDto[];
}
