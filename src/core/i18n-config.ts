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
