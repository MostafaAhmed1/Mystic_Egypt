import { createInstance } from "i18next";
import { resources } from "@/core/lib/i18n-resources";
import { defaultLocale, type Locale } from "@/core/i18n-config";

/**
 * Server-safe i18next instance. Deliberately does NOT import
 * `react-i18next` (whose React binding calls `createContext` and therefore
 * throws inside a React Server Component) — only the framework-agnostic core.
 *
 * Use for text that must be localized during SSR, e.g. BreadcrumbList labels
 * in JSON-LD so they match the visible breadcrumb.
 */
const serverI18n = createInstance();

serverI18n.init({
  resources,
  lng: defaultLocale,
  fallbackLng: defaultLocale,
  ns: ["common"],
  defaultNS: "common",
  interpolation: { escapeValue: false },
});

export function getServerT(locale: Locale) {
  return serverI18n.getFixedT(locale);
}
