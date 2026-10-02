"use client";

import { motion } from "framer-motion";
import { TourCard } from "@/features/tour/components/TourCard";
import type { TourSummary } from "@/features/tour/types";

interface RelatedToursProps {
  tours: TourSummary[];
  /** Localized section heading, translated server-side by the page. */
  heading: string;
}

/**
 * Related tours for a tour detail page. Rendered inside TourContent's
 * container so it inherits the page's existing section rhythm.
 *
 * The data is fetched server-side and passed in as a prop, so the internal
 * links are present in the initial HTML (crawlable without JS). Cards are
 * rendered with lazy images because the section is always below the fold.
 */
export function RelatedTours({ tours, heading }: RelatedToursProps) {
  if (tours.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="mt-16"
      aria-labelledby="related-tours-heading"
    >
      <h2
        id="related-tours-heading"
        className="font-heading mb-6 text-2xl font-bold tracking-wider text-obsidian"
      >
        {heading}
      </h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {tours.map((tour) => (
          <TourCard key={tour.id} tour={tour} />
        ))}
      </div>
    </motion.section>
  );
}
