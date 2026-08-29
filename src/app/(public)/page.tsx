import Link from "next/link";
import {
  Landmark,
  ShieldCheck,
  Wallet,
  CarFront,
} from "lucide-react";
import { listPublicTours } from "@/features/tour/service";
import { TourCard } from "@/features/tour/components/TourCard";
import { TourSearchBar } from "@/features/tour/components/TourSearchBar";

export const dynamic = "force-static";
export const revalidate = 300;

export default async function HomePage() {
  const tours = await listPublicTours();

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b bg-gradient-to-br from-amber-50 via-orange-50 to-stone-100">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-4 py-20 text-center sm:px-6 sm:py-28">
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            <Landmark className="size-3.5" aria-hidden />
            UK-registered · Egyptian experts
          </span>
          <h1 className="font-heading max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Explore Egypt like a local, protected by UK standards.
          </h1>
          <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
            No hidden fees. Authentic Egyptian adventures with transparent local pricing
            and British legal guarantees.
          </p>
          <div className="mt-8 w-full sm:flex sm:justify-center">
            <TourSearchBar />
          </div>
        </div>
      </section>

      {/* Featured tours */}
      {tours.length > 0 && (
        <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
                Featured tours
              </h2>
              <p className="mt-1 text-muted-foreground">
                Carefully selected journeys across Egypt
              </p>
            </div>
            <Link
              href="/tours"
              className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              View all tours
              <span aria-hidden>→</span>
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tours.map((tour) => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>
        </section>
      )}

      {/* Why us */}
      <section id="why-us" className="border-t bg-muted/40">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="font-heading mb-8 text-center text-2xl font-semibold tracking-tight sm:text-3xl">
            Why choose us
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            <WhyUsCard
              icon={<ShieldCheck className="size-6" aria-hidden />}
              title="UK Registered Entity"
              description="Book with full British legal guarantees and a verifiable, registered company behind every tour."
            />
            <WhyUsCard
              icon={<CarFront className="size-6" aria-hidden />}
              title="Hassle-Free Transfers"
              description="Door-to-door transfers, licensed guides, and every detail arranged — from the airport to your hotel."
            />
            <WhyUsCard
              icon={<Wallet className="size-6" aria-hidden />}
              title="Best Local Prices Guaranteed"
              description="Transparent local pricing with zero hidden fees and no tourist-trap markups. Ever."
            />
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
          <TrustBadge label="Secure payment" />
          <TrustBadge label="24/7 support" />
          <TrustBadge label="Licensed local guides" />
          <TrustBadge label="No hidden fees" />
        </div>
      </section>
    </>
  );
}

function WhyUsCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border bg-card p-6 text-center">
      <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="font-heading mb-2 font-medium">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function TrustBadge({ label }: { label: string }) {
  return <span className="inline-flex items-center gap-1.5">{label}</span>;
}
