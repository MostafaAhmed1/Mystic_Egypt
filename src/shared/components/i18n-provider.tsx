"use client";

import { useEffect, useState } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "@/core/lib/i18n";
import { type Locale, defaultLocale, dir } from "@/core/i18n-config";

function getLocaleFromCookie(): Locale {
  if (typeof document === "undefined") return defaultLocale;
  const match = document.cookie.match(/locale=([a-z]{2})/);
  if (match && ["en", "ar", "de"].includes(match[1])) {
    return match[1] as Locale;
  }
  return defaultLocale;
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>(defaultLocale);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const detected = getLocaleFromCookie();
    setLocale(detected);
    if (i18n.language !== detected) {
      i18n.changeLanguage(detected);
    }
    document.documentElement.lang = detected;
    document.documentElement.dir = dir[detected];
    setMounted(true);
  }, []);

  if (!mounted) {
    return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
  }

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
