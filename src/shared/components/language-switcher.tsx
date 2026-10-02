"use client";

import { useTranslation } from "react-i18next";
import { useRouter, usePathname } from "next/navigation";
import { locales, localeNames, type Locale } from "@/core/i18n-config";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/shared/components/ui/dropdown-menu";
import { Button } from "@/shared/components/ui/button";
import { Languages } from "lucide-react";
import { cn } from "@/core/utils";

type LanguageSwitcherProps = {
  variant?: "light" | "dark";
};

const TONE_CLASSES = {
  light: "text-obsidian/70 hover:bg-gold/10 hover:text-gold",
  dark: "text-sandstone/80 hover:bg-sandstone/10 hover:text-gold",
} as const;

function setLocaleCookie(locale: Locale) {
  document.cookie = `locale=${locale}; path=/; max-age=${365 * 24 * 60 * 60}`;
}

export function LanguageSwitcher({ variant = "light" }: LanguageSwitcherProps) {
  const { i18n } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = i18n.language as Locale;

  function switchLocale(newLocale: Locale) {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length > 0 && locales.includes(segments[0] as Locale)) {
      segments[0] = newLocale;
    } else {
      segments.unshift(newLocale);
    }
    const newPath = "/" + segments.join("/");
    setLocaleCookie(newLocale);
    router.push(newPath);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="lg"
            aria-label={localeNames[currentLocale]}
            className={cn("gap-2 px-3", TONE_CLASSES[variant])}
          />
        }
      >
        <Languages className="size-6" aria-hidden />
        <span className="font-semibold">{currentLocale.toUpperCase()}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((locale) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => switchLocale(locale)}
            className={locale === currentLocale ? "font-bold text-gold" : ""}
          >
            {localeNames[locale]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
