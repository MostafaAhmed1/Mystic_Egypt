import { locales, defaultLocale, type Locale } from "@/core/i18n-config";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://mysticegypt.net";

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
    languages[loc] = `${baseUrl}/${loc}${cleanPath}`;
  }
  languages["x-default"] = `${baseUrl}/${defaultLocale}${cleanPath}`;

  return {
    alternates: {
      canonical: `${baseUrl}/${locale}${cleanPath}`,
      languages,
    },
  };
}
