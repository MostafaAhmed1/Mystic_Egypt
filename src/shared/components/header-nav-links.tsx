"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useLocale } from "@/shared/hooks/use-locale";

export function HeaderNavLinks() {
  const { t } = useTranslation();
  const { href } = useLocale();

  return (
    <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
      <Link
        href={href("/tours")}
        className="text-foreground/80 transition-colors hover:text-foreground"
      >
        {t("nav.tours")}
      </Link>
      <Link
        href={href("/#why-us")}
        className="text-foreground/80 transition-colors hover:text-foreground"
      >
        {t("nav.whyUs")}
      </Link>
    </nav>
  );
}
