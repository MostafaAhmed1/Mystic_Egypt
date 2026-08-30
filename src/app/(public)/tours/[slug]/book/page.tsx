import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireUser } from "@/core/lib/session";
import {
  getBookableTourBySlug,
  listAddons,
} from "@/features/booking/service";
import { BookPageClient } from "@/app/(public)/tours/[slug]/book/book-page-client";

export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  return {
    title: "Book your tour",
  };
}

export default async function BookPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Step 3 of the checkout flow: login is mandatory before payment.
  const user = await requireUser();

  const tour = await getBookableTourBySlug(slug);
  if (!tour) {
    notFound();
  }

  const addons = await listAddons();

  const stripePublishableKey = process.env.STRIPE_PUBLISHABLE_KEY ?? "";

  return (
    <BookPageClient
      tour={tour}
      addons={addons}
      userName={user.name}
      stripePublishableKey={stripePublishableKey}
    />
  );
}
