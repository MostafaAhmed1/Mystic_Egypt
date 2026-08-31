import type { Metadata } from "next";
import { listPublicTours } from "@/features/tour/service";
import { HomePageClient } from "@/app/[locale]/(public)/home-page-client";

export const dynamic = "force-static";
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Mystic Egypt | Luxury Tours & Authentic Egyptian Experiences",
  description:
    "Book authentic, luxurious tours across Egypt — from the Pyramids of Giza to the White Desert. UK-registered with local Egyptian experts. Transparent pricing, no hidden fees.",
  openGraph: {
    title: "Mystic Egypt | Luxury Tours & Authentic Egyptian Experiences",
    description:
      "Book authentic, luxurious tours across Egypt — from the Pyramids of Giza to the White Desert. UK-registered with local Egyptian experts.",
    url: "https://mysticegypt.net",
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
};

export default async function HomePage() {
  const tours = await listPublicTours();

  return <HomePageClient tours={tours} />;
}
