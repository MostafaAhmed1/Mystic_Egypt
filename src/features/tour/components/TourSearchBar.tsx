"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Search, Wallet, ArrowRight } from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import { useLocale } from "@/shared/hooks/use-locale";

export function TourSearchBar() {
  const router = useRouter();
  const { t } = useTranslation("common");
  const { href } = useLocale();
  const [query, setQuery] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (maxPrice.trim()) params.set("maxPrice", maxPrice.trim());
    const queryString = params.toString();
    router.push(queryString ? href(`/tours?${queryString}`) : href("/tours"));
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-3xl flex-col gap-3 rounded-2xl border border-white/20 bg-white/10 p-3 shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-xl sm:flex-row sm:items-center"
    >
      <label className="group flex flex-1 items-center gap-3 rounded-xl bg-white/5 px-4 py-3 transition-all duration-300 focus-within:bg-white/10 focus-within:ring-1 focus-within:ring-gold/50">
        <Search className="size-5 shrink-0 text-gold/60 transition-colors group-focus-within:text-gold" aria-hidden />
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("tours.searchTours")}
          className="h-auto border-0 bg-transparent px-0 text-white placeholder:text-white/40 shadow-none focus-visible:ring-0"
        />
      </label>
      <label className="group flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3 transition-all duration-300 focus-within:bg-white/10 focus-within:ring-1 focus-within:ring-gold/50 sm:w-52">
        <Wallet className="size-5 shrink-0 text-gold/60 transition-colors group-focus-within:text-gold" aria-hidden />
        <Input
          type="number"
          inputMode="numeric"
          min={0}
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          placeholder={t("tours.maxBudget", "Max budget (USD)")}
          className="h-auto border-0 bg-transparent px-0 text-white placeholder:text-white/40 shadow-none focus-visible:ring-0"
        />
      </label>
      <button
        type="submit"
        className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gold px-6 text-sm font-semibold text-obsidian shadow-[0_4px_20px_rgba(212,175,55,0.3)] transition-all duration-300 hover:bg-gold-light hover:shadow-[0_4px_30px_rgba(212,175,55,0.5)] sm:ms-1"
      >
        {t("tours.searchTours")}
        <ArrowRight className="size-4" aria-hidden />
      </button>
    </form>
  );
}
