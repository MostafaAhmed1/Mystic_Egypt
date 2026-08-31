import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getPublicTourBySlug,
  listPublicTourSlugs,
} from "@/features/tour/service";
import { TourContent } from "@/features/tour/components/TourContent";

export const dynamicParams = true;
export const revalidate = 300;

export async function generateStaticParams() {
  const slugs = await listPublicTourSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tour = await getPublicTourBySlug(slug);
  if (!tour) return { title: "Tour not found" };

  return {
    title: tour.title,
    description: tour.description,
    openGraph: {
      title: tour.title,
      description: tour.description,
      url: `https://mysticegypt.net/tours/${tour.slug}`,
      siteName: "Mystic Egypt",
      locale: "en_US",
      type: "article",
    },
  };
}

export default async function TourPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tour = await getPublicTourBySlug(slug);

  if (!tour) {
    notFound();
  }

  return <TourContent tour={tour} />;
}
