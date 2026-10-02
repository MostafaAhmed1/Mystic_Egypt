import { createInstance } from "i18next";
import { initReactI18next } from "react-i18next";
import { resources } from "@/core/lib/i18n-resources";
import { defaultLocale, type Locale } from "@/core/i18n-config";

/**
 * Creates an i18next instance bound to `locale`.
 *
 * A factory is required for correct SSR. With the previous module-level
 * singleton the server render always read the hard-coded `"en"` default
 * (the language was only switched in a `useEffect`, i.e. after hydration),
 * so the raw HTML of /ar and /de was shipped in English.
 *
 * `init({ resources })` fills the resource store synchronously, so `t()` is
 * usable immediately — the same guarantee `i18n-server.ts` relies on.
 * On the server this is called once per request, so concurrent requests for
 * different locales can never observe each other's language.
 */
export function createI18n(locale: Locale) {
  const instance = createInstance();

  instance.use(initReactI18next).init({
    fallbackLng: defaultLocale,
    lng: locale,
    ns: ["common"],
    defaultNS: "common",
    interpolation: { escapeValue: false },
    resources,
  });

  return instance;
}
