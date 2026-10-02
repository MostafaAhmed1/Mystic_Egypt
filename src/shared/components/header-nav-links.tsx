"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useLocale } from "@/shared/hooks/use-locale";

export function HeaderNavLinks() {
  const { t } = useTranslation();
  const { href } = useLocale();

  return (
    <nav className="hidden items-center gap-1 text-sm font-medium md:flex">
      <Link
        href={href("/#services")}
        className="group relative px-4 py-2 text-obsidian/70 transition-colors duration-300 hover:text-obsidian"
      >
        {t("nav.services")}
        <span className="absolute bottom-0 left-1/2 h-0.5 w-0 -translate-x-1/2 bg-gold transition-all duration-300 group-hover:w-3/4" />
      </Link>
      <Link
        href={href("/#categories")}
        className="group relative px-4 py-2 text-obsidian/70 transition-colors duration-300 hover:text-obsidian"
      >
        {t("nav.categories")}
        <span className="absolute bottom-0 left-1/2 h-0.5 w-0 -translate-x-1/2 bg-gold transition-all duration-300 group-hover:w-3/4" />
      </Link>
      <Link
        href={href("/tours")}
        className="group relative px-4 py-2 text-obsidian/70 transition-colors duration-300 hover:text-obsidian"
      >
        {t("nav.tours")}
        <span className="absolute bottom-0 left-1/2 h-0.5 w-0 -translate-x-1/2 bg-gold transition-all duration-300 group-hover:w-3/4" />
      </Link>
      <Link
        href={href("/#why-us")}
        className="group relative px-4 py-2 text-obsidian/70 transition-colors duration-300 hover:text-obsidian"
      >
        {t("nav.whyUs")}
        <span className="absolute bottom-0 left-1/2 h-0.5 w-0 -translate-x-1/2 bg-gold transition-all duration-300 group-hover:w-3/4" />
      </Link>
      <Link
        href={href("/contact")}
        className="group relative px-4 py-2 text-obsidian/70 transition-colors duration-300 hover:text-obsidian"
      >
        {t("nav.contact")}
        <span className="absolute bottom-0 left-1/2 h-0.5 w-0 -translate-x-1/2 bg-gold transition-all duration-300 group-hover:w-3/4" />
      </Link>
    </nav>
  );
}
