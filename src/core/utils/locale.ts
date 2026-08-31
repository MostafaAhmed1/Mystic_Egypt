import { locales, defaultLocale, type Locale } from "@/core/i18n-config";

/**
 * Extract locale from a URL pathname.
 * E.g. "/en/tours" → "en", "/tours" → null
 */
export function extractLocale(pathname: string): Locale | null {
  const first = pathname.split("/").filter(Boolean)[0];
  if (first && locales.includes(first as Locale)) {
    return first as Locale;
  }
  return null;
}

/**
 * Build a locale-prefixed path.
 * E.g. localizedPath("ar", "/tours") → "/ar/tours"
 */
export function localizedPath(locale: Locale, path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `/${locale}${clean}`;
}

/**
 * Get the locale from a cookie string.
 */
export function getLocaleFromCookieString(cookie: string | undefined): Locale | null {
  if (!cookie) return null;
  const match = cookie.match(/locale=([a-z]{2})/);
  if (match && locales.includes(match[1] as Locale)) {
    return match[1] as Locale;
  }
  return null;
}

/**
 * Get default localized path (used in server components where locale is known from params).
 */
export function defaultLocalizedPath(path: string): string {
  return localizedPath(defaultLocale, path);
}
