"use client";

import Link from "next/link";
import { Tag } from "lucide-react";
import { useLocale } from "@/shared/hooks/use-locale";
import type { TourCategoryDto } from "@/features/tour/types";

/** Small category chip that links to the filtered category listing. */
export function CategoryBadge({
  category,
  className = "",
}: {
  category: TourCategoryDto | null;
  className?: string;
}) {
  const { locale, href } = useLocale();
  if (!category) return null;

  const name =
    locale === "ar"
      ? category.name_ar || category.name_en
      : locale === "de"
        ? category.name_de || category.name_en
        : category.name_en;

  return (
    <Link
      href={href(`/tours/category/${category.slug}`)}
      className={`inline-flex w-fit items-center gap-1.5 rounded-full border border-gold/20 bg-gold/5 px-3 py-1 text-xs font-medium text-gold-dark transition-colors hover:bg-gold/15 ${className}`}
    >
      <Tag className="size-3" aria-hidden />
      {name}
    </Link>
  );
}
