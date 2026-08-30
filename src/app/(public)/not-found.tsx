import Link from "next/link";
import { MapPin } from "lucide-react";

export default function NotFound() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-stone-100">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-4 py-24 text-center sm:px-6 sm:py-32">
        <span className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
          <MapPin className="size-3.5" aria-hidden />
          Lost in the Desert
        </span>
        <h1 className="font-heading text-7xl font-bold tracking-tight text-primary/20 sm:text-9xl">
          404
        </h1>
        <h2 className="mt-4 font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
          Page Not Found
        </h2>
        <p className="mt-3 max-w-md text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back on track.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            Back to Home
          </Link>
          <Link
            href="/tours"
            className="inline-flex items-center justify-center rounded-md border border-border bg-background px-6 py-3 text-sm font-medium shadow-sm transition-colors hover:bg-accent"
          >
            Browse Tours
          </Link>
        </div>
      </div>
    </section>
  );
}
