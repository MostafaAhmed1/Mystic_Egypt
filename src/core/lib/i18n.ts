import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "../../../public/locales/en/common.json";
import ar from "../../../public/locales/ar/common.json";
import de from "../../../public/locales/de/common.json";

i18n.use(initReactI18next).init({
  fallbackLng: "en",
  lng: "en",
  ns: ["common"],
  defaultNS: "common",
  interpolation: {
    escapeValue: false,
  },
  resources: {
    en: { common: en },
    ar: { common: ar },
    de: { common: de },
  },
});

export function changeLanguage(lng: string) {
  return i18n.changeLanguage(lng);
}

export default i18n;
