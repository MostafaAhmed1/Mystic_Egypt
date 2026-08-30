"use client";

import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { locales, localeNames, type Locale } from "@/core/i18n-config";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/shared/components/ui/dropdown-menu";
import { Button } from "@/shared/components/ui/button";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const router = useRouter();
  const currentLocale = i18n.language as Locale;

  function switchLocale(locale: Locale) {
    document.cookie = `locale=${locale}; path=/; max-age=${365 * 24 * 60 * 60}`;
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
        <Globe className="size-4" aria-hidden />
        <span className="sr-only">{localeNames[currentLocale]}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((locale) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => switchLocale(locale)}
            className={locale === currentLocale ? "font-bold" : ""}
          >
            {localeNames[locale]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
