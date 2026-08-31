"use client";

import { usePathname } from "next/navigation";
import { extractLocale, localizedPath } from "@/core/utils/locale";
import type { Locale } from "@/core/i18n-config";

/**
 * Hook for client components to get the current locale and build locale-aware paths.
 */
export function useLocale() {
  const pathname = usePathname();
  const locale = (extractLocale(pathname) ?? "en") as Locale;

  function href(path: string): string {
    return localizedPath(locale, path);
  }

  return { locale, href };
}
