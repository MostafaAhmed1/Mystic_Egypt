import type { Metadata } from "next";
import { listPublicTours } from "@/features/tour/service";
import { HomePageClient } from "@/app/[locale]/(public)/home-page-client";
import { buildPageMetadata } from "@/core/utils/seo";
import { getServerT } from "@/core/lib/i18n-server";
import type { Locale } from "@/core/i18n-config";
import type { TourSummary } from "@/features/tour/types";
import {
  listPublicHomepageCategories,
  listPublicHomepageOffers,
  listPublicHomepageServices,
} from "@/features/homepage/service";
import type { HomepageCategory, HomepageOffer, HomepageService } from "@/features/homepage/types";

export const revalidate = 60;

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = getServerT(locale as Locale);

  return buildPageMetadata({
    pathname: "/",
    locale: locale as Locale,
    title: t("seo.home.title"),
    description: t("seo.home.description"),
  });
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  const currentLocale = locale as Locale;
  const [tourResult, categoryResult, serviceResult, offerResult] = await Promise.allSettled([
    listPublicTours(),
    listPublicHomepageCategories(currentLocale),
    listPublicHomepageServices(currentLocale),
    listPublicHomepageOffers(currentLocale),
  ]);

  const tours: TourSummary[] = tourResult.status === "fulfilled" ? tourResult.value : [];
  const categories: HomepageCategory[] = categoryResult.status === "fulfilled" ? categoryResult.value : [];
  const services: HomepageService[] = serviceResult.status === "fulfilled" ? serviceResult.value : [];
  const offers: HomepageOffer[] = offerResult.status === "fulfilled" ? offerResult.value : [];

  return <HomePageClient tours={tours} categories={categories} services={services} offers={offers} />;
}
