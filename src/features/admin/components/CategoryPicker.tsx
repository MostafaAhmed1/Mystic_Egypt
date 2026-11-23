"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import type { TourCategoryOption } from "@/features/admin/service";
import type { Locale } from "@/core/i18n-config";
import { cn } from "@/core/utils";
import { useLocale } from "@/shared/hooks/use-locale";

interface CategoryPickerProps {
  categories: TourCategoryOption[];
  value: string;
  onChange: (categoryId: string) => void;
}

function categoryLabel(category: TourCategoryOption, locale: Locale): string {
  if (locale === "ar") return category.name_ar || category.name_en;
  if (locale === "de") return category.name_de || category.name_en;
  return category.name_en;
}

/** Lightweight searchable single-select built from existing primitives (no new deps). */
export function CategoryPicker({ categories, value, onChange }: CategoryPickerProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const { locale } = useLocale();

  const selected = categories.find((category) => category.id === value);
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return categories;
    return categories.filter(
      (category) =>
        categoryLabel(category, locale).toLowerCase().includes(needle) ||
        category.slug.toLowerCase().includes(needle),
    );
  }, [categories, query, locale]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  function choose(category: TourCategoryOption) {
    onChange(category.id);
    setQuery("");
    setOpen(false);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActive((current) => Math.min(current + 1, filtered.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((current) => Math.max(current - 1, 0));
    } else if (event.key === "Enter" && open && filtered[active]) {
      event.preventDefault();
      choose(filtered[active]);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls="tour-category-listbox"
          aria-autocomplete="list"
          value={open ? query : selected ? categoryLabel(selected, locale) : ""}
          placeholder="Search or select a category..."
          onFocus={() => {
            setOpen(true);
            setQuery("");
            setActive(0);
          }}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
            setActive(0);
          }}
          onKeyDown={handleKeyDown}
          className="h-10 w-full rounded-xl border bg-background px-3 pe-9 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
        <ChevronsUpDown
          className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
      </div>
      {open && (
        <ul
          id="tour-category-listbox"
          role="listbox"
          className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-xl border bg-popover p-1 shadow-lg"
        >
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-sm text-muted-foreground">No categories found.</li>
          ) : (
            filtered.map((category, index) => (
              <li key={category.id} role="option" aria-selected={category.id === value}>
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => choose(category)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-3 py-2 text-start text-sm hover:bg-muted",
                    index === active && "bg-muted",
                  )}
                >
                  <span>{categoryLabel(category, locale)}</span>
                  {category.id === value && <Check className="size-4 text-primary" aria-hidden />}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
