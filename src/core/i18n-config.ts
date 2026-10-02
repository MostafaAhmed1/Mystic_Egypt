export const locales = ["en", "ar", "de"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export const localeNames: Record<Locale, string> = {
  en: "English",
  ar: "العربية",
  de: "Deutsch",
};

export const dir: Record<Locale, "ltr" | "rtl"> = {
  en: "ltr",
  ar: "rtl",
  de: "ltr",
};

/** BCP-47 Open Graph locale per app locale (og:locale). Locale-driven —
 *  extends automatically when new locales (e.g. hu, bg) are registered. */
export const ogLocale: Record<Locale, string> = {
  en: "en_US",
  ar: "ar_EG",
  de: "de_DE",
};
