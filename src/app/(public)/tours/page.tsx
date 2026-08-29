import type { Metadata } from "next";
import { listPublicTours } from "@/features/tour/service";
import { TourCard } from "@/features/tour/components/TourCard";
import { TourSearchBar } from "@/features/tour/components/TourSearchBar";

export const metadata: Metadata = {
  title: "Tours",
  description:
    "Browse authentic Egyptian tours — from the Pyramids of Giza to the White Desert — with transparent local pricing.",
};

type ToursPageProps = {
  searchParams: Promise<{ q?: string; maxPrice?: string }>;
};

function normalizePrice(value: string | undefined): number | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

export default async function ToursPage({ searchParams }: ToursPageProps) {
  const { q, maxPrice } = await searchParams;
  const query = q?.trim().toLowerCase() ?? "";
  const budget = normalizePrice(maxPrice);

  const tours = await listPublicTours();
  const filtered = tours.filter((tour) => {
    const matchesQuery =
      !query ||
      tour.title.toLowerCase().includes(query) ||
      tour.description.toLowerCase().includes(query);
    const matchesBudget = budget === null || tour.base_price <= budget;
    return matchesQuery && matchesBudget;
  });

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Tours</h1>
        <p className="mt-2 text-muted-foreground">
          Authentic journeys across Egypt with transparent local pricing.
        </p>
      </div>

      <div className="mb-8">
        <TourSearchBar />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-12 text-center text-muted-foreground">
          {query || budget !== null
            ? "No tours match your search. Try adjusting your destination or budget."
            : "No tours are available right now. Please check back soon."}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((tour) => (
            <TourCard key={tour.id} tour={tour} />
          ))}
        </div>
      )}
    </div>
  );
}
