import en from "../../../public/locales/en/common.json";
import ar from "../../../public/locales/ar/common.json";
import de from "../../../public/locales/de/common.json";
import hu from "../../../public/locales/hu/common.json";

/**
 * Single source of truth for translation bundles, shared by the client
 * i18next instance (`i18n.ts`) and the server-safe instance (`i18n-server.ts`).
 */
export const resources = {
  en: { common: en },
  ar: { common: ar },
  de: { common: de },
  hu: { common: hu },
};
