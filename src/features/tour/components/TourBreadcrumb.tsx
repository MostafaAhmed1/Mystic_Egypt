import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getServerT } from "@/core/lib/i18n-server";
import { localizedPath } from "@/core/utils/locale";
import type { Locale } from "@/core/i18n-config";

interface TourBreadcrumbProps {
  locale: Locale;
  title: string;
}

/**
 * Server-rendered breadcrumb. Kept out of the client TourContent so the links
 * and the localized labels are present in the initial HTML (crawlable without
 * JS) and match the BreadcrumbList JSON-LD exactly, in every locale.
 */
export function TourBreadcrumb({ locale, title }: TourBreadcrumbProps) {
  const t = getServerT(locale);

  return (
    <nav
      className="mb-8 flex items-center gap-2 text-sm text-obsidian/40"
      aria-label="Breadcrumb"
    >
      <Link href={localizedPath(locale, "/")} className="transition-colors hover:text-gold">
        {t("nav.home")}
      </Link>
      <ChevronRight className="size-3" aria-hidden />
      <Link href={localizedPath(locale, "/tours")} className="transition-colors hover:text-gold">
        {t("nav.tours")}
      </Link>
      <ChevronRight className="size-3" aria-hidden />
      <span className="text-obsidian/70">{title}</span>
    </nav>
  );
}
