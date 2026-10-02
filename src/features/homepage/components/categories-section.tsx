"use client";

import Image from "next/image";
import { useTranslation } from "react-i18next";
import type { HomepageCategory } from "@/features/homepage/types";
import { ScrollReveal } from "@/shared/components/ScrollReveal";

export function CategoriesSection({ categories }: { categories: HomepageCategory[] }) {
  const { t } = useTranslation("common");

  if (categories.length === 0) return null;

  return (
    <section id="categories" className="bg-sandstone" aria-labelledby="categories-title">
      <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6">
        <ScrollReveal className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-gold-dark">{t("homepage.categoriesEyebrow", "Find your experience")}</p>
            <h2 id="categories-title" className="font-heading text-3xl font-bold tracking-wider text-obsidian sm:text-4xl">{t("homepage.categoriesTitle", "Explore Egypt your way")}</h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-obsidian/55">{t("homepage.categoriesSubtitle", "Choose a category and start planning the journey that feels right for you.")}</p>
        </ScrollReveal>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, index) => (
            <ScrollReveal key={category.id} delay={index * 0.08}>
              <article className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-obsidian shadow-[0_16px_40px_rgba(26,26,24,0.12)]">
                <Image
                  src={category.imageUrl}
                  alt={category.name}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-obsidian/90 via-obsidian/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <h3 className="font-heading text-xl font-semibold">{category.name}</h3>
                </div>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
