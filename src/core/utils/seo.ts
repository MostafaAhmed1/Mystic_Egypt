import type { Metadata } from "next";
import { locales, defaultLocale, ogLocale, type Locale } from "@/core/i18n-config";

/** Site origin (used for canonical URLs, OG images and JSON-LD absolute URLs). */
export const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://mysticegypt.net";

/** Site-wide fallback OG image for pages without a dedicated hero image. */
export const DEFAULT_OG_IMAGE_PATH = "/uploads/stock/hero-pyramids.jpg";
const DEFAULT_OG_IMAGE = resolveAbsoluteImageUrl(DEFAULT_OG_IMAGE_PATH);
/**
 * Alt text for the site-wide fallback OG image. The image is shared across all
 * locales (the photograph itself is not localized), so this is intentionally a
 * single descriptive string; pages with their own image pass a localized alt.
 */
const DEFAULT_OG_IMAGE_ALT = "Pyramids at golden hour in Egypt — Mystic Egypt tours";

/** Options for the centralized page metadata builder. */
export interface PageMetadataOptions {
  /** Route path without locale prefix, e.g. "/", "/tours", "/tours/foo", "/contact". */
  pathname: string;
  locale: Locale;
  title: string;
  description: string;
  /** Optional OG/twitter image. Falls back to the site-wide hero image. */
  ogImage?: string | null;
  /** Alt text for the OG image (used for tour pages). */
  ogImageAlt?: string;
  ogType?: "website" | "article";
  /**
   * When true, `title` is emitted verbatim as an absolute title — the locale
   * layout template `%s | Mystic Egypt` does NOT apply. Use when the title
   * itself already contains the brand (e.g. CMS page titled "About Mystic Egypt")
   * to avoid duplicated branding like "About Mystic Egypt | Mystic Egypt".
   */
  absoluteTitle?: boolean;
}

/**
 * Build complete page Metadata: title, description, canonical + hreflang
 * (via buildAlternates), openGraph (siteName, locale, image) and twitter card.
 * Single source of truth for all public pages — locale-driven, HU/BG-ready.
 */
export function buildPageMetadata(options: PageMetadataOptions): Metadata {
  const {
    pathname,
    locale,
    title,
    description,
    ogImage,
    ogImageAlt,
    ogType = "website",
    absoluteTitle = false,
  } = options;

  const image = ogImage ?? DEFAULT_OG_IMAGE;
  const cleanPath = pathname.startsWith("/") ? pathname : `/${pathname}`;

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/${locale}${cleanPath}`,
      siteName: "Mystic Egypt",
      locale: ogLocale[locale],
      type: ogType,
      ...(image
        ? { images: [{ url: image, alt: ogImageAlt ?? DEFAULT_OG_IMAGE_ALT }] }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
    ...buildAlternates(cleanPath, locale),
  };
}

/**
 * Resolve any stored image reference to an absolute URL for OG/twitter meta.
 * Handles both relative local uploads ("/uploads/...") and already-absolute
 * URLs (legacy seed values). Returns null when the value is empty.
 */
export function resolveAbsoluteImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  return `${SITE_URL}${url.startsWith("/") ? url : `/${url}`}`;
}

/**
 * Build hreflang alternate links for a given path and locale.
 * Returns the `alternates` object for Next.js Metadata export.
 */
export function buildAlternates(
  pathname: string,
  locale: Locale,
): { alternates: { canonical: string; languages: Record<string, string> } } {
  const cleanPath = pathname.startsWith("/") ? pathname : `/${pathname}`;

  const languages: Record<string, string> = {};
  for (const loc of locales) {
    languages[loc] = `${SITE_URL}/${loc}${cleanPath}`;
  }
  languages["x-default"] = `${SITE_URL}/${defaultLocale}${cleanPath}`;

  return {
    alternates: {
      canonical: `${SITE_URL}/${locale}${cleanPath}`,
      languages,
    },
  };
}
