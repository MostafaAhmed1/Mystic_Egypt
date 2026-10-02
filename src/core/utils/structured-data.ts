import { SITE_URL } from "@/core/utils/seo";
import {
  BUSINESS,
  BUSINESS_ADDRESSES,
  BUSINESS_CONTACT_POINTS,
} from "@/core/constants/business";

/** A single serializable JSON-LD object (no `any`, no cycles). */
export type JsonLdObject = Record<string, unknown>;

/** One item of a BreadcrumbList. */
export interface BreadcrumbItem {
  name: string;
  url: string;
}

/** Organization entity — site-wide, rendered on every page via the root layout. */
export function organizationSchema(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: BUSINESS.name,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    slogan: "Authentic Egyptian tours, protected by UK standards.",
    description:
      "UK-registered Egyptian travel experts offering authentic small-group tours across Egypt with transparent local pricing and no hidden fees.",
    sameAs: [BUSINESS.facebook, BUSINESS.instagram],
    address: BUSINESS_ADDRESSES,
    contactPoint: BUSINESS_CONTACT_POINTS,
    areaServed: ["EG", "GB"],
    knowsAbout: [
      "Egypt tourism",
      "Nile cruises",
      "Cairo day trips",
      "Luxor temple tours",
      "Red Sea excursions",
      "White Desert camping",
    ],
  };
}

/** WebSite entity — site-wide, localized per rendered locale. */
export function websiteSchema(locale: string): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Mystic Egypt",
    url: SITE_URL,
    inLanguage: locale,
  };
}

/** BreadcrumbList — mirrors the visible breadcrumb nav on the page. */
export function breadcrumbSchema(items: BreadcrumbItem[]): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/** TouristTrip — the product being sold. Built server-side from the tour detail. */
export function touristTripSchema(input: {
  title: string;
  description: string;
  url: string;
  image: string | null;
  currency: string;
  price: number;
  itinerary: Array<{ title: string; description: string }>;
}): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: input.title,
    description: input.description,
    url: input.url,
    ...(input.image ? { image: input.image } : {}),
    touristType: "International and local travellers",
    itinerary: input.itinerary.map((day) => ({
      "@type": "TouristAttraction",
      name: day.title,
      description: day.description,
    })),
    offers: {
      "@type": "Offer",
      price: input.price,
      priceCurrency: input.currency,
      availability: "https://schema.org/InStock",
    },
  };
}