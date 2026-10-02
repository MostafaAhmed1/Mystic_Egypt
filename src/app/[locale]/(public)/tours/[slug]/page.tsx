import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getPublicTourBySlug,
  listPublicTourSlugs,
  listRelatedTours,
} from "@/features/tour/service";
import { TourContent } from "@/features/tour/components/TourContent";
import { TourBreadcrumb } from "@/features/tour/components/TourBreadcrumb";
import { JsonLd } from "@/shared/components/json-ld";
import { buildPageMetadata, resolveAbsoluteImageUrl, SITE_URL } from "@/core/utils/seo";
import {
  breadcrumbSchema,
  touristTripSchema,
} from "@/core/utils/structured-data";
import { getServerT } from "@/core/lib/i18n-server";
import type { Locale } from "@/core/i18n-config";

export const dynamicParams = true;
export const revalidate = 300;

export async function generateStaticParams() {
  try {
    const slugs = await listPublicTourSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    // DB not available during Docker build — pages will be SSR'd on demand
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const tour = await getPublicTourBySlug(slug);
  if (!tour) return { title: "Tour not found" };

  const primaryImage = resolveAbsoluteImageUrl(
    tour.images.find((img) => img.is_primary)?.image_url ??
      tour.images[0]?.image_url ??
      null,
  );

  const t = getServerT(locale as Locale);

  return buildPageMetadata({
    pathname: `/tours/${tour.slug}`,
    locale: locale as Locale,
    title: tour.title,
    description: t("seo.tour.description", { title: tour.title }),
    ogType: "article",
    ogImage: primaryImage,
    ogImageAlt: tour.title,
  });
}

export default async function TourPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const [tour, relatedTours] = await Promise.all([
    getPublicTourBySlug(slug),
    listRelatedTours(slug),
  ]);

  if (!tour) {
    notFound();
  }

  const primaryImage = resolveAbsoluteImageUrl(
    tour.images.find((img) => img.is_primary)?.image_url ??
      tour.images[0]?.image_url ??
      null,
  );

  // Translated with the same keys as the visible breadcrumb in TourContent so
  // the BreadcrumbList labels match what the user sees in every locale.
  const t = getServerT(locale as Locale);
  const breadcrumb = breadcrumbSchema([
    { name: t("nav.home"), url: `${SITE_URL}/${locale}/` },
    { name: t("nav.tours"), url: `${SITE_URL}/${locale}/tours` },
    { name: tour.title, url: `${SITE_URL}/${locale}/tours/${tour.slug}` },
  ]);

  const touristTrip =
    tour.itinerary.length > 0
      ? touristTripSchema({
          title: tour.title,
          description: tour.description,
          url: `${SITE_URL}/${locale}/tours/${tour.slug}`,
          image: primaryImage,
          currency: tour.currency,
          price: tour.base_price,
          itinerary: tour.itinerary.map((day) => ({
            title: day.title,
            description: day.description,
          })),
        })
      : null;

  return (
    <>
      <JsonLd data={touristTrip ? [breadcrumb, touristTrip] : [breadcrumb]} />
      <div className="mx-auto w-full max-w-6xl px-4 pt-8 sm:px-6 sm:pt-12">
        <TourBreadcrumb locale={locale as Locale} title={tour.title} />
      </div>
      <TourContent
        tour={tour}
        relatedTours={relatedTours}
        relatedHeading={t("tours.relatedTours")}
      />
    </>
  );
}
