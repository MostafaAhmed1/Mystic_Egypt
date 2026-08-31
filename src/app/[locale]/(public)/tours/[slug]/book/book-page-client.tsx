"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { formatCurrency } from "@/core/utils";
import { CheckoutForm } from "@/features/booking/components/CheckoutForm";
import type { BookableTour, AddonDto } from "@/features/booking/types";
import { useLocale } from "@/shared/hooks/use-locale";

export function BookPageClient({
  tour,
  addons,
  userName,
  stripePublishableKey,
}: {
  tour: BookableTour;
  addons: AddonDto[];
  userName: string;
  stripePublishableKey: string;
}) {
  const { t } = useTranslation("common");
  const { href } = useLocale();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <nav className="mb-6 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link href={href("/")} className="hover:text-foreground">
          {t("nav.home", "Home")}
        </Link>
        <span className="mx-2" aria-hidden>
          /
        </span>
        <Link href={href("/tours")} className="hover:text-foreground">
          {t("nav.tours")}
        </Link>
        <span className="mx-2" aria-hidden>
          /
        </span>
        <Link href={href(`/tours/${tour.slug}`)} className="hover:text-foreground">
          {tour.title}
        </Link>
        <span className="mx-2" aria-hidden>
          /
        </span>
        <span className="text-foreground">{t("bookPage.book")}</span>
      </nav>

      <header className="mb-8">
        <h1 className="font-heading text-2xl font-semibold sm:text-3xl">
          {t("bookPage.book")} {tour.title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {formatCurrency(tour.base_price, tour.currency)} {t("tours.perPerson")} ·{" "}
          {userName}
        </p>
      </header>

      <CheckoutForm
        tour={tour}
        addons={addons}
        stripePublishableKey={stripePublishableKey}
      />
    </div>
  );
}
