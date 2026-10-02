"use client";

import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Compass } from "lucide-react";
import { TourCard } from "@/features/tour/components/TourCard";
import { TourSearchBar } from "@/features/tour/components/TourSearchBar";
import type { TourSummary } from "@/features/tour/types";

export function ToursListClient({ tours }: { tours: TourSummary[] }) {
  const { t } = useTranslation("common");

  return (
    <>
      {/* Cinematic hero header */}
      <div className="relative overflow-hidden bg-obsidian py-20 sm:py-28">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(212,175,55,0.15),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(31,58,147,0.1),transparent_40%)]" />
        </div>

        <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/10 px-4 py-2 text-sm text-gold">
              <Compass className="size-4" aria-hidden />
              {t("tours.exploreCollection", "Explore our collection")}
            </div>
            <h1 className="font-heading text-4xl font-bold tracking-wider text-white sm:text-5xl">
              {t("nav.tours")}
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-lg text-white/50">
              {t("tours.featuredSubtitle")}
            </p>
          </motion.div>

          {/* Search bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-10 flex justify-center"
          >
            <TourSearchBar />
          </motion.div>
        </div>
      </div>

      {/* Tours grid */}
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        {tours.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gold/20 bg-sand/20 py-20 text-center"
          >
            <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-gold/10">
              <Compass className="size-8 text-gold/40" aria-hidden />
            </div>
            <p className="font-heading text-lg font-semibold text-obsidian/60">
              {t("tours.noToursFound")}
            </p>
            <p className="mt-2 text-sm text-obsidian/40">
              {t("tours.tryDifferentSearch", "Try adjusting your search criteria")}
            </p>
          </motion.div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tours.map((tour, index) => (
              <motion.div
                key={tour.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <TourCard tour={tour} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
