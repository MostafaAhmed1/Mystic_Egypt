import type { Metadata } from "next";
import { listPublicTours } from "@/features/tour/service";
import { HomePageClient } from "@/app/[locale]/(public)/home-page-client";
import { buildAlternates } from "@/core/utils/seo";
import type { Locale } from "@/core/i18n-config";

export const dynamic = "force-static";
export const revalidate = 300;

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const { locale } = await params;
  const alternates = buildAlternates("/", locale as Locale);

  return {
    title: "Mystic Egypt | Luxury Tours & Authentic Egyptian Experiences",
    description:
      "Book authentic, luxurious tours across Egypt — from the Pyramids of Giza to the White Desert. UK-registered with local Egyptian experts. Transparent pricing, no hidden fees.",
    openGraph: {
      title: "Mystic Egypt | Luxury Tours & Authentic Egyptian Experiences",
      description:
        "Book authentic, luxurious tours across Egypt — from the Pyramids of Giza to the White Desert. UK-registered with local Egyptian experts.",
      url: `https://mysticegypt.net/${locale}`,
      siteName: "Mystic Egypt",
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Mystic Egypt | Luxury Tours & Authentic Egyptian Experiences",
      description:
        "Book authentic, luxurious tours across Egypt — from the Pyramids of Giza to the White Desert. UK-registered with local Egyptian experts.",
    },
    ...alternates,
  };
}

export default async function HomePage() {
  const tours = await listPublicTours();

  return <HomePageClient tours={tours} />;
}
