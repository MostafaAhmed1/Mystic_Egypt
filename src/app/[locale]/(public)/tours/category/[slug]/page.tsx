import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getPublicCategoryTours,
  listPublicCategorySlugs,
} from "@/features/tour/service";
import { ToursListClient } from "@/app/[locale]/(public)/tours/tours-list-client";
import { buildPageMetadata } from "@/core/utils/seo";
import { getServerT } from "@/core/lib/i18n-server";
import type { Locale } from "@/core/i18n-config";
import type { TourCategoryDto } from "@/features/tour/types";

export const dynamicParams = true;
export const revalidate = 300;

type CategoryPageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateStaticParams() {
  try {
    const slugs = await listPublicCategorySlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    // DB not available during Docker build — pages will be SSR'd on demand
    return [];
  }
}

function localizedName(category: TourCategoryDto, locale: Locale): string {
  if (locale === "ar") return category.name_ar || category.name_en;
  if (locale === "de") return category.name_de || category.name_en;
  return category.name_en;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const result = await getPublicCategoryTours(slug);
  if (!result) return { title: "Category not found" };

  const t = getServerT(locale as Locale);
  const name = localizedName(result.category, locale as Locale);
  return buildPageMetadata({
    pathname: `/tours/category/${slug}`,
    locale: locale as Locale,
    title: t("seo.tourCategory.title", { name }),
    description: t("seo.tourCategory.description", { name }),
  });
}

export default async function CategoryToursPage({ params }: CategoryPageProps) {
  const { locale, slug } = await params;
  const result = await getPublicCategoryTours(slug);
  if (!result) notFound();

  const t = getServerT(locale as Locale);
  const name = localizedName(result.category, locale as Locale);

  return (
    <ToursListClient
      tours={result.tours}
      eyebrow={t("tours.categoryEyebrow")}
      heading={name}
      subtitle={t("tours.categorySubtitle", { name })}
      showSearch={false}
    />
  );
}
