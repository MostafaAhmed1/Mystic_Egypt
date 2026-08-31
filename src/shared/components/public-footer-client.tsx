"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { BrandLogo } from "@/shared/components/brand-logo";
import { ShieldCheck, Wallet, MapPin } from "lucide-react";
import { useLocale } from "@/shared/hooks/use-locale";

export function PublicFooter() {
  const { t } = useTranslation();
  const { href } = useLocale();

  return (
    <footer className="border-t bg-muted/40">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 md:flex-row md:justify-between">
        <div className="max-w-sm space-y-4">
          <BrandLogo href={href("/")} />
          <p className="text-sm text-muted-foreground">
            {t("footer.description")}
          </p>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="inline-flex items-center gap-2">
              <ShieldCheck className="size-4 text-primary" aria-hidden />
              {t("footer.ukRegistered")}
            </p>
            <p className="inline-flex items-center gap-2">
              <Wallet className="size-4 text-primary" aria-hidden />
              {t("footer.bestPrices")}
            </p>
            <p className="inline-flex items-center gap-2">
              <MapPin className="size-4 text-primary" aria-hidden />
              {t("footer.localExperts")}
            </p>
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold">{t("footer.explore")}</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href={href("/tours")} className="hover:text-foreground">
                {t("nav.tours")}
              </Link>
            </li>
            <li>
              <Link href={href("/#why-us")} className="hover:text-foreground">
                {t("footer.whyChooseUs")}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold">{t("footer.account")}</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href={href("/login")} className="hover:text-foreground">
                {t("footer.login")}
              </Link>
            </li>
            <li>
              <Link href={href("/register")} className="hover:text-foreground">
                {t("footer.createAccount")}
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-muted-foreground sm:flex-row sm:px-6">
          <p>&copy; {new Date().getFullYear()} {t("footer.copyright")}</p>
          <p>mysticegypt.net</p>
        </div>
      </div>
    </footer>
  );
}
