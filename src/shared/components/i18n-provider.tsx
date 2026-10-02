"use client";

import { useEffect, useState } from "react";
import { I18nextProvider } from "react-i18next";
import { createI18n } from "@/core/lib/i18n";
import { type Locale, dir } from "@/core/i18n-config";

interface I18nProviderProps {
  children: React.ReactNode;
  locale: Locale;
}

export function I18nProvider({ children, locale }: I18nProviderProps) {
  // Created once per request on the server and once per client mount, already
  // bound to `locale` — so the server-rendered HTML is in the correct
  // language and hydration matches it (no post-hydration language flip).
  const [i18n] = useState(() => createI18n(locale));

  useEffect(() => {
    // Client-side locale switches (/en → /ar) reuse this instance: the layout
    // is not remounted, so the language must be updated here.
    if (i18n.language !== locale) {
      i18n.changeLanguage(locale);
    }
    document.documentElement.lang = locale;
    document.documentElement.dir = dir[locale];
  }, [i18n, locale]);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
