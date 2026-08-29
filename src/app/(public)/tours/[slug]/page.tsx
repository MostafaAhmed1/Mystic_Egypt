import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, X, CalendarCheck, SlidersHorizontal, Map as MapIcon } from "lucide-react";
import {
  getPublicTourBySlug,
  listPublicTourSlugs,
} from "@/features/tour/service";
import { formatCurrency } from "@/core/utils";
import { TourGallery } from "@/features/tour/components/TourGallery";
import { ItineraryAccordion } from "@/features/tour/components/ItineraryAccordion";
import { TourMapClient } from "@/features/tour/components/TourMapClient";
import { CustomizeTourDialog } from "@/features/tour/components/CustomizeTourDialog";

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

  const inclusions = splitList(tour.inclusions);
  const exclusions = splitList(tour.exclusions);
  const days = tour.itinerary.length;

  const tourSchema =
    tour.itinerary.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "TouristTrip",
          name: tour.title,
          description: tour.description,
          "touristType": "International and local travellers",
          itinerary: tour.itinerary.map((day) => ({
            "@type": "TouristAttraction",
            name: day.title,
            description: day.description,
          })),
          offers: {
            "@type": "Offer",
            price: tour.base_price,
            priceCurrency: tour.currency,
            availability: "https://schema.org/InStock",
          },
        }
      : null;

  return (
    <>
      {tourSchema && (
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(tourSchema) }}
        />
      )}

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
          <span className="text-foreground">{tour.title}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
          <div>
            <TourGallery images={tour.images} title={tour.title} />
          </div>

          <div className="flex flex-col gap-6">
            <div>
              <h1 className="font-heading text-3xl font-semibold tracking-tight">
                {tour.title}
              </h1>
              <p className="mt-3 text-muted-foreground">{tour.description}</p>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="font-heading text-3xl font-semibold">
                {formatCurrency(tour.base_price, tour.currency)}
              </span>
              <span className="text-sm text-muted-foreground">per person</span>
            </div>

            {days > 0 && (
              <p className="inline-flex w-fit items-center gap-2 rounded-full border bg-muted/40 px-3 py-1.5 text-sm text-muted-foreground">
                <MapIcon className="size-4" aria-hidden />
                {days === 1 ? "1 day" : `${days} days`}
              </p>
            )}

            <div className="flex flex-col gap-3">
              <Link
                href={`/tours/${tour.slug}/book`}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                <CalendarCheck className="size-4" aria-hidden />
                Book now
              </Link>
              <CustomizeTourDialog tourId={tour.id} tourTitle={tour.title} />
            </div>
          </div>
        </div>

        {/* Itinerary */}
        {tour.itinerary.length > 0 && (
          <section className="mt-12">
            <h2 className="font-heading mb-4 text-2xl font-semibold tracking-tight">
              Day-by-day itinerary
            </h2>
            <div className="rounded-2xl border p-4 sm:p-6">
              <ItineraryAccordion itinerary={tour.itinerary} />
            </div>
          </section>
        )}

        {/* What's included / excluded */}
        {(inclusions.length > 0 || exclusions.length > 0) && (
          <section className="mt-12 grid gap-6 md:grid-cols-2">
            {inclusions.length > 0 && (
              <div className="rounded-2xl border bg-card p-6">
                <h2 className="font-heading mb-4 flex items-center gap-2 text-lg font-semibold">
                  <Check className="size-5 text-emerald-600" aria-hidden />
                  What&apos;s included
                </h2>
                <ul className="space-y-2 text-sm">
                  {inclusions.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-hidden />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {exclusions.length > 0 && (
              <div className="rounded-2xl border bg-card p-6">
                <h2 className="font-heading mb-4 flex items-center gap-2 text-lg font-semibold">
                  <X className="size-5 text-rose-600" aria-hidden />
                  What&apos;s not included
                </h2>
                <ul className="space-y-2 text-sm">
                  {exclusions.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <X className="mt-0.5 size-4 shrink-0 text-rose-600" aria-hidden />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        {/* Route map */}
        {tour.route.length > 0 && (
          <section className="mt-12">
            <h2 className="font-heading mb-4 text-2xl font-semibold tracking-tight">
              Journey map
            </h2>
            <TourMapClient route={tour.route} />
          </section>
        )}

        {/* Bottom CTA */}
        <div className="mt-12 rounded-2xl border bg-muted/40 p-6 text-center sm:p-10">
          <h2 className="font-heading text-xl font-semibold sm:text-2xl">
            Ready to explore {tour.title}?
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
            Transparent local pricing, UK-registered guarantees, and a dedicated local team
            from the first enquiry to the last milestone.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href={`/tours/${tour.slug}/book`}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <CalendarCheck className="size-4" aria-hidden />
              Book now
            </Link>
            <CustomizeTourDialog tourId={tour.id} tourTitle={tour.title} />
          </div>
        </div>
      </div>
    </>
  );
}

function splitList(value: string | null): string[] {
  if (!value) return [];
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}
