import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/core/lib/session";
import {
  getBookableTourBySlug,
  listAddons,
} from "@/features/booking/service";
import { CheckoutForm } from "@/features/booking/components/CheckoutForm";
import { formatCurrency } from "@/core/utils";

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
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <nav className="mb-6 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <span className="mx-2" aria-hidden>
          /
        </span>
        <Link href="/tours" className="hover:text-foreground">
          Tours
        </Link>
        <span className="mx-2" aria-hidden>
          /
        </span>
        <Link href={`/tours/${tour.slug}`} className="hover:text-foreground">
          {tour.title}
        </Link>
        <span className="mx-2" aria-hidden>
          /
        </span>
        <span className="text-foreground">Book</span>
      </nav>

      <header className="mb-8">
        <h1 className="font-heading text-2xl font-semibold sm:text-3xl">
          Book {tour.title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {formatCurrency(tour.base_price, tour.currency)} per person ·{" "}
          {user.name}
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
